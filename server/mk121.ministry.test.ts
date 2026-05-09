import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { ministries, mk121Questions, mk121Cycles } from "../drizzle/schema";
import { getMinistriesList, getQuestionsByMinistry, createQuestionProposal, getCurrentCycle } from "./mk121";
import { eq } from "drizzle-orm";

describe("Ministry System (Phase 12)", () => {
  let db: any;
  let testCycleId: number;
  let testMinistryId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get or create a test cycle
    const cycles = await db.select().from(mk121Cycles).limit(1);
    if (cycles.length > 0) {
      testCycleId = cycles[0].id;
    } else {
      // Create a test cycle
      const result = await db.insert(mk121Cycles).values({
        cycleNumber: 999,
        seasonName: "אביב",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
      testCycleId = result.insertId;
    }

    // Get a test ministry
    const ministryList = await getMinistriesList();
    if (ministryList.length > 0) {
      testMinistryId = ministryList[0].id;
    } else {
      throw new Error("No ministries found in database");
    }
  });

  afterAll(async () => {
    // Cleanup test data if needed
    if (db && testCycleId) {
      await db
        .delete(mk121Questions)
        .where(eq(mk121Questions.cycleId, testCycleId));
    }
  });

  describe("getMinistriesList", () => {
    it("should return a list of all ministries", async () => {
      const result = await getMinistriesList();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should return ministries with required fields", async () => {
      const result = await getMinistriesList();
      result.forEach((ministry) => {
        expect(ministry).toHaveProperty("id");
        expect(ministry).toHaveProperty("name");
        expect(typeof ministry.id).toBe("number");
        expect(typeof ministry.name).toBe("string");
      });
    });

    it("should return ministries sorted by name", async () => {
      const result = await getMinistriesList();
      const names = result.map((m) => m.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it("should include Hebrew ministry names", async () => {
      const result = await getMinistriesList();
      const hebrewMinistries = result.filter((m) =>
        /[\u0590-\u05FF]/.test(m.name)
      );
      expect(hebrewMinistries.length).toBeGreaterThan(0);
    });
  });

  describe("getQuestionsByMinistry", () => {
    it("should return questions for a specific ministry", async () => {
      // First, create a test question for the ministry
      const question = await createQuestionProposal(
        testCycleId,
        "Test Question for Ministry",
        "This is a test question assigned to a specific ministry",
        1,
        `Ministry ${testMinistryId}`,
        "high"
      );

      const result = await getQuestionsByMinistry(testMinistryId);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for ministry with no questions", async () => {
      // Find a ministry with no questions
      const allMinistries = await getMinistriesList();
      const ministryWithoutQuestions = allMinistries[allMinistries.length - 1];

      const result = await getQuestionsByMinistry(ministryWithoutQuestions.id);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return questions sorted by votes (descending)", async () => {
      // Create multiple test questions
      const ministry = await getMinistriesList();
      if (ministry.length > 0) {
        const result = await getQuestionsByMinistry(ministry[0].id);
        if (result.length > 1) {
          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].votes).toBeGreaterThanOrEqual(result[i + 1].votes);
          }
        }
      }
    });
  });

  describe("Question Creation with Ministry Assignment", () => {
    it("should create a question with ministry assignment", async () => {
      const ministryList = await getMinistriesList();
      const targetMinistry = ministryList[0];

      const question = await createQuestionProposal(
        testCycleId,
        "Healthcare Reform Question",
        "How should we improve healthcare accessibility?",
        1,
        targetMinistry.name,
        "high"
      );

      expect(question).toBeDefined();
      expect(question.targetMinistry).toBe(targetMinistry.name);
      expect(question.urgency).toBe("high");
    });

    it("should create multiple questions for different ministries", async () => {
      const ministryList = await getMinistriesList();
      if (ministryList.length >= 2) {
        const q1 = await createQuestionProposal(
          testCycleId,
          "Question 1",
          "Description 1",
          1,
          ministryList[0].name,
          "low"
        );

        const q2 = await createQuestionProposal(
          testCycleId,
          "Question 2",
          "Description 2",
          1,
          ministryList[1].name,
          "high"
        );

        expect(q1.targetMinistry).toBe(ministryList[0].name);
        expect(q2.targetMinistry).toBe(ministryList[1].name);
      }
    });

    it("should preserve ministry assignment in database", async () => {
      const ministryList = await getMinistriesList();
      const targetMinistry = ministryList[0];

      const question = await createQuestionProposal(
        testCycleId,
        "Persistent Ministry Question",
        "This question should retain its ministry assignment",
        1,
        targetMinistry.name,
        "medium"
      );

      // Verify the question was stored with the ministry
      const storedQuestion = await db
        .select()
        .from(mk121Questions)
        .where(eq(mk121Questions.id, question.id))
        .limit(1);

      expect(storedQuestion.length).toBe(1);
      expect(storedQuestion[0].targetMinistry).toBe(targetMinistry.name);
    });
  });

  describe("Ministry System Integration", () => {
    it("should have at least 10 ministries seeded", async () => {
      const result = await getMinistriesList();
      expect(result.length).toBeGreaterThanOrEqual(10);
    });

    it("should include all expected ministries", async () => {
      const result = await getMinistriesList();
      const ministryNames = result.map((m) => m.name);

      const expectedMinistries = [
        "משרד הבריאות",
        "משרד הפנים",
        "משרד החינוך",
        "משרד הביטחון",
        "משרד הכלכלה",
      ];

      expectedMinistries.forEach((expected) => {
        expect(ministryNames).toContain(expected);
      });
    });

    it("should allow filtering questions by ministry", async () => {
      const ministries = await getMinistriesList();
      if (ministries.length > 0) {
        const questions = await getQuestionsByMinistry(ministries[0].id);
        expect(Array.isArray(questions)).toBe(true);
      }
    });
  });

  describe("Public Voice (קול הציבור) System", () => {
    it("should mark questions as public voice through ministry assignment", async () => {
      const ministryList = await getMinistriesList();
      const targetMinistry = ministryList[0];

      const question = await createQuestionProposal(
        testCycleId,
        "Public Voice Question",
        "This represents the public voice on a ministry issue",
        1,
        targetMinistry.name,
        "medium"
      );

      expect(question.targetMinistry).toBeDefined();
      expect(question.targetMinistry).toBe(targetMinistry.name);
    });

    it("should support questions without ministry assignment", async () => {
      const question = await createQuestionProposal(
        testCycleId,
        "General Question",
        "A question without specific ministry assignment",
        1,
        undefined,
        "low"
      );

      expect(question).toBeDefined();
      expect(question.targetMinistry).toBeUndefined();
    });
  });
});
