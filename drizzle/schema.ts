import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "minister"]).default("user").notNull(),
  ministryId: int("ministryId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Ministries table
export const ministries = mysqlTable("ministries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ministry = typeof ministries.$inferSelect;
export type InsertMinistry = typeof ministries.$inferInsert;

// Decisions table
export const decisions = mysqlTable("decisions", {
  id: int("id").autoincrement().primaryKey(),
  ministryId: int("ministryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["major", "medium", "routine"]).default("medium").notNull(),
  status: mysqlEnum("status", ["proposed", "voting", "approved", "rejected", "implemented"]).default("proposed").notNull(),
  proposedBy: int("proposedBy").notNull(),
  votingStartsAt: timestamp("votingStartsAt"),
  votingEndsAt: timestamp("votingEndsAt"),
  totalVoters: int("totalVoters").default(0),
  votesFor: int("votesFor").default(0),
  votesAgainst: int("votesAgainst").default(0),
  vetoed: boolean("vetoed").default(false),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = typeof decisions.$inferInsert;

// Citizen votes table
export const citizenVotes = mysqlTable("citizenVotes", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull(),
  userId: int("userId").notNull(),
  vote: mysqlEnum("vote", ["for", "against"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CitizenVote = typeof citizenVotes.$inferSelect;
export type InsertCitizenVote = typeof citizenVotes.$inferInsert;

// Decision history/audit log
export const decisionHistory = mysqlTable("decisionHistory", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  details: json("details"),
  performedBy: int("performedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DecisionHistory = typeof decisionHistory.$inferSelect;
export type InsertDecisionHistory = typeof decisionHistory.$inferInsert;