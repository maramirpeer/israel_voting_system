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

export function registerMemberSignupRoutes(app: Express) {
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

    if (!email && !phone) {
      res.status(400).json({ error: "יש למלא אימייל או טלפון" });
      return;
    }

    const now = new Date().toISOString();
    const store = await readStore();
    const existingIndex = store.submissions.findIndex((signup) => {
      const sameNationalId = signup.nationalId === nationalId;
      const sameEmail = email && signup.email.toLowerCase() === email;
      const samePhone = phone && signup.phone === phone;
      return sameNationalId || sameEmail || samePhone;
    });

    if (existingIndex >= 0) {
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
    res.json({ ok: true, count: store.submissions.length });
  });
}
