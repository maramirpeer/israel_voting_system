import { decisions, ministries, publicVotes, delegateVotes, users } from "../drizzle/schema";
import { getDb } from "./db";
import { count, countDistinct, eq, sql } from "drizzle-orm";

export interface MinistryStats {
  ministryId: number;
  ministryName: string;
  totalDecisions: number;
  approvedDecisions: number;
  rejectedDecisions: number;
  pendingDecisions: number;
  approvalRate: number;
  rejectionRate: number;
  averageVotesFor: number;
  averageVotesAgainst: number;
  mostVotedDecision: {
    title: string;
    totalVotes: number;
  } | null;
}

export interface DecisionAnalytics {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  approvalPercentage: number;
  rejectionPercentage: number;
  createdAt: Date;
  votingEndsAt: Date | null;
}

export async function getMinistryStats(ministryId: number): Promise<MinistryStats | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get ministry info
    const [ministry] = await db
      .select()
      .from(ministries)
      .where(eq(ministries.id, ministryId))
      .limit(1);

    if (!ministry) return null;

    // Get all decisions for this ministry
    const ministryDecisions = await db
      .select()
      .from(decisions)
      .where(eq(decisions.ministryId, ministryId));

    const totalDecisions = ministryDecisions.length;
    const approvedDecisions = ministryDecisions.filter((d) => d.status === "approved").length;
    const rejectedDecisions = ministryDecisions.filter((d) => d.status === "rejected").length;
    const pendingDecisions = ministryDecisions.filter((d) => d.status === "voting").length;

    const approvalRate = totalDecisions > 0 ? (approvedDecisions / totalDecisions) * 100 : 0;
    const rejectionRate = totalDecisions > 0 ? (rejectedDecisions / totalDecisions) * 100 : 0;

    // Calculate average votes
    let totalVotesFor = 0;
    let totalVotesAgainst = 0;
    let votedDecisions = 0;

    for (const decision of ministryDecisions) {
      if (decision.votesFor !== null && decision.votesAgainst !== null) {
        totalVotesFor += decision.votesFor;
        totalVotesAgainst += decision.votesAgainst;
        votedDecisions++;
      }
    }

    const averageVotesFor = votedDecisions > 0 ? totalVotesFor / votedDecisions : 0;
    const averageVotesAgainst = votedDecisions > 0 ? totalVotesAgainst / votedDecisions : 0;

    // Find most voted decision
    let mostVotedDecision = null;
    let maxVotes = 0;

    for (const decision of ministryDecisions) {
      const votesFor = decision.votesFor || 0;
      const votesAgainst = decision.votesAgainst || 0;
      const totalVotes = votesFor + votesAgainst;

      if (totalVotes > maxVotes) {
        maxVotes = totalVotes;
        mostVotedDecision = {
          title: decision.title,
          totalVotes,
        };
      }
    }

    return {
      ministryId,
      ministryName: ministry.name,
      totalDecisions,
      approvedDecisions,
      rejectedDecisions,
      pendingDecisions,
      approvalRate,
      rejectionRate,
      averageVotesFor,
      averageVotesAgainst,
      mostVotedDecision,
    };
  } catch (error) {
    console.error("[Analytics] Error getting ministry stats:", error);
    return null;
  }
}

export async function getMinistryDecisions(ministryId: number): Promise<DecisionAnalytics[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const ministryDecisions = await db
      .select()
      .from(decisions)
      .where(eq(decisions.ministryId, ministryId));

    return ministryDecisions.map((d) => {
      const votesFor = d.votesFor || 0;
      const votesAgainst = d.votesAgainst || 0;
      const totalVotes = votesFor + votesAgainst;
      const approvalPercentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
      const rejectionPercentage = totalVotes > 0 ? (votesAgainst / totalVotes) * 100 : 0;

      return {
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        status: d.status,
        votesFor,
        votesAgainst,
        totalVotes,
        approvalPercentage,
        rejectionPercentage,
        createdAt: d.createdAt,
        votingEndsAt: d.votingEndsAt,
      };
    });
  } catch (error) {
    console.error("[Analytics] Error getting ministry decisions:", error);
    return [];
  }
}

export async function getAllMinistriesStats(): Promise<MinistryStats[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const allMinistries = await db.select().from(ministries);
    const stats: MinistryStats[] = [];

    for (const ministry of allMinistries) {
      const stat = await getMinistryStats(ministry.id);
      if (stat) {
        stats.push(stat);
      }
    }

    return stats;
  } catch (error) {
    console.error("[Analytics] Error getting all ministries stats:", error);
    return [];
  }
}

export async function getApprovalTrends(ministryId: number): Promise<{ month: string; approvalRate: number }[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const ministryDecisions = await db
      .select()
      .from(decisions)
      .where(eq(decisions.ministryId, ministryId));

    // Group by month
    const monthlyStats: { [key: string]: { approved: number; total: number } } = {};

    for (const decision of ministryDecisions) {
      if (decision.createdAt) {
        const date = new Date(decision.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { approved: 0, total: 0 };
        }

        monthlyStats[monthKey].total++;
        if (decision.status === "approved") {
          monthlyStats[monthKey].approved++;
        }
      }
    }

    // Convert to array and calculate rates
    return Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, stats]) => ({
        month,
        approvalRate: stats.total > 0 ? (stats.approved / stats.total) * 100 : 0,
      }));
  } catch (error) {
    console.error("[Analytics] Error getting approval trends:", error);
    return [];
  }
}


// Additional analytics functions for dashboard
import { count, sql } from "drizzle-orm";
import { publicVotes, delegateVotes, citizenDelegates, users } from "../drizzle/schema";

export interface VotingStats {
  totalVoters: number;
  totalVotes: number;
  participationRate: number;
  directVotes: number;
  delegatedVotes: number;
  delegationRate: number;
}

export interface EngagementMetrics {
  activeUsers: number;
  newUsersThisWeek: number;
  averageVotesPerUser: number;
  mostActiveMinistry: string;
  leastActiveMinistry: string;
}

export async function getOverallVotingStats(): Promise<VotingStats> {
  const db = await getDb();
  if (!db) {
    return {
      totalVoters: 0,
      totalVotes: 0,
      participationRate: 0,
      directVotes: 0,
      delegatedVotes: 0,
      delegationRate: 0,
    };
  }

  try {
    // Count total users
    const userCountResult = await db.select({ count: count() }).from(users);
    const totalVoters = userCountResult[0]?.count || 0;

    // Count unique users who have voted directly
    const uniqueDirectVotersResult = await db
      .select({ count: countDistinct(publicVotes.userId) })
      .from(publicVotes);
    const directVoters = uniqueDirectVotersResult[0]?.count || 0;

    // Count unique users who have delegated
    const uniqueDelegatedVotersResult = await db
      .select({ count: countDistinct(delegateVotes.userId) })
      .from(delegateVotes);
    const delegatedVoters = uniqueDelegatedVotersResult[0]?.count || 0;

    // Count total votes cast (can be multiple votes per user across different decisions)
    const directVotesResult = await db.select({ count: count() }).from(publicVotes);
    const directVotes = directVotesResult[0]?.count || 0;

    const delegatedVotesResult = await db.select({ count: count() }).from(delegateVotes);
    const delegatedVotes = delegatedVotesResult[0]?.count || 0;

    // Participation rate is based on unique voters, not total votes
    const totalVotes = directVotes + delegatedVotes;
    const participationRate = totalVoters > 0 ? ((directVoters + delegatedVoters) / totalVoters) * 100 : 0;
    const delegationRate = (directVoters + delegatedVoters) > 0 ? (delegatedVoters / (directVoters + delegatedVoters)) * 100 : 0;

    return {
      totalVoters,
      totalVotes,
      participationRate: Math.round(participationRate * 100) / 100,
      directVotes,
      delegatedVotes,
      delegationRate: Math.round(delegationRate * 100) / 100,
    };
  } catch (error) {
    console.error("[Analytics] Error getting overall voting stats:", error);
    return {
      totalVoters: 0,
      totalVotes: 0,
      participationRate: 0,
      directVotes: 0,
      delegatedVotes: 0,
      delegationRate: 0,
    };
  }
}

export async function getEngagementMetricsData(): Promise<EngagementMetrics> {
  const db = await getDb();
  if (!db) {
    return {
      activeUsers: 0,
      newUsersThisWeek: 0,
      averageVotesPerUser: 0,
      mostActiveMinistry: "Unknown",
      leastActiveMinistry: "Unknown",
    };
  }

  try {
    // Count active users (those who have voted)
    const activeUsersResult = await db
      .select({ count: count(sql`DISTINCT ${publicVotes.userId}`) })
      .from(publicVotes);
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Count new users this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersResult = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${oneWeekAgo}`);
    const newUsersThisWeek = newUsersResult[0]?.count || 0;

    // Calculate average votes per user
    const totalVotesResult = await db.select({ count: count() }).from(publicVotes);
    const totalVotes = totalVotesResult[0]?.count || 0;
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 1;

    const averageVotesPerUser = Math.round((totalVotes / totalUsers) * 100) / 100;

    // Get most and least active ministries
    const ministryActivity = await db
      .select({
        ministryId: decisions.ministryId,
        ministryName: ministries.name,
        voteCount: count(),
      })
      .from(decisions)
      .leftJoin(publicVotes, sql`${decisions.id} = ${publicVotes.decisionId}`)
      .leftJoin(ministries, sql`${decisions.ministryId} = ${ministries.id}`)
      .groupBy(decisions.ministryId, ministries.name)
      .orderBy(sql`COUNT(*) DESC`);

    const mostActiveMinistry =
      ministryActivity.length > 0 ? ministryActivity[0].ministryName || "Unknown" : "Unknown";
    const leastActiveMinistry =
      ministryActivity.length > 0
        ? ministryActivity[ministryActivity.length - 1].ministryName || "Unknown"
        : "Unknown";

    return {
      activeUsers,
      newUsersThisWeek,
      averageVotesPerUser,
      mostActiveMinistry,
      leastActiveMinistry,
    };
  } catch (error) {
    console.error("[Analytics] Error getting engagement metrics:", error);
    return {
      activeUsers: 0,
      newUsersThisWeek: 0,
      averageVotesPerUser: 0,
      mostActiveMinistry: "Unknown",
      leastActiveMinistry: "Unknown",
    };
  }
}
