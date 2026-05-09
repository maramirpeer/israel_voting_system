import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getCurrentCycle,
  createCycle,
  createBillProposal,
  createQuestionProposal,
  getBillsForCycle,
  getQuestionsForCycle,
  voteBill,
  voteQuestion,
  completeCycle,
  getUserBillVotes,
  getUserQuestionVotes,
  supportBill,
  removeBillSupport,
  supportQuestion,
  removeQuestionSupport,
  calculateQuorumThreshold,
  checkAndAdvanceProposals,
  archiveExpiredProposals,
  getUserBillSupports,
  getUserQuestionSupports,
  getUserPreliminaryBills,
  getUserPreliminaryQuestions,
  getMinistriesList,
  getQuestionsByMinistry,
} from "./mk121";

export const mk121Router = router({
  // Get current active cycle
  getCurrentCycle: publicProcedure.query(async () => {
    return await getCurrentCycle();
  }),

  // Create a new cycle (admin only)
  createCycle: publicProcedure
    .input(
      z.object({
        cycleNumber: z.number(),
        seasonName: z.enum(["אביב", "קיץ", "סתיו", "חורף"]),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const cycle = await createCycle(input.cycleNumber, input.seasonName, input.startDate, input.endDate);
      return { success: !!cycle, cycle };
    }),

  // Propose a bill
  proposeBill: publicProcedure
    .input(
      z.object({
        cycleId: z.number(),
        title: z.string(),
        description: z.string(),
        proposedBy: z.number(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const bill = await createBillProposal(
        input.cycleId,
        input.title,
        input.description,
        input.proposedBy,
        input.category
      );
      return { success: !!bill, bill };
    }),

  // Propose a question
  proposeQuestion: publicProcedure
    .input(
      z.object({
        cycleId: z.number(),
        title: z.string(),
        description: z.string(),
        proposedBy: z.number(),
        targetMinistry: z.string().optional(),
        urgency: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const question = await createQuestionProposal(
        input.cycleId,
        input.title,
        input.description,
        input.proposedBy,
        input.targetMinistry,
        input.urgency || "medium"
      );
      return { success: !!question, question };
    }),

  // Get bills for a cycle
  getBillsForCycle: publicProcedure
    .input(z.object({ cycleId: z.number() }))
    .query(async ({ input }) => {
      return await getBillsForCycle(input.cycleId);
    }),

  // Get questions for a cycle
  getQuestionsForCycle: publicProcedure
    .input(z.object({ cycleId: z.number() }))
    .query(async ({ input }) => {
      return await getQuestionsForCycle(input.cycleId);
    }),

  // Vote for a bill
  voteBill: publicProcedure
    .input(
      z.object({
        billId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await voteBill(input.billId, input.userId);
      return { success };
    }),

  // Vote for a question
  voteQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await voteQuestion(input.questionId, input.userId);
      return { success };
    }),

  // Complete a cycle (determine winners)
  completeCycle: publicProcedure
    .input(z.object({ cycleId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await completeCycle(input.cycleId);
      return { success };
    }),

  // Get user's bill votes for a cycle
  getUserBillVotes: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserBillVotes(input.userId, input.cycleId);
    }),

  // Get user's question votes for a cycle
  getUserQuestionVotes: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserQuestionVotes(input.userId, input.cycleId);
    }),

  // Submit a new bill proposal
  submitBillProposal: publicProcedure
    .input(
      z.object({
        cycleId: z.number(),
        title: z.string().min(5, "כותרת חייבת להיות לפחות 5 תווים").max(255),
        description: z.string().min(20, "תיאור חייב להיות לפחות 20 תווים").max(2000),
        category: z.string().max(100).optional(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const bill = await createBillProposal(
        input.cycleId,
        input.title,
        input.description,
        input.userId,
        input.category
      );
      return { success: !!bill, bill };
    }),

  // Submit a new question proposal
  submitQuestionProposal: publicProcedure
    .input(
      z.object({
        cycleId: z.number(),
        title: z.string().min(5, "כותרת חייבת להיות לפחות 5 תווים").max(255),
        description: z.string().min(20, "תיאור חייב להיות לפחות 20 תווים").max(2000),
        targetMinistry: z.string().max(255).optional(),
        urgency: z.enum(["low", "medium", "high"]).optional(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const question = await createQuestionProposal(
        input.cycleId,
        input.title,
        input.description,
        input.userId,
        input.targetMinistry,
        input.urgency || "medium"
      );
      return { success: !!question, question };
    }),

  // Support a bill proposal (preliminary stage)
  supportBill: publicProcedure
    .input(
      z.object({
        billId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await supportBill(input.billId, input.userId);
      return { success };
    }),

  // Remove support from a bill proposal
  removeBillSupport: publicProcedure
    .input(
      z.object({
        billId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await removeBillSupport(input.billId, input.userId);
      return { success };
    }),

  // Support a question proposal (preliminary stage)
  supportQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await supportQuestion(input.questionId, input.userId);
      return { success };
    }),

  // Remove support from a question proposal
  removeQuestionSupport: publicProcedure
    .input(
      z.object({
        questionId: z.number(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await removeQuestionSupport(input.questionId, input.userId);
      return { success };
    }),

  // Calculate quorum threshold for a cycle
  calculateQuorumThreshold: publicProcedure
    .input(z.object({ cycleId: z.number() }))
    .query(async ({ input }) => {
      const quorum = await calculateQuorumThreshold(input.cycleId);
      return { quorum };
    }),

  // Check and advance proposals to next cycle if quorum not met
  checkAndAdvanceProposals: publicProcedure
    .input(z.object({ cycleId: z.number() }))
    .mutation(async ({ input }) => {
      await checkAndAdvanceProposals(input.cycleId);
      return { success: true };
    }),

  // Archive expired proposals (older than 4 years)
  archiveExpiredProposals: publicProcedure.mutation(async () => {
    await archiveExpiredProposals();
    return { success: true };
  }),

  // Get user's bill supports for a cycle
  getUserBillSupports: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserBillSupports(input.userId, input.cycleId);
    }),

  // Get user's question supports for a cycle
  getUserQuestionSupports: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserQuestionSupports(input.userId, input.cycleId);
    }),

  // Get user's preliminary (draft) bills
  getUserPreliminaryBills: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserPreliminaryBills(input.userId, input.cycleId);
    }),

  // Get user's preliminary (draft) questions
  getUserPreliminaryQuestions: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        cycleId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getUserPreliminaryQuestions(input.userId, input.cycleId);
    }),

  // Get all ministries
  getMinistriesList: publicProcedure.query(async () => {
    return await getMinistriesList();
  }),

  // Get questions by ministry
  getQuestionsByMinistry: publicProcedure
    .input(z.object({ ministryId: z.number() }))
    .query(async ({ input }) => {
      return await getQuestionsByMinistry(input.ministryId);
    }),
});
