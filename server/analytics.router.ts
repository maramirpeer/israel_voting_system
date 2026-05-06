import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getMinistryStats, getMinistryDecisions, getAllMinistriesStats, getApprovalTrends } from "./analytics";

export const analyticsRouter = router({
  ministry: router({
    stats: publicProcedure
      .input(z.object({ ministryId: z.number() }))
      .query(async ({ input }) => {
        return await getMinistryStats(input.ministryId);
      }),

    decisions: publicProcedure
      .input(z.object({ ministryId: z.number() }))
      .query(async ({ input }) => {
        return await getMinistryDecisions(input.ministryId);
      }),

    trends: publicProcedure
      .input(z.object({ ministryId: z.number() }))
      .query(async ({ input }) => {
        return await getApprovalTrends(input.ministryId);
      }),
  }),

  allMinistries: publicProcedure.query(async () => {
    return await getAllMinistriesStats();
  }),
});
