import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let usersTableReady = false;
let mk121TablesReady = false;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function ensureUsersTable() {
  const db = await getDb();

  if (!db || usersTableReady) {
    return db;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`openId\` varchar(64) NOT NULL,
      \`name\` text,
      \`email\` varchar(320),
      \`loginMethod\` varchar(64),
      \`role\` enum('user','admin','minister') NOT NULL DEFAULT 'user',
      \`ministryId\` int,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      \`lastSignedIn\` timestamp NOT NULL DEFAULT (now()),
      CONSTRAINT \`users_id\` PRIMARY KEY(\`id\`),
      CONSTRAINT \`users_openId_unique\` UNIQUE(\`openId\`)
    )
  `);

  usersTableReady = true;
  return db;
}

export async function ensureMK121Tables() {
  const db = await getDb();

  if (!db || mk121TablesReady) {
    return db;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121Cycles\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`cycleNumber\` int NOT NULL,
      \`seasonName\` varchar(32) NOT NULL,
      \`startDate\` timestamp NOT NULL,
      \`endDate\` timestamp NOT NULL,
      \`status\` enum('active','completed','archived') NOT NULL DEFAULT 'active',
      \`winningBillId\` int,
      \`winningQuestionId\` int,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`mk121Cycles_cycleNumber_unique\` (\`cycleNumber\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121Bills\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`cycleId\` int NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`description\` text NOT NULL,
      \`proposedBy\` int NOT NULL,
      \`category\` varchar(100),
      \`votes\` int DEFAULT 0,
      \`isWinner\` boolean DEFAULT false,
      \`status\` enum('preliminary','published','voting','approved','archived') NOT NULL DEFAULT 'preliminary',
      \`supporters\` int DEFAULT 0,
      \`quorumMet\` boolean DEFAULT false,
      \`createdCycleNumber\` int NOT NULL,
      \`archivedAt\` timestamp NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121Questions\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`cycleId\` int NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`description\` text NOT NULL,
      \`targetMinistry\` varchar(255),
      \`ministryId\` int,
      \`proposedBy\` int NOT NULL,
      \`urgency\` enum('low','medium','high') NOT NULL DEFAULT 'medium',
      \`votes\` int DEFAULT 0,
      \`isWinner\` boolean DEFAULT false,
      \`status\` enum('preliminary','published','voting','approved','archived') NOT NULL DEFAULT 'preliminary',
      \`supporters\` int DEFAULT 0,
      \`quorumMet\` boolean DEFAULT false,
      \`createdCycleNumber\` int NOT NULL,
      \`archivedAt\` timestamp NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121BillVotes\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`billId\` int NOT NULL,
      \`userId\` int NOT NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      PRIMARY KEY (\`id\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121QuestionVotes\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`questionId\` int NOT NULL,
      \`userId\` int NOT NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      PRIMARY KEY (\`id\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121BillSupporters\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`billId\` int NOT NULL,
      \`userId\` int NOT NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`mk121BillSupporters_bill_user_unique\` (\`billId\`, \`userId\`)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS \`mk121QuestionSupporters\` (
      \`id\` int AUTO_INCREMENT NOT NULL,
      \`questionId\` int NOT NULL,
      \`userId\` int NOT NULL,
      \`createdAt\` timestamp NOT NULL DEFAULT (now()),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`mk121QuestionSupporters_question_user_unique\` (\`questionId\`, \`userId\`)
    )
  `);
  await db.execute(`
    ALTER TABLE \`mk121Bills\`
      MODIFY COLUMN \`status\` enum('preliminary','published','voting','approved','archived')
      NOT NULL DEFAULT 'preliminary'
  `);
  await db.execute(`
    ALTER TABLE \`mk121Questions\`
      MODIFY COLUMN \`status\` enum('preliminary','published','voting','approved','archived')
      NOT NULL DEFAULT 'preliminary'
  `);
  await db.execute(`
    INSERT IGNORE INTO \`mk121Cycles\`
      (\`id\`, \`cycleNumber\`, \`seasonName\`, \`startDate\`, \`endDate\`, \`status\`)
    VALUES
      (1, 1, 'קיץ', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active')
  `);

  mk121TablesReady = true;
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await ensureUsersTable();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await ensureUsersTable();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.
