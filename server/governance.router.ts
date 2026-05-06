import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllMinistries,
  getMinistryById,
  createDecision,
  getDecisionById,
  getDecisionsByMinistry,
  getAllDecisions,
  getActiveDecisions,
  updateDecisionStatus,
  updateDecisionVotes,
  castVote,
  getDecisionVotes,
  getUserVote,
  logDecisionHistory,
  getDecisionHistory,
} from "./governance";
import { TRPCError } from "@trpc/server";

export const governanceRouter = router({
  // Ministry procedures
  ministries: router({
    list: publicProcedure.query(async () => {
      return await getAllMinistries();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const ministry = await getMinistryById(input.id);
      if (!ministry) throw new TRPCError({ code: "NOT_FOUND" });
      return ministry;
    }),
  }),

  // Decision procedures
  decisions: router({
    list: publicProcedure.query(async () => {
      return await getAllDecisions();
    }),

    active: publicProcedure.query(async () => {
      return await getActiveDecisions();
    }),

    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const decision = await getDecisionById(input.id);
      if (!decision) throw new TRPCError({ code: "NOT_FOUND" });

      const votes = await getDecisionVotes(input.id);
      return {
        ...decision,
        votesFor: votes.for,
        votesAgainst: votes.against,
      };
    }),

    byMinistry: publicProcedure
      .input(z.object({ ministryId: z.number() }))
      .query(async ({ input }) => {
        return await getDecisionsByMinistry(input.ministryId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          ministryId: z.number(),
          title: z.string().min(1),
          description: z.string().min(1),
          category: z.enum(["major", "medium", "routine"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only ministers can create decisions
        if (ctx.user.role !== "minister" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const result = await createDecision({
          ministryId: input.ministryId,
          title: input.title,
          description: input.description,
          category: input.category,
          status: "proposed",
          proposedBy: ctx.user.id,
        });

        // Get the created decision
        const decisions = await getAllDecisions();
        const newDecision = decisions[0]; // Most recent

        if (newDecision) {
          await logDecisionHistory(
            newDecision.id,
            "created",
            ctx.user.id,
            { title: input.title }
          );
        }

        return result;
      }),

    startVoting: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.id);
        if (!decision) throw new TRPCError({ code: "NOT_FOUND" });

        if (ctx.user.role !== "minister" && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const votingStartsAt = new Date();
        const votingEndsAt = new Date(votingStartsAt.getTime() + 72 * 60 * 60 * 1000); // 72 hours

        await updateDecisionStatus(input.id, "voting");

        // Update voting times in database
        const db = await (await import("./db")).getDb();
        if (db) {
          await db
            .update((await import("../drizzle/schema")).decisions)
            .set({ votingStartsAt, votingEndsAt })
            .where(
              (await import("drizzle-orm")).eq(
                (await import("../drizzle/schema")).decisions.id,
                input.id
              )
            );
        }

        await logDecisionHistory(input.id, "voting_started", ctx.user.id);

        return { success: true, votingEndsAt };
      }),

    endVoting: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.id);
        if (!decision) throw new TRPCError({ code: "NOT_FOUND" });

        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const votes = await getDecisionVotes(input.id);
        const totalVotes = votes.for + votes.against;
        const percentageAgainst = totalVotes > 0 ? (votes.against / totalVotes) * 100 : 0;

        // 51% veto threshold
        const vetoed = percentageAgainst > 51;

        await updateDecisionVotes(input.id, votes.for, votes.against, vetoed);
        await logDecisionHistory(input.id, "voting_ended", ctx.user.id, {
          votesFor: votes.for,
          votesAgainst: votes.against,
          vetoed,
        });

        return {
          success: true,
          votesFor: votes.for,
          votesAgainst: votes.against,
          vetoed,
          status: vetoed ? "rejected" : "approved",
        };
      }),
  }),

  // Voting procedures
  votes: router({
    cast: protectedProcedure
      .input(
        z.object({
          decisionId: z.number(),
          vote: z.enum(["for", "against"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const decision = await getDecisionById(input.decisionId);
        if (!decision) throw new TRPCError({ code: "NOT_FOUND" });

        if (decision.status !== "voting") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Voting is not active for this decision" });
        }

        await castVote(input.decisionId, ctx.user.id, input.vote);
        await logDecisionHistory(input.decisionId, "vote_cast", ctx.user.id, { vote: input.vote });

        return { success: true };
      }),

    getByDecision: publicProcedure
      .input(z.object({ decisionId: z.number() }))
      .query(async ({ input }) => {
        return await getDecisionVotes(input.decisionId);
      }),

    getUserVote: protectedProcedure
      .input(z.object({ decisionId: z.number() }))
      .query(async ({ input, ctx }) => {
        return await getUserVote(input.decisionId, ctx.user.id);
      }),
  }),

  // History procedures
  history: router({
    getByDecision: publicProcedure
      .input(z.object({ decisionId: z.number() }))
      .query(async ({ input }) => {
        return await getDecisionHistory(input.decisionId);
      }),
  }),
});
