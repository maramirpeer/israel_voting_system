import { getDb } from "./db";
import { citizenDelegates, delegates, users } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export interface DelegationChain {
  delegateId: number;
  delegateName: string;
  delegateEmail: string;
  totalVotesRepresented: number;
  directDelegations: number;
  chainDelegations: number;
  delegators: DelegatorInfo[];
}

export interface DelegatorInfo {
  userId: number;
  userName: string;
  userEmail: string;
  delegationType: "direct" | "chain";
}

export interface DelegationStats {
  ministryId: number;
  totalCitizens: number;
  directVoters: number;
  delegatedVoters: number;
  topDelegates: DelegationChain[];
  delegationChains: DelegationChain[];
}

/**
 * Get all citizens who delegated to a specific delegate
 */
export async function getDelegatorsByDelegate(
  ministryId: number,
  delegateId: number
): Promise<DelegatorInfo[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        userId: citizenDelegates.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(citizenDelegates)
      .innerJoin(users, eq(citizenDelegates.userId, users.id))
      .where(
        and(
          eq(citizenDelegates.ministryId, ministryId),
          eq(citizenDelegates.delegateId, delegateId),
          eq(citizenDelegates.votingMethod, "delegate")
        )
      );

    return result.map((r) => ({
      userId: r.userId,
      userName: r.userName || "Unknown",
      userEmail: r.userEmail || "",
      delegationType: "direct" as const,
    }));
  } catch (error) {
    console.error("[Delegation Analytics] Error getting delegators:", error);
    return [];
  }
}

/**
 * Get all citizens who delegated to a specific citizen
 */
export async function getDelegatorsByCitizen(
  ministryId: number,
  delegateUserId: number
): Promise<DelegatorInfo[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select({
        userId: citizenDelegates.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(citizenDelegates)
      .innerJoin(users, eq(citizenDelegates.userId, users.id))
      .where(
        and(
          eq(citizenDelegates.ministryId, ministryId),
          eq(citizenDelegates.delegateUserId, delegateUserId),
          eq(citizenDelegates.votingMethod, "delegate")
        )
      );

    return result.map((r) => ({
      userId: r.userId,
      userName: r.userName || "Unknown",
      userEmail: r.userEmail || "",
      delegationType: "direct" as const,
    }));
  } catch (error) {
    console.error("[Delegation Analytics] Error getting citizen delegators:", error);
    return [];
  }
}

/**
 * Get delegation chains for a ministry
 */
export async function getDelegationChains(ministryId: number): Promise<DelegationChain[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get all delegates for this ministry
    const delegatesList = await db
      .select()
      .from(delegates)
      .where(eq(delegates.ministryId, ministryId));

    const chains: DelegationChain[] = [];

    for (const delegate of delegatesList) {
      const delegators = await getDelegatorsByDelegate(ministryId, delegate.id);
      chains.push({
        delegateId: delegate.id,
        delegateName: delegate.name,
        delegateEmail: delegate.userId.toString(), // Store userId as reference
        totalVotesRepresented: delegators.length + 1, // +1 for self
        directDelegations: delegators.length,
        chainDelegations: 0, // TODO: implement chain delegation counting
        delegators,
      });
    }

    return chains.sort((a, b) => b.totalVotesRepresented - a.totalVotesRepresented);
  } catch (error) {
    console.error("[Delegation Analytics] Error getting delegation chains:", error);
    return [];
  }
}

/**
 * Get delegation statistics for a ministry
 */
export async function getDelegationStats(ministryId: number): Promise<DelegationStats> {
  const db = await getDb();
  if (!db) {
    return {
      ministryId,
      totalCitizens: 0,
      directVoters: 0,
      delegatedVoters: 0,
      topDelegates: [],
      delegationChains: [],
    };
  }

  try {
    // Get total citizens
    const totalCitizensResult = await db.select().from(users);
    const totalCitizens = totalCitizensResult.length;

    // Get direct voters
    const directVotersResult = await db
      .select()
      .from(citizenDelegates)
      .where(
        and(
          eq(citizenDelegates.ministryId, ministryId),
          eq(citizenDelegates.votingMethod, "direct")
        )
      );
    const directVoters = directVotersResult.length;

    // Get delegated voters
    const delegatedVotersResult = await db
      .select()
      .from(citizenDelegates)
      .where(
        and(
          eq(citizenDelegates.ministryId, ministryId),
          eq(citizenDelegates.votingMethod, "delegate")
        )
      );
    const delegatedVoters = delegatedVotersResult.length;

    // Get delegation chains
    const delegationChains = await getDelegationChains(ministryId);
    const topDelegates = delegationChains.slice(0, 5);

    return {
      ministryId,
      totalCitizens,
      directVoters,
      delegatedVoters,
      topDelegates,
      delegationChains,
    };
  } catch (error) {
    console.error("[Delegation Analytics] Error getting delegation stats:", error);
    return {
      ministryId,
      totalCitizens: 0,
      directVoters: 0,
      delegatedVoters: 0,
      topDelegates: [],
      delegationChains: [],
    };
  }
}

/**
 * Get delegation tree for a specific delegate
 */
export async function getDelegationTree(
  ministryId: number,
  delegateId: number
): Promise<{
  delegate: { id: number; name: string };
  delegators: DelegatorInfo[];
  totalVotes: number;
}> {
  const delegators = await getDelegatorsByDelegate(ministryId, delegateId);
  
  const db = await getDb();
  if (!db) {
    return {
      delegate: { id: delegateId, name: "Unknown" },
      delegators,
      totalVotes: delegators.length,
    };
  }

  try {
    const delegateData = await db
      .select()
      .from(delegates)
      .where(eq(delegates.id, delegateId))
      .limit(1);

    return {
      delegate: delegateData.length > 0 ? { id: delegateId, name: delegateData[0].name } : { id: delegateId, name: "Unknown" },
      delegators,
      totalVotes: delegators.length + 1,
    };
  } catch (error) {
    console.error("[Delegation Analytics] Error getting delegation tree:", error);
    return {
      delegate: { id: delegateId, name: "Unknown" },
      delegators,
      totalVotes: delegators.length,
    };
  }
}
