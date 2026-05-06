import { createConnection } from "mysql2/promise";

const connection = await createConnection({
  host: process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "test",
});

const now = new Date();
const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0);

// Create a cycle
const [cycleResult] = await connection.query(
  "INSERT INTO mk121Cycles (cycleNumber, startDate, endDate, status) VALUES (?, ?, ?, ?)",
  [1, cycleStart, cycleEnd, "active"]
);

const cycleId = cycleResult.insertId;

// Sample bills
const bills = [
  {
    title: "הגדלת תקציב החינוך ב-10%",
    description: "הצעה להגדיל את תקציב משרד החינוך ב-10% לשנה הבאה כדי לשפר את איכות ההוראה",
    category: "חינוך",
  },
  {
    title: "מדיניות אנרגיה ירוקה חדשה",
    description: "מעבר לאנרגיה מתחדשת ב-50% עד 2030 כחלק מהתחייבות הסביבה",
    category: "סביבה",
  },
  {
    title: "שיפור תחבורה ציבורית בערים קטנות",
    description: "השקעה בתחבורה ציבורית בערים קטנות כדי להפחית את הפער בין ערים",
    category: "תחבורה",
  },
  {
    title: "תוכנית למלחמה בעוני",
    description: "תוכנית חדשה להקטנת שיעורי העוני בישראל ב-30% בחמש שנים",
    category: "רווחה",
  },
];

// Sample questions
const questions = [
  {
    title: "מדוע לא מתקדמת הרפורמה בבריאות?",
    description: "שאילתה דחופה על עיכובים בהטמעת הרפורמה במערכת הבריאות",
    targetMinistry: "משרד הבריאות",
    urgency: "high",
  },
  {
    title: "מה עם הבטחת זכויות עובדים זרים?",
    description: "שאילתה על הצעדים שנלקחו להגנה על זכויות עובדים זרים",
    targetMinistry: "משרד הפנים",
    urgency: "medium",
  },
  {
    title: "תוכנית לשיקום שכונות מנוכות",
    description: "שאילתה על תוכנית ממשלתית לשיקום שכונות מנוכות",
    targetMinistry: "משרד הפנים",
    urgency: "high",
  },
];

for (const bill of bills) {
  await connection.query(
    "INSERT INTO mk121Bills (cycleId, title, description, proposedBy, category, votes) VALUES (?, ?, ?, ?, ?, ?)",
    [cycleId, bill.title, bill.description, 1, bill.category, Math.floor(Math.random() * 100)]
  );
}

for (const question of questions) {
  await connection.query(
    "INSERT INTO mk121Questions (cycleId, title, description, proposedBy, targetMinistry, urgency, votes) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [cycleId, question.title, question.description, 1, question.targetMinistry, question.urgency, Math.floor(Math.random() * 100)]
  );
}

console.log("✓ MK 121 seed data created successfully!");
await connection.end();
