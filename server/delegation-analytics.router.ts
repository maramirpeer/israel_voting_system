import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getDelegationStats,
  getDelegationTree,
  getDelegatorsByDelegate,
  getDelegatorsByCitizen,
} from "./delegation-analytics";

export const delegationAnalyticsRouter = router({
  // Get delegation statistics for a ministry
  getStats: publicProcedure
    .input(z.object({ ministryId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegationStats(input.ministryId);
    }),

  // Get delegation tree for a specific delegate
  getTree: publicProcedure
    .input(z.object({ ministryId: z.number(), delegateId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegationTree(input.ministryId, input.delegateId);
    }),

  // Get delegators for a delegate
  getDelegatorsByDelegate: publicProcedure
    .input(z.object({ ministryId: z.number(), delegateId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegatorsByDelegate(input.ministryId, input.delegateId);
    }),

  // Get delegators for a citizen
  getDelegatorsByCitizen: publicProcedure
    .input(z.object({ ministryId: z.number(), delegateUserId: z.number() }))
    .query(async ({ input }) => {
      return await getDelegatorsByCitizen(input.ministryId, input.delegateUserId);
    }),
});
