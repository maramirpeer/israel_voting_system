import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

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
  budget: decimal("budget", { precision: 12, scale: 2 }), // Budget amount in NIS
  votingStartsAt: timestamp("votingStartsAt"),
  votingEndsAt: timestamp("votingEndsAt"),
  publicVotingStartsAt: timestamp("publicVotingStartsAt"), // When public voting begins (72 hours)
  publicVotingEndsAt: timestamp("publicVotingEndsAt"), // When public voting ends
  totalVoters: int("totalVoters").default(0),
  votesFor: int("votesFor").default(0),
  votesAgainst: int("votesAgainst").default(0),
  publicVotesFor: int("publicVotesFor").default(0), // Public votes for
  publicVotesAgainst: int("publicVotesAgainst").default(0), // Public votes against
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

// Public votes table (citizen votes on ministerial decisions during 72-hour window)
export const publicVotes = mysqlTable("publicVotes", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull(),
  userId: int("userId").notNull(),
  vote: mysqlEnum("vote", ["for", "against"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PublicVote = typeof publicVotes.$inferSelect;
export type InsertPublicVote = typeof publicVotes.$inferInsert;

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

// Delegates/Representatives table
export const delegates = mysqlTable("delegates", {
  id: int("id").autoincrement().primaryKey(),
  ministryId: int("ministryId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  values: text("values"), // JSON string of delegate values
  expertise: text("expertise"), // JSON string of expertise areas
  profileImage: varchar("profileImage", { length: 500 }),
  endorsements: int("endorsements").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Delegate = typeof delegates.$inferSelect;
export type InsertDelegate = typeof delegates.$inferInsert;

// Citizen delegate assignments table
export const citizenDelegates = mysqlTable("citizenDelegates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ministryId: int("ministryId").notNull(),
  delegateId: int("delegateId"),
  delegateUserId: int("delegateUserId"), // Direct user ID if delegating to another citizen
  votingMethod: mysqlEnum("votingMethod", ["direct", "delegate"]).default("direct").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CitizenDelegate = typeof citizenDelegates.$inferSelect;
export type InsertCitizenDelegate = typeof citizenDelegates.$inferInsert;

// Delegate votes table (votes cast by delegates on behalf of citizens)
export const delegateVotes = mysqlTable("delegateVotes", {
  id: int("id").autoincrement().primaryKey(),
  decisionId: int("decisionId").notNull(),
  delegateId: int("delegateId").notNull(),
  vote: mysqlEnum("vote", ["for", "against"]).notNull(),
  votesRepresented: int("votesRepresented").default(1), // How many citizens this delegate represents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DelegateVote = typeof delegateVotes.$inferSelect;
export type InsertDelegateVote = typeof delegateVotes.$inferInsert;
// MK 121 - Voting cycles (quarterly)
export const mk121Cycles = mysqlTable("mk121Cycles", {
  id: int("id").autoincrement().primaryKey(),
  cycleNumber: int("cycleNumber").notNull().unique(),
  seasonName: mysqlEnum("seasonName", ["אביב", "קיץ", "סתיו", "חורף"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  winningBillId: int("winningBillId"),
  winningQuestionId: int("winningQuestionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MK121Cycle = typeof mk121Cycles.$inferSelect;
export type InsertMK121Cycle = typeof mk121Cycles.$inferInsert;

// MK 121 - Bill proposals
export const mk121Bills = mysqlTable("mk121Bills", {
  id: int("id").autoincrement().primaryKey(),
  cycleId: int("cycleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  proposedBy: int("proposedBy").notNull(),
  category: varchar("category", { length: 100 }),
  votes: int("votes").default(0),
  isWinner: boolean("isWinner").default(false),
  status: mysqlEnum("status", ["preliminary", "voting", "approved", "archived"]).default("preliminary").notNull(),
  supporters: int("supporters").default(0),
  quorumMet: boolean("quorumMet").default(false),
  createdCycleNumber: int("createdCycleNumber").notNull(),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MK121Bill = typeof mk121Bills.$inferSelect;
export type InsertMK121Bill = typeof mk121Bills.$inferInsert;

// MK 121 - Parliamentary questions
export const mk121Questions = mysqlTable("mk121Questions", {
  id: int("id").autoincrement().primaryKey(),
  cycleId: int("cycleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  targetMinistry: varchar("targetMinistry", { length: 255 }),
  ministryId: int("ministryId"),
  proposedBy: int("proposedBy").notNull(),
  urgency: mysqlEnum("urgency", ["low", "medium", "high"]).default("medium").notNull(),
  votes: int("votes").default(0),
  isWinner: boolean("isWinner").default(false),
  status: mysqlEnum("status", ["preliminary", "voting", "approved", "archived"]).default("preliminary").notNull(),
  supporters: int("supporters").default(0),
  quorumMet: boolean("quorumMet").default(false),
  createdCycleNumber: int("createdCycleNumber").notNull(),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MK121Question = typeof mk121Questions.$inferSelect;
export type InsertMK121Question = typeof mk121Questions.$inferInsert;

// MK 121 - Bill votes
export const mk121BillVotes = mysqlTable("mk121BillVotes", {
  id: int("id").autoincrement().primaryKey(),
  billId: int("billId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MK121BillVote = typeof mk121BillVotes.$inferSelect;
export type InsertMK121BillVote = typeof mk121BillVotes.$inferInsert;

// MK 121 - Question votes
export const mk121QuestionVotes = mysqlTable("mk121QuestionVotes", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MK121QuestionVote = typeof mk121QuestionVotes.$inferSelect;
export type InsertMK121QuestionVote = typeof mk121QuestionVotes.$inferInsert;

// MK 121 - Bill supporters (for preliminary stage)
export const mk121BillSupporters = mysqlTable("mk121BillSupporters", {
  id: int("id").autoincrement().primaryKey(),
  billId: int("billId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MK121BillSupporter = typeof mk121BillSupporters.$inferSelect;
export type InsertMK121BillSupporter = typeof mk121BillSupporters.$inferInsert;

// MK 121 - Question supporters (for preliminary stage)
export const mk121QuestionSupporters = mysqlTable("mk121QuestionSupporters", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MK121QuestionSupporter = typeof mk121QuestionSupporters.$inferSelect;
export type InsertMK121QuestionSupporter = typeof mk121QuestionSupporters.$inferInsert;
