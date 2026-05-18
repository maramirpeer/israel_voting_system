import type { Express, Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { eq, or } from "drizzle-orm";
import { getDb } from "./db";
import { memberSignups } from "../drizzle/schema";

type LocalMemberSignup = {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type PublicMemberSignup = {
  fullName: string;
  nationalId: string;
  email: string;
};

type SignupStore = {
  submissions: LocalMemberSignup[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "member-signups.json");
const memberTarget = 180000;
const foundingMemberName = "אמיר פאר";
let memberSignupTableReady = false;

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function getPublicMemberName(signup: PublicMemberSignup) {
  if (signup.nationalId === "033012535" || signup.email.toLowerCase() === "amir_peer@hotmail.com") {
    return foundingMemberName;
  }

  return signup.fullName;
}

function getPublicMemberNamesFromRows(rows: PublicMemberSignup[]) {
  const names = rows.map(getPublicMemberName).filter(Boolean);

  if (!names.includes(foundingMemberName)) {
    names.unshift(foundingMemberName);
  }

  return Array.from(new Set(names));
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
    console.warn("[MemberSignups] Database setup failed, using local fallback:", error);
    return null;
  });

  if (db) {
    try {
      const rows = await db
        .select({
          fullName: memberSignups.fullName,
          nationalId: memberSignups.nationalId,
          email: memberSignups.email,
        })
        .from(memberSignups)
        .orderBy(memberSignups.id);

      return getPublicMemberNamesFromRows(rows);
    } catch (error) {
      console.warn("[MemberSignups] Database read failed, using local fallback:", error);
    }
  }

  const store = await readLocalStore();
  return getPublicMemberNamesFromRows(store.submissions);
}

async function saveSignup(input: {
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  note: string;
}) {
  const db = await ensureMemberSignupTable().catch((error) => {
    console.warn("[MemberSignups] Database setup failed, using local fallback:", error);
    return null;
  });

  if (db) {
    try {
      const samePerson = input.phone
        ? or(
            eq(memberSignups.nationalId, input.nationalId),
            eq(memberSignups.email, input.email),
            eq(memberSignups.phone, input.phone),
          )
        : or(eq(memberSignups.nationalId, input.nationalId), eq(memberSignups.email, input.email));

      const existing = await db.select().from(memberSignups).where(samePerson).limit(1);
      const isNewSignup = existing.length === 0;

      if (isNewSignup) {
        await db.insert(memberSignups).values({
          fullName: input.fullName,
          nationalId: input.nationalId,
          email: input.email,
          phone: input.phone || null,
          note: input.note || null,
        });
      } else {
        await db
          .update(memberSignups)
          .set({
            fullName: input.fullName,
            nationalId: input.nationalId,
            email: input.email,
            phone: input.phone || null,
            note: input.note || null,
            updatedAt: new Date(),
          })
          .where(eq(memberSignups.id, existing[0].id));
      }

      return { isNewSignup };
    } catch (error) {
      console.warn("[MemberSignups] Database write failed, using local fallback:", error);
    }
  }

  const now = new Date().toISOString();
  const store = await readLocalStore();
  const existingIndex = store.submissions.findIndex((signup) => {
    const sameNationalId = signup.nationalId === input.nationalId;
    const sameEmail = signup.email.toLowerCase() === input.email;
    const samePhone = input.phone && signup.phone === input.phone;
    return sameNationalId || sameEmail || samePhone;
  });
  const isNewSignup = existingIndex < 0;

  if (!isNewSignup) {
    store.submissions[existingIndex] = {
      ...store.submissions[existingIndex],
      ...input,
      updatedAt: now,
    };
  } else {
    store.submissions.push({
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeLocalStore(store);
  return { isNewSignup };
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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MEMBER_SIGNUP_EMAIL_FROM || process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("[MemberSignups] Email provider is not configured. Set RESEND_API_KEY and MEMBER_SIGNUP_EMAIL_FROM.");
    return false;
  }

  const message = buildWelcomeEmail(fullName, count);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.warn(`[MemberSignups] Welcome email failed (${response.status}): ${detail}`);
    return false;
  }

  return true;
}

export function registerMemberSignupRoutes(app: Express) {
  app.get("/api/member-signups/count", async (_req: Request, res: Response) => {
    const names = await getPublicMemberNames();
    res.json({ ok: true, count: names.length, target: memberTarget });
  });

  app.get("/api/member-signups/names", async (_req: Request, res: Response) => {
    const names = await getPublicMemberNames();
    res.json({ ok: true, names });
  });

  app.post("/api/member-signups", async (req: Request, res: Response) => {
    const fullName = normalize(req.body.fullName);
    const nationalId = normalize(req.body.nationalId).replace(/\D/g, "");
    const email = normalize(req.body.email).toLowerCase();
    const phone = normalize(req.body.phone);
    const note = normalize(req.body.note);

    if (!fullName) {
      res.status(400).json({ error: "יש למלא שם מלא" });
      return;
    }

    if (!nationalId) {
      res.status(400).json({ error: "יש למלא תעודת זהות" });
      return;
    }

    if (!email) {
      res.status(400).json({ error: "יש למלא אימייל כדי לקבל אישור הרשמה ועדכונים עתידיים" });
      return;
    }

    const { isNewSignup } = await saveSignup({ fullName, nationalId, email, phone, note });
    const publicMemberNames = await getPublicMemberNames();
    const publicMemberCount = publicMemberNames.length;
    const emailSent = await sendWelcomeEmail(email, fullName, publicMemberCount).catch((error) => {
      console.warn("[MemberSignups] Welcome email error:", error);
      return false;
    });

    res.json({ ok: true, count: publicMemberCount, isNewSignup, emailSent });
  });
}
