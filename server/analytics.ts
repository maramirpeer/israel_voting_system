import { eq } from "drizzle-orm";
import { decisions, ministries } from "../drizzle/schema";
import { getDb } from "./db";

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
