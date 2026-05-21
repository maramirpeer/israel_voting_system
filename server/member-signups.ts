import type { Express, Request, Response } from "express";
import { createHash, randomUUID } from "crypto";
import { timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { count, eq, or } from "drizzle-orm";
import { getDb } from "./db";
import { memberSignups } from "../drizzle/schema";
import { getContactEmailTo, sendEmail } from "./email";

type LocalMemberSignup = {
  id: string;
  fullName: string;
  nationalId?: string;
  email: string;
  phone: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type PublicMemberSignup = {
  fullName: string;
  nationalId?: string;
  email: string;
};

type SignupStore = {
  submissions: LocalMemberSignup[];
};

type AdminMemberSignup = {
  id: string | number;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string | null;
  note: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "member-signups.json");
const memberTarget = 180000;
const allowLocalSignupStore = process.env.ALLOW_LOCAL_SIGNUP_STORE === "true";
const configuredMemberCountDisplayOffset = Number(process.env.MEMBER_SIGNUP_DISPLAY_OFFSET ?? "1");
const memberCountDisplayOffset = Number.isFinite(configuredMemberCountDisplayOffset)
  ? Math.max(0, configuredMemberCountDisplayOffset)
  : 1;
const foundingMemberName = "אמיר פ";
const legacyFoundingMemberNames = new Set(["א. פ", "א. פ."]);
let memberSignupTableReady = false;
const publicNamesLimit = 250;
const signupRateLimitWindowMs = 60_000;
const signupRateLimitMax = 10;
const signupRateLimits = new Map<string, { count: number; resetAt: number }>();

class SignupStorageUnavailableError extends Error {
  statusCode = 503;

  constructor(operation: string) {
    super(
      `Signup storage is not connected for ${operation}. Set DATABASE_URL on the production server before collecting signups.`,
    );
  }
}

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getPublicDisplayName(fullName: string) {
  const normalizedName = fullName.trim();

  if (legacyFoundingMemberNames.has(normalizedName)) {
    return foundingMemberName;
  }

  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = nameParts[0] || "";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";

  return [firstName, lastInitial].filter(Boolean).join(" ");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidAdminToken(req: Request) {
  const expected = process.env.ADMIN_SIGNUPS_TOKEN;
  const provided = normalize(req.header("x-admin-token") || req.header("authorization")?.replace(/^Bearer\s+/i, ""));

  if (!expected || !provided) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

function getClientIp(req: Request) {
  const forwardedFor = req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
}

function isSignupRateLimited(req: Request) {
  const now = Date.now();
  const key = getClientIp(req);
  const current = signupRateLimits.get(key);

  if (!current || current.resetAt <= now) {
    signupRateLimits.set(key, { count: 1, resetAt: now + signupRateLimitWindowMs });
    return false;
  }

  current.count += 1;
  return current.count > signupRateLimitMax;
}

async function readLocalStore(): Promise<SignupStore> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as SignupStore;
    return { submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [] };
  } catch {
    return { submissions: [] };
  }
}

async function writeLocalStore(store: SignupStore) {
  if (!allowLocalSignupStore) {
    throw new SignupStorageUnavailableError("local fallback write");
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function handleDbUnavailable(operation: string, error: unknown) {
  console.warn(`[MemberSignups] Database ${operation} failed:`, error);

  if (!allowLocalSignupStore) {
    throw new SignupStorageUnavailableError(operation);
  }
}

function requireSignupStorage(operation: string) {
  if (!allowLocalSignupStore) {
    throw new SignupStorageUnavailableError(operation);
  }
}

function getPublicMemberName(signup: PublicMemberSignup) {
  if (signup.email.toLowerCase() === "amir_peer@hotmail.com") {
    return foundingMemberName;
  }

  return getPublicDisplayName(signup.fullName);
}

function getPublicMemberNamesFromRows(rows: PublicMemberSignup[]) {
  const names = rows.map(getPublicMemberName).filter(Boolean);

  if (!names.includes(foundingMemberName)) {
    names.unshift(foundingMemberName);
  }

  return Array.from(new Set(names));
}

function getDisplayedMemberCount(rawCount: number) {
  return Math.max(1, rawCount - memberCountDisplayOffset);
}

async function ensureMemberSignupTable() {
  const db = await getDb();

  if (!db || memberSignupTableReady) {
    return db;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`memberSignups\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`fullName\` varchar(255) NOT NULL,
      \`nationalId\` varchar(32) NOT NULL,
      \`email\` varchar(320) NOT NULL,
      \`phone\` varchar(64),
      \`note\` text,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`memberSignups_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`memberSignups_nationalId_unique\` UNIQUE(\`nationalId\`),
      CONSTRAINT \`memberSignups_email_unique\` UNIQUE(\`email\`),
      CONSTRAINT \`memberSignups_phone_unique\` UNIQUE(\`phone\`)
    )
  `);

  memberSignupTableReady = true;
  return db;
}

async function getPublicMemberNames() {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("public names read");
  }

  if (db) {
    try {
      const rows = await db
        .select({
          fullName: memberSignups.fullName,
          nationalId: memberSignups.nationalId,
          email: memberSignups.email,
        })
        .from(memberSignups)
        .orderBy(memberSignups.id)
        .limit(publicNamesLimit);

      return getPublicMemberNamesFromRows(rows);
    } catch (error) {
      handleDbUnavailable("read", error);
    }
  }

  const store = await readLocalStore();
  return getPublicMemberNamesFromRows(store.submissions);
}

async function getPublicMemberCount() {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("public count read");
  }

  if (db) {
    try {
      const [total] = await db.select({ value: count() }).from(memberSignups);
      const foundingRows = await db
        .select({ id: memberSignups.id })
        .from(memberSignups)
        .where(or(eq(memberSignups.nationalId, "033012535"), eq(memberSignups.email, "amir_peer@hotmail.com")))
        .limit(1);
      const includesFoundingMember = foundingRows.length > 0;

      const rawCount = (total?.value || 0) + (includesFoundingMember ? 0 : 1);
      return getDisplayedMemberCount(rawCount);
    } catch (error) {
      handleDbUnavailable("count", error);
    }
  }

  const store = await readLocalStore();
  const includesFoundingMember = store.submissions.some(
    (signup) => signup.email.toLowerCase() === "amir_peer@hotmail.com",
  );

  const rawCount = store.submissions.length + (includesFoundingMember ? 0 : 1);
  return getDisplayedMemberCount(rawCount);
}

async function saveSignup(input: {
  fullName: string;
  email: string;
  phone: string;
  note: string;
}) {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("setup", error);
    return null;
  });
  const storedFullName = input.fullName;
  const signupKey = createHash("sha256").update(input.email).digest("hex").slice(0, 32);

  if (!db) {
    requireSignupStorage("signup write");
  }

  if (db) {
    try {
      const samePerson = input.phone
        ? or(eq(memberSignups.email, input.email), eq(memberSignups.phone, input.phone))
        : eq(memberSignups.email, input.email);

      const existing = await db.select().from(memberSignups).where(samePerson).limit(1);
      const isNewSignup = existing.length === 0;

      if (isNewSignup) {
        await db.insert(memberSignups).values({
          fullName: storedFullName,
          nationalId: signupKey,
          email: input.email,
          phone: input.phone || null,
          note: input.note || null,
        });
      } else {
        await db
          .update(memberSignups)
          .set({
            fullName: storedFullName,
            nationalId: signupKey,
            email: input.email,
            phone: input.phone || null,
            note: input.note || null,
            updatedAt: new Date(),
          })
          .where(eq(memberSignups.id, existing[0].id));
      }

      return { isNewSignup };
    } catch (error) {
      handleDbUnavailable("write", error);
    }
  }

  const now = new Date().toISOString();
  const store = await readLocalStore();
  const existingIndex = store.submissions.findIndex((signup) => {
    const sameEmail = signup.email.toLowerCase() === input.email;
    const samePhone = input.phone && signup.phone === input.phone;
    return sameEmail || samePhone;
  });
  const isNewSignup = existingIndex < 0;

  if (!isNewSignup) {
    store.submissions[existingIndex] = {
      ...store.submissions[existingIndex],
      ...input,
      fullName: storedFullName,
      nationalId: signupKey,
      updatedAt: now,
    };
  } else {
    store.submissions.push({
      id: randomUUID(),
      ...input,
      fullName: storedFullName,
      nationalId: signupKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeLocalStore(store);
  return { isNewSignup };
}

async function getAdminSignups() {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("admin setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("admin read");
  }

  if (db) {
    try {
      const rows = await db.select().from(memberSignups).orderBy(memberSignups.id);
      return { source: "database", submissions: rows as AdminMemberSignup[] };
    } catch (error) {
      handleDbUnavailable("admin read", error);
    }
  }

  const store = await readLocalStore();
  return { source: "local", submissions: store.submissions as AdminMemberSignup[] };
}

function buildWelcomeEmail(fullName: string, count: number) {
  return {
    subject: "ברוכים הבאים לגרעין המייסד של קול משותף",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h1 style="color:#1e3a8a">ברוכים הבאים, ${fullName}</h1>
        <p>תודה על ההצטרפות לגרעין המייסד של קול משותף.</p>
        <p>הרשמתך נשמרה, והמד עלה ל-<strong>${count.toLocaleString("he-IL")}</strong> נרשמים מתוך יעד של <strong>${memberTarget.toLocaleString("he-IL")}</strong>.</p>
        <p>נשתמש במייל הזה לעדכונים עתידיים על התקדמות היוזמה, בצורה מדודה ולא מציפה.</p>
        <p>מספר הנרשמים משמש אומדן לכוח ציבורי אפשרי, ואינו מהווה סקר, תחזית או הבטחת הצבעה בפועל.</p>
      </div>
    `,
    text: `ברוכים הבאים, ${fullName}. תודה על ההצטרפות לגרעין המייסד של קול משותף. הרשמתך נשמרה, והמד עלה ל-${count.toLocaleString("he-IL")} נרשמים מתוך יעד של ${memberTarget.toLocaleString("he-IL")}. נשתמש במייל הזה לעדכונים עתידיים על התקדמות היוזמה.`,
  };
}

async function sendWelcomeEmail(to: string, fullName: string, count: number) {
  const message = buildWelcomeEmail(fullName, count);
  return sendEmail({ to, subject: message.subject, html: message.html, text: message.text });
}

async function sendSignupNotification(input: {
  fullName: string;
  email: string;
  phone: string;
  note: string;
  count: number;
  isNewSignup: boolean;
}) {
  const to = getContactEmailTo();

  if (!to) {
    console.warn("[MemberSignups] Signup notification recipient is not configured. Set CONTACT_EMAIL_TO.");
    return false;
  }

  const action = input.isNewSignup ? "הרשמה חדשה" : "עדכון הרשמה קיימת";
  const safeFullName = escapeHtml(input.fullName);
  const safeEmail = escapeHtml(input.email);
  const safePhone = escapeHtml(input.phone || "לא נמסר");
  const safeNote = escapeHtml(input.note).replace(/\n/g, "<br />");

  return sendEmail({
    to,
    replyTo: input.email,
    subject: `${action} לקול משותף`,
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h1 style="color:#17324d">${action}</h1>
        <p><strong>שם שנמסר בטופס:</strong> ${safeFullName}</p>
        <p><strong>אימייל:</strong> ${safeEmail}</p>
        <p><strong>טלפון:</strong> ${safePhone}</p>
        <p><strong>מספר נרשמים מוצג:</strong> ${input.count.toLocaleString("he-IL")}</p>
        ${input.note ? `<p><strong>הערה:</strong><br />${safeNote}</p>` : ""}
      </div>
    `,
    text: `${action}\n\nשם שנמסר בטופס: ${input.fullName}\nאימייל: ${input.email}\nטלפון: ${input.phone || "לא נמסר"}\nמספר נרשמים מוצג: ${input.count.toLocaleString("he-IL")}\n\n${input.note ? `הערה:\n${input.note}` : ""}`,
  });
}

function sendSignupRouteError(res: Response, error: unknown) {
  if (error instanceof SignupStorageUnavailableError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error("[MemberSignups] Unexpected route error:", error);
  res.status(500).json({ error: "Signup service is unavailable right now." });
}

export function registerMemberSignupRoutes(app: Express) {
  app.get("/api/admin/member-signups", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const result = await getAdminSignups();
      res.json({
        ok: true,
        source: result.source,
        count: result.submissions.length,
        submissions: result.submissions,
      });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.get("/api/member-signups/count", async (_req: Request, res: Response) => {
    try {
      const count = await getPublicMemberCount();
      res.json({ ok: true, count, target: memberTarget });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.get("/api/member-signups/names", async (_req: Request, res: Response) => {
    try {
      const names = await getPublicMemberNames();
      res.json({ ok: true, names });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/member-signups", async (req: Request, res: Response) => {
    if (isSignupRateLimited(req)) {
      res.status(429).json({ error: "יותר מדי ניסיונות הרשמה בזמן קצר. נסה שוב בעוד דקה." });
      return;
    }

    const fullName = normalize(req.body.fullName);
    const email = normalize(req.body.email).toLowerCase();
    const phone = normalize(req.body.phone);
    const note = normalize(req.body.note);

    if (!fullName) {
      res.status(400).json({ error: "יש למלא שם מלא" });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "יש למלא אימייל תקין כדי לקבל אישור הרשמה ועדכונים עתידיים" });
      return;
    }

    try {
      const { isNewSignup } = await saveSignup({ fullName, email, phone, note });
      const publicMemberCount = await getPublicMemberCount();
      const emailSent = await sendWelcomeEmail(email, fullName, publicMemberCount).catch((error) => {
        console.warn("[MemberSignups] Welcome email error:", error);
        return false;
      });
      const notificationSent = await sendSignupNotification({
        fullName,
        email,
        phone,
        note,
        count: publicMemberCount,
        isNewSignup,
      }).catch((error) => {
        console.warn("[MemberSignups] Signup notification error:", error);
        return false;
      });

      res.json({ ok: true, count: publicMemberCount, isNewSignup, emailSent, notificationSent });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });
}
