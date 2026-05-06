import { eq, and, desc, gt, lt } from "drizzle-orm";
import {
  mk121Cycles,
  mk121Bills,
  mk121Questions,
  mk121BillVotes,
  mk121QuestionVotes,
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
  category?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(mk121Bills).values({
      cycleId,
      title,
      description,
      proposedBy,
      category,
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
  urgency: "low" | "medium" | "high" = "medium"
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(mk121Questions).values({
      cycleId,
      title,
      description,
      proposedBy,
      targetMinistry,
      urgency,
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
