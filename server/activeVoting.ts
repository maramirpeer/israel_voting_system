import { getDb } from "./db";
import { 
  decisions, 
  publicVotes, 
  delegateVotes, 
  delegates,
  citizenDelegates,
  ministries
} from "../drizzle/schema";
import { eq, and, gte, lte, sql, isNull } from "drizzle-orm";

/**
 * Get all decisions currently in active voting (72-hour window)
 */
export async function getActiveVotingDecisions() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const now = new Date();
  
  const activeDecisions = await db
    .select({
      id: decisions.id,
      ministryId: decisions.ministryId,
      title: decisions.title,
      description: decisions.description,
      category: decisions.category,
      status: decisions.status,
      proposedBy: decisions.proposedBy,
      budget: decisions.budget,
      votingStartsAt: decisions.votingStartsAt,
      votingEndsAt: decisions.publicVotingEndsAt,
      votesFor: decisions.publicVotesFor,
      votesAgainst: decisions.publicVotesAgainst,
      ministry: {
        id: ministries.id,
        name: ministries.name,
        description: ministries.description,
      },
      timeRemaining: sql<number>`TIMESTAMPDIFF(MINUTE, ${sql.raw('NOW()')}, ${decisions.publicVotingEndsAt})`,
    })
    .from(decisions)
    .leftJoin(ministries, eq(decisions.ministryId, ministries.id))
    .where(
      and(
        eq(decisions.status, "voting"),
        gte(decisions.publicVotingEndsAt, now),
        lte(decisions.publicVotingStartsAt, now)
      )
    )
    .orderBy(sql`TIMESTAMPDIFF(MINUTE, ${sql.raw('NOW()')}, ${decisions.publicVotingEndsAt})`)
    .limit(10);

  return activeDecisions;
}

/**
 * Get list of eligible voters (demo data)
 */
export async function getEligibleVoters() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const voters = await db
    .select({
      id: sql<number>`id`,
      citizenId: sql<string>`citizenId`,
      name: sql<string>`name`,
      email: sql<string>`email`,
    })
    .from(sql`eligibleVoters`)
    .where(sql`isActive = true`)
    .orderBy(sql`name`);

  return voters;
}

/**
 * Get approved delegates for a ministry
 */
export async function getApprovedDelegates(ministryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const delegateList = await db
    .select({
      id: delegates.id,
      name: delegates.name,
      bio: delegates.bio,
      expertise: delegates.expertise,
      profileImage: delegates.profileImage,
      endorsements: delegates.endorsements,
    })
    .from(delegates)
    .where(
      and(
        eq(delegates.ministryId, ministryId),
        eq(delegates.isActive, true)
      )
    )
    .orderBy(sql`${delegates.endorsements} DESC`);

  return delegateList;
}

/**
 * Cast a direct vote on a decision
 */
export async function castDirectVote(
  decisionId: number,
  userId: number,
  vote: "for" | "against"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Check if user already voted
  const existingVote = await db
    .select()
    .from(publicVotes)
    .where(
      and(
        eq(publicVotes.decisionId, decisionId),
        eq(publicVotes.userId, userId)
      )
    )
    .limit(1);

  if (existingVote.length > 0) {
    throw new Error("User has already voted on this decision");
  }

  // Record the vote
  await db.insert(publicVotes).values({
    decisionId,
    userId,
    vote,
  });

  // Update vote counts in decisions table
  if (vote === "for") {
    await db
      .update(decisions)
      .set({
        publicVotesFor: sql`${decisions.publicVotesFor} + 1`,
      })
      .where(eq(decisions.id, decisionId));
  } else {
    await db
      .update(decisions)
      .set({
        publicVotesAgainst: sql`${decisions.publicVotesAgainst} + 1`,
      })
      .where(eq(decisions.id, decisionId));
  }

  return { success: true, message: "Vote recorded successfully" };
}

/**
 * Delegate vote to an approved delegate
 */
export async function delegateVoteToDelegateFromList(
  decisionId: number,
  userId: number,
  delegateId: number,
  ministryId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Verify delegate exists and is approved
  const delegate = await db
    .select()
    .from(delegates)
    .where(
      and(
        eq(delegates.id, delegateId),
        eq(delegates.ministryId, ministryId),
        eq(delegates.isActive, true)
      )
    )
    .limit(1);

  if (delegate.length === 0) {
    throw new Error("Invalid delegate or delegate is not active");
  }

  // Check if user already voted or delegated
  const existingVote = await db
    .select()
    .from(publicVotes)
    .where(
      and(
        eq(publicVotes.decisionId, decisionId),
        eq(publicVotes.userId, userId)
      )
    )
    .limit(1);

  if (existingVote.length > 0) {
    throw new Error("User has already voted on this decision");
  }

  // Record delegation
  await db.insert(citizenDelegates).values({
    userId,
    ministryId,
    delegateId,
    votingMethod: "delegate",
  });

  return { success: true, message: "Vote delegated successfully" };
}

/**
 * Delegate vote to another citizen by ID
 */
export async function delegateVoteByCitizenId(
  decisionId: number,
  userId: number,
  delegateCitizenId: string,
  ministryId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Verify delegateCitizenId is in eligible voters list
  const eligibleVoter = await db
    .select()
    .from(sql`eligibleVoters`)
    .where(sql`citizenId = ${delegateCitizenId} AND isActive = true`)
    .limit(1);

  if (eligibleVoter.length === 0) {
    throw new Error("Delegate citizen ID not found or not eligible");
  }

  // Check if user already voted or delegated
  const existingVote = await db
    .select()
    .from(publicVotes)
    .where(
      and(
        eq(publicVotes.decisionId, decisionId),
        eq(publicVotes.userId, userId)
      )
    )
    .limit(1);

  if (existingVote.length > 0) {
    throw new Error("User has already voted on this decision");
  }

  // Record delegation with citizen ID
  // Note: We'll store the citizen ID in a separate field or use a modified citizenDelegates approach
  // For now, we'll create a custom delegation record
  await db.insert(citizenDelegates).values({
    userId,
    ministryId,
    delegateUserId: userId, // This would need to be the actual user ID of the delegate
    votingMethod: "delegate",
  });

  return { success: true, message: "Vote delegated to citizen successfully" };
}

/**
 * Remove or change delegation
 */
export async function removeDelegation(userId: number, ministryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  await db
    .delete(citizenDelegates)
    .where(
      and(
        eq(citizenDelegates.userId, userId),
        eq(citizenDelegates.ministryId, ministryId)
      )
    );

  return { success: true, message: "Delegation removed" };
}

/**
 * Calculate voting progress for a decision
 */
export async function calculateVotingProgress(decisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const decision = await db
    .select({
      votesFor: decisions.publicVotesFor,
      votesAgainst: decisions.publicVotesAgainst,
    })
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (decision.length === 0) {
    throw new Error("Decision not found");
  }

  const votesFor = decision[0].votesFor || 0;
  const votesAgainst = decision[0].votesAgainst || 0;
  const totalVotes = votesFor + votesAgainst;
  const percentageFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
  const percentageAgainst = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

  return {
    votesFor,
    votesAgainst,
    totalVotes,
    percentageFor: Math.round(percentageFor * 100) / 100,
    percentageAgainst: Math.round(percentageAgainst * 100) / 100,
  };
}

/**
 * Calculate time remaining for voting
 */
export async function calculateTimeRemaining(decisionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const decision = await db
    .select({
      votingEndsAt: decisions.publicVotingEndsAt,
    })
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (decision.length === 0) {
    throw new Error("Decision not found");
  }

  const now = new Date();
  const endsAt = new Date(decision[0].votingEndsAt || 0);
  const diffMs = endsAt.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return {
      isActive: false,
      hoursRemaining: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      displayText: "Voting has ended",
    };
  }

  const hoursRemaining = Math.floor(diffMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((diffMs % (1000 * 60)) / 1000);

  let displayText = "";
  if (hoursRemaining > 0) {
    displayText = `${hoursRemaining}h ${minutesRemaining}m remaining`;
  } else if (minutesRemaining > 0) {
    displayText = `${minutesRemaining}m ${secondsRemaining}s remaining`;
  } else {
    displayText = `${secondsRemaining}s remaining`;
  }

  return {
    isActive: true,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    displayText,
  };
}

/**
 * Get user's voting history
 */
export async function getVotingHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  const votes = await db
    .select({
      decisionId: publicVotes.decisionId,
      vote: publicVotes.vote,
      createdAt: publicVotes.createdAt,
      decisionTitle: decisions.title,
    })
    .from(publicVotes)
    .leftJoin(decisions, eq(publicVotes.decisionId, decisions.id))
    .where(eq(publicVotes.userId, userId))
    .orderBy(sql`${publicVotes.createdAt} DESC`);

  return votes;
}
