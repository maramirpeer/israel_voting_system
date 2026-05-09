import { getDb } from "./db.ts";
import { mk121Bills } from "../drizzle/schema.ts";

async function seedPendingBills() {
  const db = await getDb();
  
  // Add 2 pending bills with draft status (no votes yet)
  const pendingBills = [
    {
      title: "הגדלת תקציב החינוך ב-15% לשנת 2026",
      description: "הצעה להגדיל את תקציב משרד החינוך ב-15% כדי לשפר את איכות החינוך בישראל",
      submittedBy: "ח\"כ דוד כהן",
      status: "pending",
      votes: 0,
      cycleId: 1
    },
    {
      title: "הקמת מינהל חדש לטיפול בשינויי אקלים",
      description: "הצעה להקים מינהל ממשלתי חדש שיטפל בנושאי שינויי אקלים והתחדשות אנרגיה",
      submittedBy: "ח\"כ ליאור כהן",
      status: "pending",
      votes: 0,
      cycleId: 1
    }
  ];

  for (const bill of pendingBills) {
    try {
      await db.insert(mk121Bills).values(bill);
      console.log(`✅ Added pending bill: ${bill.title}`);
    } catch (error) {
      console.log(`⚠️  Bill already exists or error: ${bill.title}`);
    }
  }

  console.log("✅ Pending bills seeded successfully!");
}

seedPendingBills().catch(console.error);
