import type { Express, Request, Response } from "express";
import { createHash, randomBytes, randomUUID } from "crypto";
import { timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { and, count, eq, isNotNull, isNull, like, or } from "drizzle-orm";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getDb, upsertUser } from "./db";
import { candidateEnlistments, memberSignups } from "../drizzle/schema";
import { getContactEmailTo, isEmailConfigured, sendEmail } from "./email";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

type LocalMemberSignup = {
  id: string;
  fullName: string;
  nationalId?: string;
  email: string;
  phone: string;
  note: string;
  emailConfirmedAt?: string | null;
  confirmationTokenHash?: string | null;
  confirmationSentAt?: string | null;
  welcomeEmailSentAt?: string | null;
  notificationSentAt?: string | null;
  referralCode?: string | null;
  referredByCode?: string | null;
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
  emailConfirmedAt: string | Date | null;
  confirmationSentAt: string | Date | null;
  welcomeEmailSentAt: string | Date | null;
  notificationSentAt: string | Date | null;
  referralCode: string | null;
  referredByCode: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type AdminCandidateEnlistment = {
  id: string | number;
  fullName: string;
  nationalId: string;
  email: string;
  includedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type ReferralStatsLevel = {
  level: string;
  title: string;
  count: number;
  weight: string;
  credit: number;
};

type ReferralStatsRow = {
  fullName?: string | null;
  email?: string | null;
  referralCode?: string | null;
  referredByCode?: string | null;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "member-signups.json");
const memberTarget = 180000;
const allowLocalSignupStore = process.env.ALLOW_LOCAL_SIGNUP_STORE === "true";
const foundingMemberName = "אמיר פ";
const legacyFoundingMemberNames = new Set(["א. פ", "א. פ."]);
let memberSignupTableReady = false;
let candidateEnlistmentTableReady = false;
const memberEmailSuggestionsLimit = 8;
const signupRateLimitWindowMs = 60_000;
const signupRateLimitMax = 10;
const signupRateLimits = new Map<string, { count: number; resetAt: number }>();
const confirmationTokenBytes = 32;
const referralCreditWeights = [1, 0.5, 0.25];
const referralLevelLabels = [
  { level: "רמה 1", title: "חברים שהצטרפו ישירות דרכך", weight: "100%" },
  { level: "רמה 2", title: "חברים שהגיעו דרך החברים שלך", weight: "50%" },
  { level: "רמה 3", title: "המשך מעגל ההשפעה", weight: "25%" },
  { level: "רמה 4+", title: "שרשרת חברים מתמשכת", weight: "דועך" },
];

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

function createMemberOpenId(email: string) {
  return `member:${createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 56)}`;
}

async function signInMember(req: Request, res: Response, signup: { fullName: string; email: string }) {
  const openId = createMemberOpenId(signup.email);

  await upsertUser({
    openId,
    name: signup.fullName,
    email: signup.email,
    loginMethod: "member-signup",
    lastSignedIn: new Date(),
  });

  const sessionToken = await sdk.createSessionToken(openId, {
    name: signup.fullName,
    expiresInMs: ONE_YEAR_MS,
  });
  res.cookie(COOKIE_NAME, sessionToken, {
    ...getSessionCookieOptions(req),
    maxAge: ONE_YEAR_MS,
  });
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

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createConfirmationToken() {
  return randomBytes(confirmationTokenBytes).toString("base64url");
}

function getRequestBaseUrl(req: Request) {
  const configuredUrl = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || process.env.APP_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const forwardedProto = req.header("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol || "https";
  return `${protocol}://${req.get("host")}`;
}

function normalizeReturnTo(value: unknown) {
  const returnTo = normalize(value);
  return returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/mk121";
}

function buildConfirmationUrl(req: Request, token: string, returnTo = "/mk121") {
  const query = new URLSearchParams({
    token,
    returnTo: normalizeReturnTo(returnTo),
  });
  return `${getRequestBaseUrl(req)}/api/member-signups/confirm?${query.toString()}`;
}

function buildReferralCode(signupKey: string) {
  return `KM-${signupKey.slice(0, 8).toUpperCase()}`;
}

function normalizeReferralCode(value: unknown) {
  const normalized = normalize(value).toUpperCase().replace(/[^A-Z0-9-]/g, "");
  return normalized || null;
}

function buildReferralUrl(req: Request, referralCode: string) {
  return `${getRequestBaseUrl(req)}/group-building?ref=${encodeURIComponent(referralCode)}`;
}

function buildQrImageUrl(referralUrl: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(referralUrl)}`;
}

function buildReferralPayload(req: Request, signupKey: string) {
  const referralCode = buildReferralCode(signupKey);
  const referralUrl = buildReferralUrl(req, referralCode);

  return {
    referralCode,
    referralUrl,
    qrImageUrl: buildQrImageUrl(referralUrl),
  };
}

function getReferralCreditWeight(depth: number) {
  return referralCreditWeights[depth - 1] ?? Math.pow(0.5, depth - 1);
}

function buildEmptyReferralLevels(): ReferralStatsLevel[] {
  return referralLevelLabels.map((item) => ({
    ...item,
    count: 0,
    credit: 0,
  }));
}

function buildReferralStatsFromRows(referralCode: string, rows: ReferralStatsRow[]) {
  const normalizedReferralCode = normalizeReferralCode(referralCode) || "";
  const levels = buildEmptyReferralLevels();
  const childrenByParent = new Map<string, string[]>();
  const directSignupNames: string[] = [];

  for (const row of rows) {
    const parentCode = normalizeReferralCode(row.referredByCode);
    const childCode = normalizeReferralCode(row.referralCode);

    if (!parentCode || !childCode || parentCode === childCode) {
      continue;
    }

    const children = childrenByParent.get(parentCode) || [];
    children.push(childCode);
    childrenByParent.set(parentCode, children);

    if (parentCode === normalizedReferralCode && row.fullName && row.email) {
      directSignupNames.push(getPublicMemberName({
        fullName: row.fullName,
        email: row.email,
      }));
    }
  }

  const seen = new Set<string>([normalizedReferralCode]);
  const queue = (childrenByParent.get(normalizedReferralCode) || []).map((code) => ({ code, depth: 1 }));

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current || seen.has(current.code)) {
      continue;
    }

    seen.add(current.code);
    const levelIndex = Math.min(current.depth - 1, levels.length - 1);
    const credit = getReferralCreditWeight(current.depth);
    levels[levelIndex].count += 1;
    levels[levelIndex].credit += credit;

    for (const childCode of childrenByParent.get(current.code) || []) {
      queue.push({ code: childCode, depth: current.depth + 1 });
    }
  }

  const directSignups = levels[0]?.count || 0;
  const totalCluster = levels.reduce((sum, item) => sum + item.count, 0);
  const influenceScore = levels.reduce((sum, item) => sum + item.credit, 0);

  return {
    referralCode: normalizedReferralCode,
    directSignups,
    totalCluster,
    influenceScore,
    directSignupNames: Array.from(new Set(directSignupNames)).sort((first, second) => first.localeCompare(second, "he")),
    directSignupPreviewName: directSignupNames[0] || "",
    levels: levels.map((item) => ({
      ...item,
      credit: Number(item.credit.toFixed(2)),
    })),
  };
}

function getEmailStatus() {
  return {
    configured: isEmailConfigured(),
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
    hasFrom: Boolean(process.env.EMAIL_FROM || process.env.MEMBER_SIGNUP_EMAIL_FROM),
    hasPublicSiteUrl: Boolean(process.env.PUBLIC_SITE_URL || process.env.SITE_URL || process.env.APP_URL),
  };
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

  return Array.from(new Set(names));
}

function isDuplicateColumnError(error: unknown) {
  const current = error as { code?: string; errno?: number; cause?: { code?: string; errno?: number } };
  const cause = current?.cause;

  return current?.code === "ER_DUP_FIELDNAME" || current?.errno === 1060 || cause?.code === "ER_DUP_FIELDNAME" || cause?.errno === 1060;
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
      \`emailConfirmedAt\` timestamp,
      \`confirmationTokenHash\` varchar(64),
      \`confirmationSentAt\` timestamp,
      \`welcomeEmailSentAt\` timestamp,
      \`notificationSentAt\` timestamp,
      \`referralCode\` varchar(32),
      \`referredByCode\` varchar(32),
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`memberSignups_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`memberSignups_nationalId_unique\` UNIQUE(\`nationalId\`),
      CONSTRAINT \`memberSignups_email_unique\` UNIQUE(\`email\`),
      CONSTRAINT \`memberSignups_phone_unique\` UNIQUE(\`phone\`)
    )
  `);

  const alterStatements = [
    "ALTER TABLE `memberSignups` ADD COLUMN `emailConfirmedAt` timestamp",
    "ALTER TABLE `memberSignups` ADD COLUMN `confirmationTokenHash` varchar(64)",
    "ALTER TABLE `memberSignups` ADD COLUMN `confirmationSentAt` timestamp",
    "ALTER TABLE `memberSignups` ADD COLUMN `welcomeEmailSentAt` timestamp",
    "ALTER TABLE `memberSignups` ADD COLUMN `notificationSentAt` timestamp",
    "ALTER TABLE `memberSignups` ADD COLUMN `referralCode` varchar(32)",
    "ALTER TABLE `memberSignups` ADD COLUMN `referredByCode` varchar(32)",
  ];

  for (const statement of alterStatements) {
    await db.execute(statement).catch((error: unknown) => {
      if (!isDuplicateColumnError(error)) {
        throw error;
      }
    });
  }

  memberSignupTableReady = true;
  return db;
}

async function ensureCandidateEnlistmentTable() {
  const db = await getDb();

  if (!db || candidateEnlistmentTableReady) {
    return db;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`candidateEnlistments\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`fullName\` varchar(255) NOT NULL,
      \`nationalId\` varchar(32) NOT NULL,
      \`email\` varchar(320) NOT NULL,
      \`includedAt\` timestamp,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`candidateEnlistments_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`candidateEnlistments_nationalId_unique\` UNIQUE(\`nationalId\`),
      CONSTRAINT \`candidateEnlistments_email_unique\` UNIQUE(\`email\`)
    )
  `);

  await db.execute("ALTER TABLE `candidateEnlistments` ADD COLUMN `includedAt` timestamp").catch((error: unknown) => {
    if (!isDuplicateColumnError(error)) {
      throw error;
    }
  });

  candidateEnlistmentTableReady = true;
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
        .where(isNotNull(memberSignups.emailConfirmedAt))
        .orderBy(memberSignups.id);

      return getPublicMemberNamesFromRows(rows);
    } catch (error) {
      handleDbUnavailable("read", error);
    }
  }

  const store = await readLocalStore();
  return getPublicMemberNamesFromRows(store.submissions);
}

async function getConfirmedMemberEmailSuggestions(query: string) {
  const normalizedQuery = normalize(query).toLowerCase();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("member email suggestions setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("member email suggestions read");
  }

  if (db) {
    try {
      const rows = await db
        .select({ email: memberSignups.email })
        .from(memberSignups)
        .where(and(isNotNull(memberSignups.emailConfirmedAt), like(memberSignups.email, `${normalizedQuery}%`)))
        .orderBy(memberSignups.email)
        .limit(memberEmailSuggestionsLimit);

      return rows.map((row) => row.email);
    } catch (error) {
      handleDbUnavailable("member email suggestions read", error);
    }
  }

  const store = await readLocalStore();
  return Array.from(
    new Set(
      store.submissions
        .filter((signup) => signup.emailConfirmedAt && signup.email.toLowerCase().startsWith(normalizedQuery))
        .map((signup) => signup.email.toLowerCase()),
    ),
  )
    .sort((first, second) => first.localeCompare(second))
    .slice(0, memberEmailSuggestionsLimit);
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
      const [total] = await db
        .select({ value: count() })
        .from(memberSignups)
        .where(isNotNull(memberSignups.emailConfirmedAt));

      return total?.value || 0;
    } catch (error) {
      handleDbUnavailable("count", error);
    }
  }

  const store = await readLocalStore();
  return store.submissions.filter((signup) => signup.emailConfirmedAt).length;
}

async function getReferralStats(referralCode: string) {
  const normalizedReferralCode = normalizeReferralCode(referralCode);

  if (!normalizedReferralCode) {
    return {
      referralCode: "",
      directSignups: 0,
      totalCluster: 0,
      influenceScore: 0,
      directSignupNames: [],
      directSignupPreviewName: "",
      levels: buildEmptyReferralLevels(),
    };
  }

  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("referral stats setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("referral stats read");
  }

  if (db) {
    try {
      const rows = await db
        .select({
          fullName: memberSignups.fullName,
          email: memberSignups.email,
          referralCode: memberSignups.referralCode,
          referredByCode: memberSignups.referredByCode,
        })
        .from(memberSignups)
        .where(isNotNull(memberSignups.emailConfirmedAt));

      return buildReferralStatsFromRows(normalizedReferralCode, rows);
    } catch (error) {
      handleDbUnavailable("referral stats read", error);
    }
  }

  const store = await readLocalStore();
  return buildReferralStatsFromRows(normalizedReferralCode, store.submissions.filter((signup) => signup.emailConfirmedAt));
}

async function getConfirmedReferralByEmail(req: Request, email: string) {
  const normalizedEmail = normalize(email).toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("member referral lookup setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("member referral lookup");
  }

  if (db) {
    try {
      const rows = await db
        .select({
          email: memberSignups.email,
          nationalId: memberSignups.nationalId,
          referralCode: memberSignups.referralCode,
          emailConfirmedAt: memberSignups.emailConfirmedAt,
        })
        .from(memberSignups)
        .where(eq(memberSignups.email, normalizedEmail))
        .limit(1);

      const signup = rows[0];
      if (!signup?.emailConfirmedAt) {
        return null;
      }

      const signupKey = signup.nationalId || createHash("sha256").update(signup.email).digest("hex").slice(0, 32);
      const referralCode = signup.referralCode || buildReferralCode(signupKey);
      const referralUrl = buildReferralUrl(req, referralCode);

      return {
        referralCode,
        referralUrl,
        qrImageUrl: buildQrImageUrl(referralUrl),
      };
    } catch (error) {
      handleDbUnavailable("member referral lookup", error);
    }
  }

  const store = await readLocalStore();
  const signup = store.submissions.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!signup?.emailConfirmedAt) {
    return null;
  }

  const signupKey = signup.nationalId || createHash("sha256").update(signup.email).digest("hex").slice(0, 32);
  const referralCode = signup.referralCode || buildReferralCode(signupKey);
  const referralUrl = buildReferralUrl(req, referralCode);

  return {
    referralCode,
    referralUrl,
    qrImageUrl: buildQrImageUrl(referralUrl),
  };
}

async function sendConfirmedMemberLogin(req: Request, email: string, returnTo: string) {
  const normalizedEmail = normalize(email).toLowerCase();
  const confirmationToken = createConfirmationToken();
  const confirmationTokenHash = hashToken(confirmationToken);
  const confirmationUrl = buildConfirmationUrl(req, confirmationToken, returnTo);
  const now = new Date();
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("member login setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("member login");
  }

  if (db) {
    const rows = await db
      .select()
      .from(memberSignups)
      .where(and(eq(memberSignups.email, normalizedEmail), isNotNull(memberSignups.emailConfirmedAt)))
      .limit(1);
    const signup = rows[0];

    if (!signup) return false;

    await db
      .update(memberSignups)
      .set({ confirmationTokenHash, confirmationSentAt: now, updatedAt: now })
      .where(eq(memberSignups.id, signup.id));

    return sendMemberLoginEmail(signup.email, signup.fullName, confirmationUrl);
  }

  const store = await readLocalStore();
  const signup = store.submissions.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.emailConfirmedAt,
  );

  if (!signup) return false;

  signup.confirmationTokenHash = confirmationTokenHash;
  signup.confirmationSentAt = now.toISOString();
  signup.updatedAt = now.toISOString();
  await writeLocalStore(store);
  return sendMemberLoginEmail(signup.email, signup.fullName, confirmationUrl);
}

async function saveSignup(input: {
  fullName: string;
  email: string;
  phone: string;
  note: string;
  confirmationToken: string;
  referredByCode: string | null;
}) {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("setup", error);
    return null;
  });
  const storedFullName = input.fullName;
  const signupKey = createHash("sha256").update(input.email).digest("hex").slice(0, 32);
  const referralCode = buildReferralCode(signupKey);
  const referredByCode = input.referredByCode === referralCode ? null : input.referredByCode;
  const nowDate = new Date();
  const confirmationTokenHash = hashToken(input.confirmationToken);

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
      const existingSignup = existing[0];
      const isAlreadyConfirmed = Boolean(existingSignup?.emailConfirmedAt && existingSignup.email === input.email);

      if (isNewSignup) {
        await db.insert(memberSignups).values({
          fullName: storedFullName,
          nationalId: signupKey,
          email: input.email,
          phone: input.phone || null,
          note: input.note || null,
          referralCode,
          referredByCode,
          confirmationTokenHash,
          confirmationSentAt: nowDate,
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
            referralCode,
            referredByCode,
            emailConfirmedAt: isAlreadyConfirmed ? existingSignup.emailConfirmedAt : null,
            confirmationTokenHash: isAlreadyConfirmed ? null : confirmationTokenHash,
            confirmationSentAt: isAlreadyConfirmed ? existingSignup.confirmationSentAt : nowDate,
            updatedAt: new Date(),
          })
          .where(eq(memberSignups.id, existingSignup.id));
      }

      return { isNewSignup, isAlreadyConfirmed, signupKey, referralCode, referredByCode };
    } catch (error) {
      handleDbUnavailable("write", error);
    }
  }

  const now = new Date().toISOString();
  const { confirmationToken: _confirmationToken, ...storedInput } = input;
  const store = await readLocalStore();
  const existingIndex = store.submissions.findIndex((signup) => {
    const sameEmail = signup.email.toLowerCase() === input.email;
    const samePhone = input.phone && signup.phone === input.phone;
    return sameEmail || samePhone;
  });
  const isNewSignup = existingIndex < 0;
  const existingSignup = existingIndex >= 0 ? store.submissions[existingIndex] : null;
  const isAlreadyConfirmed = Boolean(existingSignup?.emailConfirmedAt && existingSignup.email === input.email);

  if (!isNewSignup) {
    store.submissions[existingIndex] = {
      ...store.submissions[existingIndex],
      ...storedInput,
      fullName: storedFullName,
      nationalId: signupKey,
      referralCode,
      referredByCode,
      emailConfirmedAt: isAlreadyConfirmed ? existingSignup?.emailConfirmedAt : null,
      confirmationTokenHash: isAlreadyConfirmed ? null : confirmationTokenHash,
      confirmationSentAt: isAlreadyConfirmed ? existingSignup?.confirmationSentAt || now : now,
      updatedAt: now,
    };
  } else {
    store.submissions.push({
      id: randomUUID(),
      ...storedInput,
      fullName: storedFullName,
      nationalId: signupKey,
      referralCode,
      referredByCode,
      emailConfirmedAt: null,
      confirmationTokenHash,
      confirmationSentAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeLocalStore(store);
  return { isNewSignup, isAlreadyConfirmed, signupKey, referralCode, referredByCode };
}

async function saveCandidateEnlistment(input: { fullName: string; nationalId: string; email: string }) {
  const db = await ensureCandidateEnlistmentTable().catch((error) => {
    handleDbUnavailable("candidate enlistment setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("candidate enlistment write");
  }

  if (db) {
    try {
      const existing = await db
        .select()
        .from(candidateEnlistments)
        .where(or(eq(candidateEnlistments.email, input.email), eq(candidateEnlistments.nationalId, input.nationalId)))
        .limit(1);
      const current = existing[0];

      if (current) {
        await db
          .update(candidateEnlistments)
          .set({
            fullName: input.fullName,
            nationalId: input.nationalId,
            email: input.email,
            updatedAt: new Date(),
          })
          .where(eq(candidateEnlistments.id, current.id));

        return { isNewEnlistment: false };
      }

      await db.insert(candidateEnlistments).values({
        fullName: input.fullName,
        nationalId: input.nationalId,
        email: input.email,
      });

      return { isNewEnlistment: true };
    } catch (error) {
      handleDbUnavailable("candidate enlistment write", error);
    }
  }

  throw new SignupStorageUnavailableError("candidate enlistment write");
}

async function markSignupConfirmed(token: string) {
  const tokenHash = hashToken(token);
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("signup confirmation");
  }

  if (db) {
    try {
      const rows = await db.select().from(memberSignups).where(eq(memberSignups.confirmationTokenHash, tokenHash)).limit(1);
      const signup = rows[0];

      if (!signup) {
        return null;
      }

      const wasAlreadyConfirmed = Boolean(signup.emailConfirmedAt);
      await db
        .update(memberSignups)
        .set({
          emailConfirmedAt: signup.emailConfirmedAt || new Date(),
          confirmationTokenHash: null,
          updatedAt: new Date(),
        })
        .where(eq(memberSignups.id, signup.id));

      return { signup, wasAlreadyConfirmed };
    } catch (error) {
      handleDbUnavailable("confirm", error);
    }
  }

  const now = new Date().toISOString();
  const store = await readLocalStore();
  const signup = store.submissions.find((submission) => submission.confirmationTokenHash === tokenHash);

  if (!signup) {
    return null;
  }

  const wasAlreadyConfirmed = Boolean(signup.emailConfirmedAt);
  signup.emailConfirmedAt = signup.emailConfirmedAt || now;
  signup.confirmationTokenHash = null;
  signup.updatedAt = now;
  await writeLocalStore(store);

  return { signup, wasAlreadyConfirmed };
}

async function sendPendingSignupConfirmations(req: Request) {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("admin setup", error);
    return null;
  });
  const nowDate = new Date();
  const now = nowDate.toISOString();
  let pending = 0;
  let sent = 0;
  let failed = 0;

  if (!db) {
    requireSignupStorage("admin confirmation send");
  }

  if (db) {
    try {
      const rows = await db.select().from(memberSignups).where(isNull(memberSignups.emailConfirmedAt));
      pending = rows.length;

      for (const signup of rows) {
        const confirmationToken = createConfirmationToken();
        const confirmationUrl = buildConfirmationUrl(req, confirmationToken);
        const emailSent = await sendConfirmationEmail(signup.email, signup.fullName, confirmationUrl).catch((error) => {
          console.warn("[MemberSignups] Pending confirmation email error:", error);
          return false;
        });

        if (emailSent) {
          sent += 1;
          await db
            .update(memberSignups)
            .set({
              confirmationTokenHash: hashToken(confirmationToken),
              confirmationSentAt: nowDate,
              updatedAt: nowDate,
            })
            .where(eq(memberSignups.id, signup.id));
        } else {
          failed += 1;
        }
      }

      return { pending, sent, failed };
    } catch (error) {
      handleDbUnavailable("admin confirmation send", error);
    }
  }

  const store = await readLocalStore();
  const pendingSignups = store.submissions.filter((signup) => !signup.emailConfirmedAt);
  pending = pendingSignups.length;

  for (const signup of pendingSignups) {
    const confirmationToken = createConfirmationToken();
    const confirmationUrl = buildConfirmationUrl(req, confirmationToken);
    const emailSent = await sendConfirmationEmail(signup.email, signup.fullName, confirmationUrl).catch((error) => {
      console.warn("[MemberSignups] Pending confirmation email error:", error);
      return false;
    });

    if (emailSent) {
      sent += 1;
      signup.confirmationTokenHash = hashToken(confirmationToken);
      signup.confirmationSentAt = now;
      signup.updatedAt = now;
    } else {
      failed += 1;
    }
  }

  if (sent > 0) {
    await writeLocalStore(store);
  }

  return { pending, sent, failed };
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

async function getAdminCandidateEnlistments() {
  const db = await ensureCandidateEnlistmentTable().catch((error) => {
    handleDbUnavailable("admin candidate enlistments setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("admin candidate enlistments read");
  }

  if (db) {
    try {
      const rows = await db.select().from(candidateEnlistments).orderBy(candidateEnlistments.id);
      return { source: "database", enlistments: rows as AdminCandidateEnlistment[] };
    } catch (error) {
      handleDbUnavailable("admin candidate enlistments read", error);
    }
  }

  throw new SignupStorageUnavailableError("admin candidate enlistments read");
}

async function includeCandidateEnlistment(id: string) {
  const db = await ensureCandidateEnlistmentTable().catch((error) => {
    handleDbUnavailable("admin candidate include setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("admin candidate include");
  }

  if (db) {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return false;
    }

    try {
      const existing = await db
        .select({ id: candidateEnlistments.id })
        .from(candidateEnlistments)
        .where(eq(candidateEnlistments.id, numericId))
        .limit(1);

      if (!existing.length) {
        return false;
      }

      await db
        .update(candidateEnlistments)
        .set({
          includedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(candidateEnlistments.id, numericId));
      return true;
    } catch (error) {
      handleDbUnavailable("admin candidate include", error);
    }
  }

  throw new SignupStorageUnavailableError("admin candidate include");
}

async function deleteCandidateEnlistment(id: string) {
  const db = await ensureCandidateEnlistmentTable().catch((error) => {
    handleDbUnavailable("admin candidate delete setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("admin candidate delete");
  }

  if (db) {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return false;
    }

    try {
      const existing = await db
        .select({ id: candidateEnlistments.id })
        .from(candidateEnlistments)
        .where(eq(candidateEnlistments.id, numericId))
        .limit(1);

      if (!existing.length) {
        return false;
      }

      await db.delete(candidateEnlistments).where(eq(candidateEnlistments.id, numericId));
      return true;
    } catch (error) {
      handleDbUnavailable("admin candidate delete", error);
    }
  }

  throw new SignupStorageUnavailableError("admin candidate delete");
}

async function getPublicCandidateEnlistments() {
  const db = await ensureCandidateEnlistmentTable().catch((error) => {
    handleDbUnavailable("public candidate enlistments setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("public candidate enlistments read");
  }

  if (db) {
    try {
      return await db
        .select({
          fullName: candidateEnlistments.fullName,
          includedAt: candidateEnlistments.includedAt,
        })
        .from(candidateEnlistments)
        .where(isNotNull(candidateEnlistments.includedAt))
        .orderBy(candidateEnlistments.includedAt);
    } catch (error) {
      handleDbUnavailable("public candidate enlistments read", error);
    }
  }

  throw new SignupStorageUnavailableError("public candidate enlistments read");
}

async function deleteAdminSignup(id: string) {
  const db = await ensureMemberSignupTable().catch((error) => {
    handleDbUnavailable("admin delete setup", error);
    return null;
  });

  if (!db) {
    requireSignupStorage("admin delete");
  }

  if (db) {
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return false;
    }

    try {
      const existing = await db.select({ id: memberSignups.id }).from(memberSignups).where(eq(memberSignups.id, numericId)).limit(1);

      if (!existing.length) {
        return false;
      }

      await db.delete(memberSignups).where(eq(memberSignups.id, numericId));
      return true;
    } catch (error) {
      handleDbUnavailable("admin delete", error);
    }
  }

  const store = await readLocalStore();
  const nextSubmissions = store.submissions.filter((signup) => signup.id !== id);

  if (nextSubmissions.length === store.submissions.length) {
    return false;
  }

  await writeLocalStore({ submissions: nextSubmissions });
  return true;
}

function buildWelcomeEmail(fullName: string, count: number, referral: { referralCode: string; referralUrl: string; qrImageUrl: string }) {
  const safeReferralUrl = escapeHtml(referral.referralUrl);
  const safeQrImageUrl = escapeHtml(referral.qrImageUrl);

  return {
    subject: "ברוכים הבאים לגרעין המייסד של קול משותף",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h1 style="color:#1e3a8a">ברוכים הבאים, ${fullName}</h1>
        <p>תודה על ההצטרפות לגרעין המייסד של קול משותף.</p>
        <p>הרשמתך נשמרה, והמד עלה ל-<strong>${count.toLocaleString("he-IL")}</strong> נרשמים מתוך יעד של <strong>${memberTarget.toLocaleString("he-IL")}</strong>.</p>
        <p>קוד ההזמנה האישי שלך: <strong dir="ltr">${referral.referralCode}</strong></p>
        <p>
          <a href="${safeReferralUrl}" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">
            פתיחת עמוד השיתוף האישי
          </a>
        </p>
        <p><img src="${safeQrImageUrl}" alt="QR אישי להזמנת חברים" width="180" height="180" style="border:1px solid #e5d9bf;border-radius:8px;padding:8px;background:#ffffff" /></p>
        <p>נשתמש במייל הזה לעדכונים עתידיים על התקדמות היוזמה, בצורה מדודה ולא מציפה.</p>
        <p>מספר הנרשמים משמש אומדן לכוח ציבורי אפשרי, ואינו מהווה סקר, תחזית או הבטחת הצבעה בפועל.</p>
      </div>
    `,
    text: `ברוכים הבאים, ${fullName}. תודה על ההצטרפות לגרעין המייסד של קול משותף. הרשמתך נשמרה, והמד עלה ל-${count.toLocaleString("he-IL")} נרשמים מתוך יעד של ${memberTarget.toLocaleString("he-IL")}. קוד ההזמנה האישי שלך: ${referral.referralCode}. עמוד השיתוף האישי: ${referral.referralUrl}`,
  };
}

async function sendWelcomeEmail(to: string, fullName: string, count: number, referral: { referralCode: string; referralUrl: string; qrImageUrl: string }) {
  const message = buildWelcomeEmail(fullName, count, referral);
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

function buildConfirmationEmail(fullName: string, confirmationUrl: string) {
  const safeFullName = escapeHtml(fullName);
  const safeConfirmationUrl = escapeHtml(confirmationUrl);

  return {
    subject: "אישור הצטרפות לגרעין המייסד של קול משותף",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#0f172a">
        <h1 style="color:#1e3a8a">שלום ${safeFullName}, נשאר רק לאשר במייל</h1>
        <p>כדי להשלים את ההצטרפות לגרעין המייסד של קול משותף, יש ללחוץ על הכפתור הבא:</p>
        <p>
          <a href="${safeConfirmationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">
            אישור ההצטרפות
          </a>
        </p>
        <p>אם הכפתור לא נפתח, אפשר להעתיק את הקישור הבא לדפדפן:</p>
        <p dir="ltr" style="word-break:break-all">${safeConfirmationUrl}</p>
        <p>אם לא ביקשת להצטרף, אפשר להתעלם מהמייל.</p>
      </div>
    `,
    text: `שלום ${fullName}, כדי להשלים את ההצטרפות לגרעין המייסד של קול משותף יש לפתוח את הקישור הבא: ${confirmationUrl}`,
  };
}

async function sendConfirmationEmail(to: string, fullName: string, confirmationUrl: string) {
  const message = buildConfirmationEmail(fullName, confirmationUrl);
  return sendEmail({ to, subject: message.subject, html: message.html, text: message.text });
}

async function sendMemberLoginEmail(to: string, fullName: string, confirmationUrl: string) {
  const safeFullName = escapeHtml(fullName);
  const safeConfirmationUrl = escapeHtml(confirmationUrl);

  return sendEmail({
    to,
    subject: "קישור כניסה לקול משותף",
    html: `
      <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7;color:#17324d">
        <h2>שלום ${safeFullName},</h2>
        <p>לחצו על הכפתור כדי להיכנס לאתר כחבר/ה מאושר/ת ולהמשיך בפעולה שביקשתם לבצע.</p>
        <p><a href="${safeConfirmationUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background:#1d4f91;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">כניסה לקול משותף</a></p>
        <p>אם לא ביקשתם להיכנס, אפשר להתעלם מההודעה.</p>
      </div>
    `,
    text: `שלום ${fullName}, קישור הכניסה שלך לקול משותף: ${confirmationUrl}`,
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
        emailStatus: getEmailStatus(),
        submissions: result.submissions,
      });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.get("/api/admin/candidate-enlistments", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const result = await getAdminCandidateEnlistments();
      res.json({
        ok: true,
        source: result.source,
        count: result.enlistments.length,
        enlistments: result.enlistments,
      });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/admin/candidate-enlistments/:id/include", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const included = await includeCandidateEnlistment(req.params.id);

      if (!included) {
        res.status(404).json({ error: "Candidate enlistment was not found." });
        return;
      }

      res.json({ ok: true, included: true });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.delete("/api/admin/candidate-enlistments/:id", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const deleted = await deleteCandidateEnlistment(req.params.id);

      if (!deleted) {
        res.status(404).json({ error: "Candidate enlistment was not found." });
        return;
      }

      res.json({ ok: true, deleted: true });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/admin/member-signups/send-confirmations", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      const result = await sendPendingSignupConfirmations(req);
      res.json({ ok: true, ...result });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.delete("/api/admin/member-signups/:id", async (req: Request, res: Response) => {
    if (!isValidAdminToken(req)) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const id = normalize(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Missing signup id." });
      return;
    }

    try {
      const deleted = await deleteAdminSignup(id);

      if (!deleted) {
        res.status(404).json({ error: "Signup was not found." });
        return;
      }

      res.json({ ok: true, deleted: true });
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

  app.get("/api/candidate-enlistments", async (_req: Request, res: Response) => {
    try {
      const candidates = await getPublicCandidateEnlistments();
      res.json({ ok: true, candidates });
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

  app.get("/api/member-signups/email-suggestions", async (req: Request, res: Response) => {
    try {
      const emails = await getConfirmedMemberEmailSuggestions(normalize(req.query.q));
      res.json({ ok: true, emails });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.get("/api/member-signups/referral/:code", async (req: Request, res: Response) => {
    try {
      const stats = await getReferralStats(req.params.code);
      const referralUrl = stats.referralCode ? buildReferralUrl(req, stats.referralCode) : "";
      res.json({
        ok: true,
        ...stats,
        referralUrl,
        qrImageUrl: referralUrl ? buildQrImageUrl(referralUrl) : "",
      });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/member-signups/recover-referral", async (req: Request, res: Response) => {
    const email = normalize(req.body.email).toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "יש למלא אימייל תקין." });
      return;
    }

    try {
      const referral = await getConfirmedReferralByEmail(req, email);

      if (!referral) {
        res.status(404).json({ error: "לא נמצאה הרשמה מאושרת למייל הזה. אם נרשמת, יש לאשר קודם את קישור האישור במייל." });
        return;
      }

      res.json({ ok: true, ...referral });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/member-signups/request-login", async (req: Request, res: Response) => {
    const email = normalize(req.body.email).toLowerCase();
    const returnTo = normalizeReturnTo(req.body.returnTo);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "יש למלא אימייל תקין." });
      return;
    }

    try {
      const loginEmailSent = await sendConfirmedMemberLogin(req, email, returnTo);

      if (!loginEmailSent) {
        res.status(404).json({
          error: "לא נמצאה הרשמה מאושרת למייל הזה. אם נרשמת, יש לאשר קודם את הקישור שנשלח במייל.",
        });
        return;
      }

      res.json({ ok: true, loginEmailSent: true });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.get("/api/member-signups/confirm", async (req: Request, res: Response) => {
    const token = normalize(req.query.token);
    const returnTo = normalizeReturnTo(req.query.returnTo);

    if (!token) {
      res.status(400).send("קישור האישור חסר או אינו תקין.");
      return;
    }

    try {
      const confirmation = await markSignupConfirmed(token);

      if (!confirmation) {
        res.status(404).send("קישור האישור אינו תקין או שכבר נעשה בו שימוש.");
        return;
      }

      const publicMemberCount = await getPublicMemberCount();
      const signupKey = confirmation.signup.nationalId || createHash("sha256").update(confirmation.signup.email).digest("hex").slice(0, 32);
      const referral = buildReferralPayload(req, signupKey);
      await signInMember(req, res, confirmation.signup);

      if (!confirmation.wasAlreadyConfirmed) {
        await sendWelcomeEmail(confirmation.signup.email, confirmation.signup.fullName, publicMemberCount, referral).catch((error) => {
          console.warn("[MemberSignups] Welcome email error:", error);
          return false;
        });
        await sendSignupNotification({
          fullName: confirmation.signup.fullName,
          email: confirmation.signup.email,
          phone: confirmation.signup.phone || "",
          note: confirmation.signup.note || "",
          count: publicMemberCount,
          isNewSignup: true,
        }).catch((error) => {
          console.warn("[MemberSignups] Signup notification error:", error);
          return false;
        });
      }

      res.redirect(302, returnTo);
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
    const returnTo = normalizeReturnTo(req.body.returnTo);
    const referredByCode = normalizeReferralCode(req.body.referredByCode || req.body.referralCode || req.query.ref);

    if (!fullName) {
      res.status(400).json({ error: "יש למלא שם מלא" });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "יש למלא אימייל תקין כדי לקבל אישור הרשמה ועדכונים עתידיים" });
      return;
    }

    try {
      const confirmationToken = createConfirmationToken();
      const confirmationUrl = buildConfirmationUrl(req, confirmationToken, returnTo);
      const { isNewSignup, isAlreadyConfirmed, signupKey } = await saveSignup({ fullName, email, phone, note, confirmationToken, referredByCode });
      const publicMemberCount = await getPublicMemberCount();
      const referral = buildReferralPayload(req, signupKey);
      const signedIn = !isAlreadyConfirmed;

      if (signedIn) {
        await signInMember(req, res, { fullName, email });
      }

      const loginEmailSent = isAlreadyConfirmed
        ? await sendConfirmedMemberLogin(req, email, returnTo).catch((error) => {
          console.warn("[MemberSignups] Member login email error:", error);
          return false;
        })
        : false;
      const confirmationEmailSent = isAlreadyConfirmed
        ? false
        : await sendConfirmationEmail(email, fullName, confirmationUrl).catch((error) => {
        console.warn("[MemberSignups] Confirmation email error:", error);
        return false;
      });

      res.json({
        ok: true,
        count: publicMemberCount,
        isNewSignup,
        isAlreadyConfirmed,
        signedIn,
        returnTo,
        confirmationEmailSent,
        loginEmailSent,
        ...referral,
      });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });

  app.post("/api/candidate-enlistments", async (req: Request, res: Response) => {
    if (isSignupRateLimited(req)) {
      res.status(429).json({ error: "יותר מדי ניסיונות בזמן קצר. נסה שוב בעוד דקה." });
      return;
    }

    const fullName = normalize(req.body.fullName);
    const nationalId = normalize(req.body.nationalId).replace(/\D/g, "");
    const email = normalize(req.body.email).toLowerCase();

    if (!fullName) {
      res.status(400).json({ error: "יש למלא שם מלא" });
      return;
    }

    if (!nationalId || nationalId.length < 5) {
      res.status(400).json({ error: "יש למלא ת.ז תקינה" });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "יש למלא מייל תקין" });
      return;
    }

    try {
      const result = await saveCandidateEnlistment({ fullName, nationalId, email });
      res.json({ ok: true, ...result });
    } catch (error) {
      sendSignupRouteError(res, error);
    }
  });
}
