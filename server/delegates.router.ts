import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getDelegatesForMinistry,
  assignDelegate,
  getCitizenDelegateAssignments,
  getDelegateAssignmentForMinistry,
  createDelegate,
  getDelegateVotesForDecision,
  countDelegateVotesForDecision,
  recordDelegateVote,
  getDelegateStats,
} from "./delegates";

export const delegatesRouter = router({
  // Get all delegates for a ministry
  listByMinistry: publicProcedure
    .input(z.object({ ministryId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegatesForMinistry(input.ministryId);
    }),

  // Assign a delegate to a citizen for a ministry
  assign: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        ministryId: z.number(),
        delegateId: z.number().nullable(),
        delegateUserId: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await assignDelegate(
        input.userId,
        input.ministryId,
        input.delegateId,
        input.delegateUserId
      );
      return { success };
    }),

  // Get all delegate assignments for a citizen
  getCitizenAssignments: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return await getCitizenDelegateAssignments(input.userId);
    }),

  // Get delegate assignment for a specific ministry
  getAssignmentForMinistry: publicProcedure
    .input(z.object({ userId: z.number(), ministryId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegateAssignmentForMinistry(input.userId, input.ministryId);
    }),

  // Create a new delegate (candidate for ministry)
  create: publicProcedure
    .input(
      z.object({
        ministryId: z.number(),
        userId: z.number(),
        name: z.string(),
        bio: z.string(),
        values: z.array(z.string()),
        expertise: z.array(z.string()),
        profileImage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const delegateId = await createDelegate(
        input.ministryId,
        input.userId,
        input.name,
        input.bio,
        input.values,
        input.expertise,
        input.profileImage
      );
      return { success: !!delegateId, delegateId };
    }),

  // Get delegate votes for a decision
  getVotesForDecision: publicProcedure
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegateVotesForDecision(input.decisionId);
    }),

  // Count delegate votes for a decision
  countVotesForDecision: publicProcedure
    .input(z.object({ decisionId: z.number() }))
    .query(async ({ input }) => {
      return await countDelegateVotesForDecision(input.decisionId);
    }),

  // Record a delegate vote
  recordVote: publicProcedure
    .input(
      z.object({
        decisionId: z.number(),
        delegateId: z.number(),
        vote: z.enum(["for", "against"]),
        votesRepresented: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await recordDelegateVote(
        input.decisionId,
        input.delegateId,
        input.vote,
        input.votesRepresented
      );
      return { success };
    }),

  // Get delegate statistics
  getStats: publicProcedure
    .input(z.object({ delegateId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegateStats(input.delegateId);
    }),

  // Search for a citizen by ID (for direct delegation)
  searchCitizen: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await (await import("./db")).getDb();
      if (!db) return null;
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const result = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      return result.length > 0 ? { id: result[0].id, name: result[0].name, email: result[0].email } : null;
    }),

  // Validate citizen delegation (check if user exists and is not the delegator)
  validateCitizenDelegation: publicProcedure
    .input(z.object({ delegatorId: z.number(), delegateUserId: z.number() }))
    .query(async ({ input }) => {
      if (input.delegatorId === input.delegateUserId) {
        return { valid: false, error: "לא ניתן להאציל קול לעצמך" };
      }
      const db = await (await import("./db")).getDb();
      if (!db) return { valid: false, error: "שגיאה בחיבור למסד הנתונים" };
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const result = await db.select().from(users).where(eq(users.id, input.delegateUserId)).limit(1);
      if (result.length === 0) {
        return { valid: false, error: "אזרח זה לא קיים במערכת" };
      }
      return { valid: true, citizen: { id: result[0].id, name: result[0].name, email: result[0].email } };
    }),
});
