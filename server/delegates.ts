import { eq, and } from "drizzle-orm";
import { delegates, citizenDelegates, delegateVotes, decisions, ministries } from "../drizzle/schema";
import { getDb } from "./db";

export interface DelegateProfile {
  id: number;
  name: string;
  bio: string | null;
  values: string[] | null;
  expertise: string[] | null;
  profileImage: string | null;
  endorsements: number | null;
  ministryId: number;
  ministryName: string;
}

export interface CitizenDelegateAssignment {
  userId: number;
  ministryId: number;
  delegateId: number | null;
  delegateUserId: number | null;
  votingMethod: "direct" | "delegate";
  delegateName?: string;
}

export async function getDelegatesForMinistry(ministryId: number): Promise<DelegateProfile[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const delegatesList = await db
      .select()
      .from(delegates)
      .where(and(eq(delegates.ministryId, ministryId), eq(delegates.isActive, true)));

    const ministry = await db.select().from(ministries).where(eq(ministries.id, ministryId)).limit(1);
    const ministryName = ministry[0]?.name || "Unknown Ministry";

    console.log(`[getDelegatesForMinistry] Ministry ${ministryId}: Found ${delegatesList.length} active delegates`);

    return delegatesList.map((d) => ({
      id: d.id,
      name: d.name,
      bio: d.bio,
      values: d.values ? JSON.parse(d.values) : null,
      expertise: d.expertise ? JSON.parse(d.expertise) : null,
      profileImage: d.profileImage,
      endorsements: d.endorsements,
      ministryId: d.ministryId,
      ministryName,
    }));
  } catch (error) {
    console.error(`[Delegates] Error getting delegates for ministry ${ministryId}:`, error);
    return [];
  }
}

export async function assignDelegate(
  userId: number,
  ministryId: number,
  delegateId: number | null,
  delegateUserId: number | null
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const votingMethod = delegateId || delegateUserId ? "delegate" : "direct";

    // Check if assignment already exists
    const existing = await db
      .select()
      .from(citizenDelegates)
      .where(and(eq(citizenDelegates.userId, userId), eq(citizenDelegates.ministryId, ministryId)))
      .limit(1);

    const previousAssignment = existing.length > 0 ? existing[0] : null;

    if (existing.length > 0) {
      // Update existing assignment
      await db
        .update(citizenDelegates)
        .set({
          delegateId,
          delegateUserId,
          votingMethod,
          updatedAt: new Date(),
        })
        .where(
          and(eq(citizenDelegates.userId, userId), eq(citizenDelegates.ministryId, ministryId))
        );
    } else {
      // Create new assignment
      await db.insert(citizenDelegates).values({
        userId,
        ministryId,
        delegateId,
        delegateUserId,
        votingMethod,
      });
    }

    // Update endorsements count for the new delegate
    if (delegateId && delegateId > 0) {
      // Increment endorsements for new delegate
      const currentDelegate = await db.select().from(delegates).where(eq(delegates.id, delegateId)).limit(1);
      if (currentDelegate.length > 0) {
        await db
          .update(delegates)
          .set({
            endorsements: (currentDelegate[0].endorsements || 0) + 1,
          })
          .where(eq(delegates.id, delegateId));
      }
    }

    // Decrement endorsements for previous delegate if switching
    if (previousAssignment?.delegateId && previousAssignment.delegateId !== delegateId) {
      const prevDelegate = await db.select().from(delegates).where(eq(delegates.id, previousAssignment.delegateId)).limit(1);
      if (prevDelegate.length > 0) {
        await db
          .update(delegates)
          .set({
            endorsements: Math.max((prevDelegate[0].endorsements || 0) - 1, 0),
          })
          .where(eq(delegates.id, previousAssignment.delegateId));
      }
    }

    return true;
  } catch (error) {
    console.error("[Delegates] Error assigning delegate:", error);
    return false;
  }
}

export async function getCitizenDelegateAssignments(userId: number): Promise<CitizenDelegateAssignment[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const assignments = await db
      .select()
      .from(citizenDelegates)
      .where(eq(citizenDelegates.userId, userId));

    const result: CitizenDelegateAssignment[] = [];

    for (const assignment of assignments) {
      let delegateName: string | undefined;

      if (assignment.delegateId) {
        const delegate = await db
          .select()
          .from(delegates)
          .where(eq(delegates.id, assignment.delegateId))
          .limit(1);
        delegateName = delegate[0]?.name;
      }

      result.push({
        userId: assignment.userId,
        ministryId: assignment.ministryId,
        delegateId: assignment.delegateId,
        delegateUserId: assignment.delegateUserId,
        votingMethod: assignment.votingMethod,
        delegateName,
      });
    }

    return result;
  } catch (error) {
    console.error("[Delegates] Error getting citizen delegate assignments:", error);
    return [];
  }
}

export async function getDelegateAssignmentForMinistry(
  userId: number,
  ministryId: number
): Promise<CitizenDelegateAssignment | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const assignment = await db
      .select()
      .from(citizenDelegates)
      .where(and(eq(citizenDelegates.userId, userId), eq(citizenDelegates.ministryId, ministryId)))
      .limit(1);

    if (assignment.length === 0) return null;

    const a = assignment[0];
    let delegateName: string | undefined;

    if (a.delegateId) {
      const delegate = await db
        .select()
        .from(delegates)
        .where(eq(delegates.id, a.delegateId))
        .limit(1);
      delegateName = delegate[0]?.name;
    }

    return {
      userId: a.userId,
      ministryId: a.ministryId,
      delegateId: a.delegateId,
      delegateUserId: a.delegateUserId,
      votingMethod: a.votingMethod,
      delegateName,
    };
  } catch (error) {
    console.error("[Delegates] Error getting delegate assignment:", error);
    return null;
  }
}

export async function createDelegate(
  ministryId: number,
  userId: number,
  name: string,
  bio: string,
  values: string[],
  expertise: string[],
  profileImage?: string
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(delegates).values({
      ministryId,
      userId,
      name,
      bio,
      values: JSON.stringify(values),
      expertise: JSON.stringify(expertise),
      profileImage,
      isActive: true,
    });

    // Get the newly created delegate
    const created = await db
      .select()
      .from(delegates)
      .where(and(eq(delegates.ministryId, ministryId), eq(delegates.userId, userId)))
      .orderBy(delegates.createdAt)
      .limit(1);

    return created[0]?.id || null;
  } catch (error) {
    console.error("[Delegates] Error creating delegate:", error);
    return null;
  }
}

export async function getDelegateVotesForDecision(decisionId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const votes = await db
      .select()
      .from(delegateVotes)
      .where(eq(delegateVotes.decisionId, decisionId));

    return votes;
  } catch (error) {
    console.error("[Delegates] Error getting delegate votes:", error);
    return [];
  }
}

export async function countDelegateVotesForDecision(
  decisionId: number
): Promise<{ votesFor: number; votesAgainst: number }> {
  const db = await getDb();
  if (!db) return { votesFor: 0, votesAgainst: 0 };

  try {
    const votes = await db
      .select()
      .from(delegateVotes)
      .where(eq(delegateVotes.decisionId, decisionId));

    let votesFor = 0;
    let votesAgainst = 0;

    for (const vote of votes) {
      const votesRep = vote.votesRepresented || 1;
      if (vote.vote === "for") {
        votesFor += votesRep;
      } else {
        votesAgainst += votesRep;
      }
    }

    return { votesFor, votesAgainst };
  } catch (error) {
    console.error("[Delegates] Error counting delegate votes:", error);
    return { votesFor: 0, votesAgainst: 0 };
  }
}

export async function recordDelegateVote(
  decisionId: number,
  delegateId: number,
  vote: "for" | "against",
  votesRepresented: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.insert(delegateVotes).values({
      decisionId,
      delegateId,
      vote,
      votesRepresented,
    });

    return true;
  } catch (error) {
    console.error("[Delegates] Error recording delegate vote:", error);
    return false;
  }
}

export async function getDelegateStats(delegateId: number): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const delegate = await db
      .select()
      .from(delegates)
      .where(eq(delegates.id, delegateId))
      .limit(1);

    if (!delegate.length) return null;

    const votes = await db
      .select()
      .from(delegateVotes)
      .where(eq(delegateVotes.delegateId, delegateId));

    const citizens = await db
      .select()
      .from(citizenDelegates)
      .where(eq(citizenDelegates.delegateId, delegateId));

    return {
      delegate: delegate[0],
      totalVotesCast: votes.length,
      totalCitizensRepresented: citizens.length,
      votesFor: votes.filter((v) => v.vote === "for").length,
      votesAgainst: votes.filter((v) => v.vote === "against").length,
    };
  } catch (error) {
    console.error("[Delegates] Error getting delegate stats:", error);
    return null;
  }
}
