import { createConnection } from "mysql2/promise";

try {
  const dbUrl = process.env.DATABASE_URL;
  console.log("Database URL:", dbUrl?.substring(0, 50) + "...");

  const connection = await createConnection({
    uri: dbUrl,
    ssl: "amazon",
  });

  console.log("✓ Connected to database");

  // Create a cycle that's currently active
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  console.log(`Creating cycle from ${cycleStart} to ${cycleEnd}`);

  const [cycleResult] = await connection.query(
    "INSERT INTO mk121Cycles (cycleNumber, startDate, endDate, status) VALUES (?, ?, ?, ?)",
    [1, cycleStart, cycleEnd, "active"]
  );

  const cycleId = cycleResult.insertId;
  console.log(`✓ Created cycle with ID ${cycleId}`);

  // Sample bills
  const bills = [
    {
      title: "הגדלת תקציב החינוך ב-10%",
      description: "הצעה להגדיל את תקציב משרד החינוך ב-10% לשנה הבאה כדי לשפר את איכות ההוראה וההשכלה בישראל",
      category: "חינוך",
    },
    {
      title: "מדיניות אנרגיה ירוקה חדשה",
      description: "מעבר לאנרגיה מתחדשת ב-50% עד 2030 כחלק מהתחייבות הסביבה והפחתת פליטות פחמן",
      category: "סביבה",
    },
    {
      title: "שיפור תחבורה ציבורית בערים קטנות",
      description: "השקעה בתחבורה ציבורית בערים קטנות כדי להפחית את הפער בין ערים גדולות וקטנות",
      category: "תחבורה",
    },
    {
      title: "תוכנית למלחמה בעוני",
      description: "תוכנית חדשה להקטנת שיעורי העוני בישראל ב-30% בחמש שנים דרך תמיכה חברתית",
      category: "רווחה",
    },
  ];

  for (const bill of bills) {
    const [result] = await connection.query(
      "INSERT INTO mk121Bills (cycleId, title, description, proposedBy, category, votes) VALUES (?, ?, ?, ?, ?, ?)",
      [cycleId, bill.title, bill.description, 1, bill.category, Math.floor(Math.random() * 100) + 10]
    );
    console.log(`✓ Created bill: ${bill.title}`);
  }

  // Sample questions
  const questions = [
    {
      title: "מדוע לא מתקדמת הרפורמה בבריאות?",
      description: "שאילתה דחופה על עיכובים בהטמעת הרפורמה במערכת הבריאות הציבורית",
      targetMinistry: "משרד הבריאות",
      urgency: "high",
    },
    {
      title: "מה עם הבטחת זכויות עובדים זרים?",
      description: "שאילתה על הצעדים שנלקחו להגנה על זכויות עובדים זרים בישראל",
      targetMinistry: "משרד הפנים",
      urgency: "medium",
    },
    {
      title: "תוכנית לשיקום שכונות מנוכות",
      description: "שאילתה על תוכנית ממשלתית לשיקום שכונות מנוכות בערים גדולות",
      targetMinistry: "משרד הפנים",
      urgency: "high",
    },
  ];

  for (const question of questions) {
    const [result] = await connection.query(
      "INSERT INTO mk121Questions (cycleId, title, description, proposedBy, targetMinistry, urgency, votes) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [cycleId, question.title, question.description, 1, question.targetMinistry, question.urgency, Math.floor(Math.random() * 100) + 10]
    );
    console.log(`✓ Created question: ${question.title}`);
  }

  console.log("\n✓ MK 121 seed data created successfully!");
  await connection.end();
} catch (error) {
  console.error("✗ Error:", error.message);
  process.exit(1);
}
