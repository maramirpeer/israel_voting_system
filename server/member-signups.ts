import type { Express, Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type MemberSignup = {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  phone: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

type SignupStore = {
  submissions: MemberSignup[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "member-signups.json");
const memberTarget = 180000;
const foundingMemberName = "אמיר פאר";

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function readStore(): Promise<SignupStore> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as SignupStore;
    return { submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [] };
  } catch {
    return { submissions: [] };
  }
}

async function writeStore(store: SignupStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function getPublicMemberName(signup: MemberSignup) {
  if (signup.nationalId === "033012535" || signup.email.toLowerCase() === "amir_peer@hotmail.com") {
    return foundingMemberName;
  }

  return signup.fullName;
}

function getPublicMemberNames(store: SignupStore) {
  const names = store.submissions
    .map(getPublicMemberName)
    .filter(Boolean);

  if (!names.includes(foundingMemberName)) {
    names.unshift(foundingMemberName);
  }

  return Array.from(new Set(names));
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
    const store = await readStore();
    res.json({ ok: true, count: getPublicMemberNames(store).length, target: memberTarget });
  });

  app.get("/api/member-signups/names", async (_req: Request, res: Response) => {
    const store = await readStore();
    res.json({ ok: true, names: getPublicMemberNames(store) });
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

    const now = new Date().toISOString();
    const store = await readStore();
    const existingIndex = store.submissions.findIndex((signup) => {
      const sameNationalId = signup.nationalId === nationalId;
      const sameEmail = signup.email.toLowerCase() === email;
      const samePhone = phone && signup.phone === phone;
      return sameNationalId || sameEmail || samePhone;
    });
    const isNewSignup = existingIndex < 0;

    if (!isNewSignup) {
      store.submissions[existingIndex] = {
        ...store.submissions[existingIndex],
        fullName,
        nationalId,
        email,
        phone,
        note,
        updatedAt: now,
      };
    } else {
      store.submissions.push({
        id: randomUUID(),
        fullName,
        nationalId,
        email,
        phone,
        note,
        createdAt: now,
        updatedAt: now,
      });
    }

    await writeStore(store);
    const publicMemberCount = getPublicMemberNames(store).length;
    const emailSent = await sendWelcomeEmail(email, fullName, publicMemberCount)
      .catch((error) => {
        console.warn("[MemberSignups] Welcome email error:", error);
        return false;
      });

    res.json({ ok: true, count: publicMemberCount, isNewSignup, emailSent });
  });
}
