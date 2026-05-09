import { drizzle } from "drizzle-orm/mysql2/promise";
import { createPool } from "mysql2/promise";
import { mk121Cycles, mk121Bills, mk121Questions } from "../drizzle/schema.ts";

const pool = createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

const db = drizzle(pool);

try {
  console.log("✓ Connected to database via Drizzle");

  // Create a cycle that's currently active
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  console.log(`Creating cycle from ${cycleStart} to ${cycleEnd}`);

  const cycleResult = await db.insert(mk121Cycles).values({
    cycleNumber: 1,
    startDate: cycleStart,
    endDate: cycleEnd,
    status: "active",
  });

  console.log(`✓ Created cycle`);

  // Sample bills
  const bills = [
    {
      title: "הגדלת תקציב החינוך ב-10%",
      description: "הצעה להגדיל את תקציב משרד החינוך ב-10% לשנה הבאה כדי לשפר את איכות ההוראה וההשכלה בישראל",
      category: "חינוך",
      cycleId: 1,
      proposedBy: 1,
      votes: Math.floor(Math.random() * 100) + 10,
    },
    {
      title: "מדיניות אנרגיה ירוקה חדשה",
      description: "מעבר לאנרגיה מתחדשת ב-50% עד 2030 כחלק מהתחייבות הסביבה והפחתת פליטות פחמן",
      category: "סביבה",
      cycleId: 1,
      proposedBy: 1,
      votes: Math.floor(Math.random() * 100) + 10,
    },
  ];

  for (const bill of bills) {
    await db.insert(mk121Bills).values(bill);
    console.log(`✓ Created bill: ${bill.title}`);
  }

  // Sample questions
  const questions = [
    {
      title: "מדוע לא מתקדמת הרפורמה בבריאות?",
      description: "שאילתה דחופה על עיכובים בהטמעת הרפורמה במערכת הבריאות הציבורית",
      targetMinistry: "משרד הבריאות",
      urgency: "high",
      cycleId: 1,
      proposedBy: 1,
      votes: Math.floor(Math.random() * 100) + 10,
    },
  ];

  for (const question of questions) {
    await db.insert(mk121Questions).values(question);
    console.log(`✓ Created question: ${question.title}`);
  }

  console.log("\n✓ MK 121 seed data created successfully!");
  process.exit(0);
} catch (error) {
  console.error("✗ Error:", error.message);
  process.exit(1);
}
