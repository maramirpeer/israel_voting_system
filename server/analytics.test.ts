import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getOverallVotingStats, getEngagementMetricsData, getAllMinistriesStats, getApprovalTrends } from "./analytics";

describe("Analytics Procedures", () => {
  describe("getOverallVotingStats", () => {
    it("should return voting stats with correct structure", async () => {
      const stats = await getOverallVotingStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty("totalVoters");
      expect(stats).toHaveProperty("totalVotes");
      expect(stats).toHaveProperty("participationRate");
      expect(stats).toHaveProperty("directVotes");
      expect(stats).toHaveProperty("delegatedVotes");
      expect(stats).toHaveProperty("delegationRate");
    });

    it("should return non-negative numbers", async () => {
      const stats = await getOverallVotingStats();
      
      expect(stats.totalVoters).toBeGreaterThanOrEqual(0);
      expect(stats.totalVotes).toBeGreaterThanOrEqual(0);
      expect(stats.participationRate).toBeGreaterThanOrEqual(0);
      expect(stats.directVotes).toBeGreaterThanOrEqual(0);
      expect(stats.delegatedVotes).toBeGreaterThanOrEqual(0);
      expect(stats.delegationRate).toBeGreaterThanOrEqual(0);
    });

    it("should have participation rate between 0 and 100", async () => {
      const stats = await getOverallVotingStats();
      
      expect(stats.participationRate).toBeLessThanOrEqual(100);
      expect(stats.participationRate).toBeGreaterThanOrEqual(0);
    });

    it("should have delegation rate between 0 and 100", async () => {
      const stats = await getOverallVotingStats();
      
      expect(stats.delegationRate).toBeLessThanOrEqual(100);
      expect(stats.delegationRate).toBeGreaterThanOrEqual(0);
    });

    it("should have total votes equal to direct + delegated votes", async () => {
      const stats = await getOverallVotingStats();
      
      expect(stats.totalVotes).toBe(stats.directVotes + stats.delegatedVotes);
    });
  });

  describe("getEngagementMetricsData", () => {
    it("should return engagement metrics with correct structure", async () => {
      const metrics = await getEngagementMetricsData();
      
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty("activeUsers");
      expect(metrics).toHaveProperty("newUsersThisWeek");
      expect(metrics).toHaveProperty("averageVotesPerUser");
      expect(metrics).toHaveProperty("mostActiveMinistry");
      expect(metrics).toHaveProperty("leastActiveMinistry");
    });

    it("should return non-negative numbers", async () => {
      const metrics = await getEngagementMetricsData();
      
      expect(metrics.activeUsers).toBeGreaterThanOrEqual(0);
      expect(metrics.newUsersThisWeek).toBeGreaterThanOrEqual(0);
      expect(metrics.averageVotesPerUser).toBeGreaterThanOrEqual(0);
    });

    it("should return ministry names as strings", async () => {
      const metrics = await getEngagementMetricsData();
      
      expect(typeof metrics.mostActiveMinistry).toBe("string");
      expect(typeof metrics.leastActiveMinistry).toBe("string");
    });
  });

  describe("getAllMinistriesStats", () => {
    it("should return array of ministry stats", async () => {
      const stats = await getAllMinistriesStats();
      
      expect(Array.isArray(stats)).toBe(true);
    });

    it("should have correct structure for each ministry", async () => {
      const stats = await getAllMinistriesStats();
      
      if (stats.length > 0) {
        const ministry = stats[0];
        expect(ministry).toHaveProperty("ministryId");
        expect(ministry).toHaveProperty("ministryName");
        expect(ministry).toHaveProperty("totalDecisions");
        expect(ministry).toHaveProperty("approvedDecisions");
        expect(ministry).toHaveProperty("rejectedDecisions");
        expect(ministry).toHaveProperty("pendingDecisions");
        expect(ministry).toHaveProperty("approvalRate");
        expect(ministry).toHaveProperty("rejectionRate");
      }
    });

    it("should have approval rate between 0 and 100", async () => {
      const stats = await getAllMinistriesStats();
      
      for (const ministry of stats) {
        expect(ministry.approvalRate).toBeGreaterThanOrEqual(0);
        expect(ministry.approvalRate).toBeLessThanOrEqual(100);
      }
    });

    it("should have rejection rate between 0 and 100", async () => {
      const stats = await getAllMinistriesStats();
      
      for (const ministry of stats) {
        expect(ministry.rejectionRate).toBeGreaterThanOrEqual(0);
        expect(ministry.rejectionRate).toBeLessThanOrEqual(100);
      }
    });

    it("should have non-negative decision counts", async () => {
      const stats = await getAllMinistriesStats();
      
      for (const ministry of stats) {
        expect(ministry.totalDecisions).toBeGreaterThanOrEqual(0);
        expect(ministry.approvedDecisions).toBeGreaterThanOrEqual(0);
        expect(ministry.rejectedDecisions).toBeGreaterThanOrEqual(0);
        expect(ministry.pendingDecisions).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("getApprovalTrends", () => {
    it("should return array of approval trends", async () => {
      const trends = await getApprovalTrends(1);
      
      expect(Array.isArray(trends)).toBe(true);
    });

    it("should have correct structure for each trend", async () => {
      const trends = await getApprovalTrends(1);
      
      if (trends.length > 0) {
        const trend = trends[0];
        expect(trend).toHaveProperty("month");
        expect(trend).toHaveProperty("approvalRate");
      }
    });

    it("should have approval rate between 0 and 100", async () => {
      const trends = await getApprovalTrends(1);
      
      for (const trend of trends) {
        expect(trend.approvalRate).toBeGreaterThanOrEqual(0);
        expect(trend.approvalRate).toBeLessThanOrEqual(100);
      }
    });

    it("should have month in correct format (YYYY-MM)", async () => {
      const trends = await getApprovalTrends(1);
      
      for (const trend of trends) {
        expect(trend.month).toMatch(/^\d{4}-\d{2}$/);
      }
    });

    it("should be sorted by month in ascending order", async () => {
      const trends = await getApprovalTrends(1);
      
      for (let i = 1; i < trends.length; i++) {
        expect(trends[i].month).toGreaterThanOrEqual(trends[i - 1].month);
      }
    });
  });
});
