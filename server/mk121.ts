import { eq, and, desc, gt, lt } from "drizzle-orm";
import {
  mk121Cycles,
  mk121Bills,
  mk121Questions,
  mk121BillVotes,
  mk121QuestionVotes,
  mk121BillSupporters,
  mk121QuestionSupporters,
} from "../drizzle/schema";
import { getDb } from "./db";

export async function getCurrentCycle() {
  const db = await getDb();
  if (!db) return null;

  try {
    const now = new Date();
    const cycle = await db
      .select()
      .from(mk121Cycles)
      .where(and(eq(mk121Cycles.status, "active"), lt(mk121Cycles.startDate, now), gt(mk121Cycles.endDate, now)))
      .limit(1);

    return cycle[0] || null;
  } catch (error) {
    console.error("[MK121] Error getting current cycle:", error);
    return null;
  }
}

export async function createCycle(cycleNumber: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(mk121Cycles).values({
      cycleNumber,
      startDate,
      endDate,
      status: "active",
    });

    const created = await db
      .select()
      .from(mk121Cycles)
      .where(eq(mk121Cycles.cycleNumber, cycleNumber))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[MK121] Error creating cycle:", error);
    return null;
  }
}

export async function createBillProposal(
  cycleId: number,
  title: string,
  description: string,
  proposedBy: number,
  category?: string,
  createdCycleNumber?: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get the cycle to find its cycle number
    const cycle = await db
      .select()
      .from(mk121Cycles)
      .where(eq(mk121Cycles.id, cycleId))
      .limit(1);

    const cycleNum = createdCycleNumber || cycle[0]?.cycleNumber || 1;

    await db.insert(mk121Bills).values({
      cycleId,
      title,
      description,
      proposedBy,
      category,
      createdCycleNumber: cycleNum,
      status: "preliminary",
    });

    const created = await db
      .select()
      .from(mk121Bills)
      .where(and(eq(mk121Bills.cycleId, cycleId), eq(mk121Bills.title, title)))
      .orderBy(desc(mk121Bills.createdAt))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[MK121] Error creating bill proposal:", error);
    return null;
  }
}

export async function createQuestionProposal(
  cycleId: number,
  title: string,
  description: string,
  proposedBy: number,
  targetMinistry?: string,
  urgency: "low" | "medium" | "high" = "medium",
  createdCycleNumber?: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get the cycle to find its cycle number
    const cycle = await db
      .select()
      .from(mk121Cycles)
      .where(eq(mk121Cycles.id, cycleId))
      .limit(1);

    const cycleNum = createdCycleNumber || cycle[0]?.cycleNumber || 1;

    await db.insert(mk121Questions).values({
      cycleId,
      title,
      description,
      proposedBy,
      targetMinistry,
      urgency,
      createdCycleNumber: cycleNum,
      status: "preliminary",
    });

    const created = await db
      .select()
      .from(mk121Questions)
      .where(and(eq(mk121Questions.cycleId, cycleId), eq(mk121Questions.title, title)))
      .orderBy(desc(mk121Questions.createdAt))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[MK121] Error creating question proposal:", error);
    return null;
  }
}

export async function getBillsForCycle(cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const bills = await db
      .select()
      .from(mk121Bills)
      .where(eq(mk121Bills.cycleId, cycleId))
      .orderBy(desc(mk121Bills.votes));

    return bills;
  } catch (error) {
    console.error("[MK121] Error getting bills for cycle:", error);
    return [];
  }
}

export async function getQuestionsForCycle(cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const questions = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.cycleId, cycleId))
      .orderBy(desc(mk121Questions.votes));

    return questions;
  } catch (error) {
    console.error("[MK121] Error getting questions for cycle:", error);
    return [];
  }
}

export async function voteBill(billId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if user already voted for this bill
    const existing = await db
      .select()
      .from(mk121BillVotes)
      .where(and(eq(mk121BillVotes.billId, billId), eq(mk121BillVotes.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return false; // Already voted
    }

    // Add vote
    await db.insert(mk121BillVotes).values({
      billId,
      userId,
    });

    // Update vote count
    const bill = await db.select().from(mk121Bills).where(eq(mk121Bills.id, billId)).limit(1);

    if (bill.length > 0) {
      await db
        .update(mk121Bills)
        .set({
          votes: (bill[0].votes || 0) + 1,
        })
        .where(eq(mk121Bills.id, billId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error voting bill:", error);
    return false;
  }
}

export async function voteQuestion(questionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if user already voted for this question
    const existing = await db
      .select()
      .from(mk121QuestionVotes)
      .where(and(eq(mk121QuestionVotes.questionId, questionId), eq(mk121QuestionVotes.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return false; // Already voted
    }

    // Add vote
    await db.insert(mk121QuestionVotes).values({
      questionId,
      userId,
    });

    // Update vote count
    const question = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.id, questionId))
      .limit(1);

    if (question.length > 0) {
      await db
        .update(mk121Questions)
        .set({
          votes: (question[0].votes || 0) + 1,
        })
        .where(eq(mk121Questions.id, questionId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error voting question:", error);
    return false;
  }
}

export async function completeCycle(cycleId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get the winning bill and question
    const bills = await db
      .select()
      .from(mk121Bills)
      .where(eq(mk121Bills.cycleId, cycleId))
      .orderBy(desc(mk121Bills.votes))
      .limit(1);

    const questions = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.cycleId, cycleId))
      .orderBy(desc(mk121Questions.votes))
      .limit(1);

    const winningBillId = bills[0]?.id || null;
    const winningQuestionId = questions[0]?.id || null;

    // Mark winners
    if (winningBillId) {
      await db
        .update(mk121Bills)
        .set({ isWinner: true })
        .where(eq(mk121Bills.id, winningBillId));
    }

    if (winningQuestionId) {
      await db
        .update(mk121Questions)
        .set({ isWinner: true })
        .where(eq(mk121Questions.id, winningQuestionId));
    }

    // Update cycle status
    await db
      .update(mk121Cycles)
      .set({
        status: "completed",
        winningBillId,
        winningQuestionId,
      })
      .where(eq(mk121Cycles.id, cycleId));

    return true;
  } catch (error) {
    console.error("[MK121] Error completing cycle:", error);
    return false;
  }
}

export async function getUserBillVotes(userId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const votes = await db
      .select({ billId: mk121BillVotes.billId })
      .from(mk121BillVotes)
      .innerJoin(mk121Bills, eq(mk121BillVotes.billId, mk121Bills.id))
      .where(and(eq(mk121BillVotes.userId, userId), eq(mk121Bills.cycleId, cycleId)));

    return votes.map((v) => v.billId);
  } catch (error) {
    console.error("[MK121] Error getting user bill votes:", error);
    return [];
  }
}

export async function getUserQuestionVotes(userId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const votes = await db
      .select({ questionId: mk121QuestionVotes.questionId })
      .from(mk121QuestionVotes)
      .innerJoin(mk121Questions, eq(mk121QuestionVotes.questionId, mk121Questions.id))
      .where(and(eq(mk121QuestionVotes.userId, userId), eq(mk121Questions.cycleId, cycleId)));

    return votes.map((v) => v.questionId);
  } catch (error) {
    console.error("[MK121] Error getting user question votes:", error);
    return [];
  }
}


// Support functions for preliminary stage
export async function supportBill(billId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if user already supports this bill
    const existing = await db
      .select()
      .from(mk121BillSupporters)
      .where(and(eq(mk121BillSupporters.billId, billId), eq(mk121BillSupporters.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return false; // Already supporting
    }

    // Add support
    await db.insert(mk121BillSupporters).values({
      billId,
      userId,
    });

    // Update supporter count
    const bill = await db.select().from(mk121Bills).where(eq(mk121Bills.id, billId)).limit(1);

    if (bill.length > 0) {
      const newSupportCount = (bill[0].supporters || 0) + 1;
      await db
        .update(mk121Bills)
        .set({
          supporters: newSupportCount,
          status: newSupportCount >= 100 ? "voting" : "preliminary",
        })
        .where(eq(mk121Bills.id, billId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error supporting bill:", error);
    return false;
  }
}

export async function removeBillSupport(billId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Remove support
    await db
      .delete(mk121BillSupporters)
      .where(and(eq(mk121BillSupporters.billId, billId), eq(mk121BillSupporters.userId, userId)));

    // Update supporter count
    const bill = await db.select().from(mk121Bills).where(eq(mk121Bills.id, billId)).limit(1);

    if (bill.length > 0) {
      const newSupportCount = Math.max(0, (bill[0].supporters || 0) - 1);
      await db
        .update(mk121Bills)
        .set({
          supporters: newSupportCount,
          status: newSupportCount >= 100 ? "voting" : "preliminary",
        })
        .where(eq(mk121Bills.id, billId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error removing bill support:", error);
    return false;
  }
}

export async function supportQuestion(questionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Check if user already supports this question
    const existing = await db
      .select()
      .from(mk121QuestionSupporters)
      .where(and(eq(mk121QuestionSupporters.questionId, questionId), eq(mk121QuestionSupporters.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return false; // Already supporting
    }

    // Add support
    await db.insert(mk121QuestionSupporters).values({
      questionId,
      userId,
    });

    // Update supporter count
    const question = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.id, questionId))
      .limit(1);

    if (question.length > 0) {
      const newSupportCount = (question[0].supporters || 0) + 1;
      await db
        .update(mk121Questions)
        .set({
          supporters: newSupportCount,
          status: newSupportCount >= 100 ? "voting" : "preliminary",
        })
        .where(eq(mk121Questions.id, questionId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error supporting question:", error);
    return false;
  }
}

export async function removeQuestionSupport(questionId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Remove support
    await db
      .delete(mk121QuestionSupporters)
      .where(and(eq(mk121QuestionSupporters.questionId, questionId), eq(mk121QuestionSupporters.userId, userId)));

    // Update supporter count
    const question = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.id, questionId))
      .limit(1);

    if (question.length > 0) {
      const newSupportCount = Math.max(0, (question[0].supporters || 0) - 1);
      await db
        .update(mk121Questions)
        .set({
          supporters: newSupportCount,
          status: newSupportCount >= 100 ? "voting" : "preliminary",
        })
        .where(eq(mk121Questions.id, questionId));
    }

    return true;
  } catch (error) {
    console.error("[MK121] Error removing question support:", error);
    return false;
  }
}

// Calculate quorum threshold (total voters ÷ 120)
export async function calculateQuorumThreshold(cycleId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Count unique voters in this cycle
    const billVoters = await db
      .select({ userId: mk121BillVotes.userId })
      .from(mk121BillVotes)
      .innerJoin(mk121Bills, eq(mk121BillVotes.billId, mk121Bills.id))
      .where(eq(mk121Bills.cycleId, cycleId));

    const questionVoters = await db
      .select({ userId: mk121QuestionVotes.userId })
      .from(mk121QuestionVotes)
      .innerJoin(mk121Questions, eq(mk121QuestionVotes.questionId, mk121Questions.id))
      .where(eq(mk121Questions.cycleId, cycleId));

    const uniqueVoters = new Set([
      ...billVoters.map((v) => v.userId),
      ...questionVoters.map((v) => v.userId),
    ]);

    const totalVoters = uniqueVoters.size;
    const quorum = Math.ceil(totalVoters / 120);

    return quorum;
  } catch (error) {
    console.error("[MK121] Error calculating quorum:", error);
    return 0;
  }
}

// Check if winning proposal meets quorum and handle advancement
export async function checkAndAdvanceProposals(cycleId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const quorum = await calculateQuorumThreshold(cycleId);

    // Get winning bill
    const bills = await db
      .select()
      .from(mk121Bills)
      .where(eq(mk121Bills.cycleId, cycleId))
      .orderBy(desc(mk121Bills.votes))
      .limit(1);

    if (bills.length > 0) {
      const winningBill = bills[0];
      if ((winningBill.votes || 0) >= quorum) {
        // Quorum met - approve
        await db
          .update(mk121Bills)
          .set({ status: "approved", quorumMet: true })
          .where(eq(mk121Bills.id, winningBill.id));
      } else {
        // Quorum not met - advance to next cycle
        const nextCycle = await db
          .select()
          .from(mk121Cycles)
          .where(eq(mk121Cycles.cycleNumber, (await getCurrentCycle())?.cycleNumber || 1 + 1))
          .limit(1);

        if (nextCycle.length > 0) {
          await db
            .update(mk121Bills)
            .set({ cycleId: nextCycle[0].id, status: "preliminary", votes: 0 })
            .where(eq(mk121Bills.id, winningBill.id));
        }
      }
    }

    // Get winning question
    const questions = await db
      .select()
      .from(mk121Questions)
      .where(eq(mk121Questions.cycleId, cycleId))
      .orderBy(desc(mk121Questions.votes))
      .limit(1);

    if (questions.length > 0) {
      const winningQuestion = questions[0];
      if ((winningQuestion.votes || 0) >= quorum) {
        // Quorum met - approve
        await db
          .update(mk121Questions)
          .set({ status: "approved", quorumMet: true })
          .where(eq(mk121Questions.id, winningQuestion.id));
      } else {
        // Quorum not met - advance to next cycle
        const nextCycle = await db
          .select()
          .from(mk121Cycles)
          .where(eq(mk121Cycles.cycleNumber, (await getCurrentCycle())?.cycleNumber || 1 + 1))
          .limit(1);

        if (nextCycle.length > 0) {
          await db
            .update(mk121Questions)
            .set({ cycleId: nextCycle[0].id, status: "preliminary", votes: 0 })
            .where(eq(mk121Questions.id, winningQuestion.id));
        }
      }
    }
  } catch (error) {
    console.error("[MK121] Error checking and advancing proposals:", error);
  }
}

// Archive proposals older than 4 years (8 cycles)
export async function archiveExpiredProposals(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const now = new Date();
    const fourYearsAgo = new Date(now.getTime() - 4 * 365.25 * 24 * 60 * 60 * 1000);

    // Archive old bills
    await db
      .update(mk121Bills)
      .set({ status: "archived", archivedAt: now })
      .where(and(lt(mk121Bills.createdAt, fourYearsAgo), eq(mk121Bills.status, "preliminary")));

    // Archive old questions
    await db
      .update(mk121Questions)
      .set({ status: "archived", archivedAt: now })
      .where(and(lt(mk121Questions.createdAt, fourYearsAgo), eq(mk121Questions.status, "preliminary")));
  } catch (error) {
    console.error("[MK121] Error archiving expired proposals:", error);
  }
}

export async function getUserBillSupports(userId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const supports = await db
      .select({ billId: mk121BillSupporters.billId })
      .from(mk121BillSupporters)
      .innerJoin(mk121Bills, eq(mk121BillSupporters.billId, mk121Bills.id))
      .where(and(eq(mk121BillSupporters.userId, userId), eq(mk121Bills.cycleId, cycleId)));

    return supports.map((s) => s.billId);
  } catch (error) {
    console.error("[MK121] Error getting user bill supports:", error);
    return [];
  }
}

export async function getUserQuestionSupports(userId: number, cycleId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const supports = await db
      .select({ questionId: mk121QuestionSupporters.questionId })
      .from(mk121QuestionSupporters)
      .innerJoin(mk121Questions, eq(mk121QuestionSupporters.questionId, mk121Questions.id))
      .where(and(eq(mk121QuestionSupporters.userId, userId), eq(mk121Questions.cycleId, cycleId)));

    return supports.map((s) => s.questionId);
  } catch (error) {
    console.error("[MK121] Error getting user question supports:", error);
    return [];
  }
}
