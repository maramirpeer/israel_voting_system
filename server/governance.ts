import { eq, and, gte, lte, desc } from "drizzle-orm";
import { ministries, decisions, citizenVotes, decisionHistory, publicVotes, InsertMinistry, InsertDecision, InsertCitizenVote, InsertPublicVote } from "../drizzle/schema";
import { getDb } from "./db";

// Ministry helpers
export async function getAllMinistries() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ministries).orderBy(ministries.name);
}

export async function getMinistryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ministries).where(eq(ministries.id, id)).limit(1);
  return result[0] || null;
}

// Decision helpers
export async function createDecision(data: InsertDecision) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(decisions).values(data);
  return result;
}

export async function getDecisionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(decisions).where(eq(decisions.id, id)).limit(1);
  return result[0] || null;
}

export async function getDecisionsByMinistry(ministryId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(decisions)
    .where(eq(decisions.ministryId, ministryId))
    .orderBy(desc(decisions.createdAt));
}

export async function getAllDecisions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(decisions).orderBy(desc(decisions.createdAt));
}

export async function getActiveDecisions() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(decisions)
    .where(
      and(
        eq(decisions.status, "voting"),
        lte(decisions.votingStartsAt, now),
        gte(decisions.votingEndsAt, now)
      )
    )
    .orderBy(desc(decisions.votingEndsAt));
}

export async function updateDecisionStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(decisions)
    .set({ status: status as any })
    .where(eq(decisions.id, id));
}

export async function updateDecisionVotes(id: number, votesFor: number, votesAgainst: number, vetoed: boolean = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(decisions)
    .set({ 
      votesFor, 
      votesAgainst, 
      vetoed,
      status: vetoed ? "rejected" : "approved"
    })
    .where(eq(decisions.id, id));
}

// Voting helpers
export async function castVote(decisionId: number, userId: number, vote: "for" | "against") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already voted
  const existing = await db.select().from(citizenVotes)
    .where(and(
      eq(citizenVotes.decisionId, decisionId),
      eq(citizenVotes.userId, userId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("User has already voted on this decision");
  }
  
  const result = await db.insert(citizenVotes).values({
    decisionId,
    userId,
    vote
  });
  
  return result;
}

export async function getDecisionVotes(decisionId: number) {
  const db = await getDb();
  if (!db) return { for: 0, against: 0 };
  
  const votes = await db.select().from(citizenVotes).where(eq(citizenVotes.decisionId, decisionId));
  
  return {
    for: votes.filter(v => v.vote === "for").length,
    against: votes.filter(v => v.vote === "against").length
  };
}

export async function getUserVote(decisionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(citizenVotes)
    .where(and(
      eq(citizenVotes.decisionId, decisionId),
      eq(citizenVotes.userId, userId)
    ))
    .limit(1);
  
  return result[0] || null;
}

// History helpers
export async function logDecisionHistory(decisionId: number, action: string, performedBy: number | null, details?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(decisionHistory).values({
    decisionId,
    action,
    performedBy,
    details: details ? JSON.stringify(details) : null
  });
}

export async function getDecisionHistory(decisionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(decisionHistory)
    .where(eq(decisionHistory.decisionId, decisionId))
    .orderBy(desc(decisionHistory.createdAt));
}

// Public voting helpers (72-hour citizen voting on ministerial decisions)
export async function castPublicVote(decisionId: number, userId: number, vote: "for" | "against") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if user already voted
  const existing = await db.select().from(publicVotes)
    .where(and(
      eq(publicVotes.decisionId, decisionId),
      eq(publicVotes.userId, userId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("User has already voted on this decision");
  }
  
  // Insert vote
  const result = await db.insert(publicVotes).values({
    decisionId,
    userId,
    vote
  });
  
  // Update decision vote counts
  const allVotes = await db.select().from(publicVotes).where(eq(publicVotes.decisionId, decisionId));
  const votesFor = allVotes.filter(v => v.vote === "for").length;
  const votesAgainst = allVotes.filter(v => v.vote === "against").length;
  
  await db.update(decisions)
    .set({ publicVotesFor: votesFor, publicVotesAgainst: votesAgainst })
    .where(eq(decisions.id, decisionId));
  
  return result;
}

export async function getPublicVotes(decisionId: number) {
  const db = await getDb();
  if (!db) return { for: 0, against: 0 };
  const votes = await db.select().from(publicVotes).where(eq(publicVotes.decisionId, decisionId));
  
  return {
    for: votes.filter(v => v.vote === "for").length,
    against: votes.filter(v => v.vote === "against").length
  };
}

export async function getUserPublicVote(decisionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(publicVotes)
    .where(and(
      eq(publicVotes.decisionId, decisionId),
      eq(publicVotes.userId, userId)
    ))
    .limit(1);
  
  return result[0] || null;
}

// Get decisions with active public voting (72-hour window)
export async function getActivePublicVotingDecisions() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(decisions)
    .where(
      and(
        eq(decisions.status, "voting"),
        lte(decisions.publicVotingStartsAt, now),
        gte(decisions.publicVotingEndsAt, now)
      )
    )
    .orderBy(desc(decisions.publicVotingEndsAt));
}
