import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "user" | "admin" | "minister" = "user", ministryId?: number): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    ministryId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("governance router", () => {
  describe("ministries", () => {
    it("should list all ministries", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const ministries = await caller.governance.ministries.list();

      expect(Array.isArray(ministries)).toBe(true);
      expect(ministries.length).toBeGreaterThan(0);
      expect(ministries[0]).toHaveProperty("name");
      expect(ministries[0]).toHaveProperty("description");
    });

    it("should get ministry by id", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const ministries = await caller.governance.ministries.list();
      if (ministries.length === 0) return;

      const ministry = await caller.governance.ministries.getById({ id: ministries[0].id });

      expect(ministry).toBeDefined();
      expect(ministry.id).toBe(ministries[0].id);
      expect(ministry.name).toBe(ministries[0].name);
    });
  });

  describe("decisions", () => {
    it("should list all decisions", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const decisions = await caller.governance.decisions.list();

      expect(Array.isArray(decisions)).toBe(true);
    });

    it("should get active decisions", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const activeDecisions = await caller.governance.decisions.active();

      expect(Array.isArray(activeDecisions)).toBe(true);
    });

    it("should create decision as minister", async () => {
      const { ctx } = createTestContext("minister", 1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governance.decisions.create({
        ministryId: 1,
        title: "Test Decision",
        description: "This is a test decision",
        category: "medium",
      });

      expect(result).toBeDefined();
    });

    it("should reject decision creation for non-minister", async () => {
      const { ctx } = createTestContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.governance.decisions.create({
          ministryId: 1,
          title: "Test Decision",
          description: "This is a test decision",
          category: "medium",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should get decisions by ministry", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const decisions = await caller.governance.decisions.byMinistry({ ministryId: 1 });

      expect(Array.isArray(decisions)).toBe(true);
      decisions.forEach((d) => {
        expect(d.ministryId).toBe(1);
      });
    });
  });

  describe("votes", () => {
    it("should get votes for a decision", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const decisions = await caller.governance.decisions.list();
      if (decisions.length === 0) return;

      const votes = await caller.governance.votes.getByDecision({ decisionId: decisions[0].id });

      expect(votes).toHaveProperty("for");
      expect(votes).toHaveProperty("against");
      expect(typeof votes.for).toBe("number");
      expect(typeof votes.against).toBe("number");
    });
  });

  describe("history", () => {
    it("should get decision history", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const decisions = await caller.governance.decisions.list();
      if (decisions.length === 0) return;

      const history = await caller.governance.history.getByDecision({ decisionId: decisions[0].id });

      expect(Array.isArray(history)).toBe(true);
    });
  });
});
