import mysql from "mysql2/promise";

const sampleDecisions = [
  {
    ministryId: 1,
    title: "הגדלת תקציב החינוך ב-5%",
    description: "הצעה להגדיל את תקציב משרד החינוך ב-5% לשנה הבאה כדי לשפר מתקנים בבתי ספר בעיר ובכפר",
    category: "major",
  },
  {
    ministryId: 2,
    title: "פיתוח תוכנית רווחה חברתית חדשה",
    description: "הצעה לפתח תוכנית רווחה חדשה לתמיכה בקשישים בעוני בקהילות מרוחקות",
    category: "major",
  },
  {
    ministryId: 3,
    title: "שדרוג ציוד צה״ל",
    description: "הצעה לשדרג ציוד ביטחוני קיים בעלות של 2 מיליארד שקל",
    category: "major",
  },
  {
    ministryId: 4,
    title: "חוק חדש להגנה על צרכנים",
    description: "הצעה לחוק חדש המגן על צרכנים מפני תרמול ממיסחור דיגיטלי",
    category: "medium",
  },
  {
    ministryId: 5,
    title: "מעבר לאנרגיה ירוקה - 2030",
    description: "הצעה להגדיל את שימוש באנרגיה מתחדשת ל-50% עד 2030",
    category: "major",
  },
  {
    ministryId: 6,
    title: "הסכם דיפלומטי חדש",
    description: "הצעה לחתום על הסכם דיפלומטי עם שותף בינלאומי",
    category: "medium",
  },
  {
    ministryId: 7,
    title: "רפורמה בתוכנית הלימודים",
    description: "הצעה לעדכן את תוכנית הלימודים בחטיבות ביניים כדי להוסיף מיומנויות דיגיטליות",
    category: "medium",
  },
  {
    ministryId: 8,
    title: "בניית בית חולים חדש בנגב",
    description: "הצעה לבנות בית חולים חדש בבאר שבע לשירות תושבי הנגב",
    category: "major",
  },
  {
    ministryId: 9,
    title: "תמיכה בתרבות יהודית",
    description: "הצעה להגדיל את התמיכה בתוכניות תרבות ואמנות יהודית בחו״ל",
    category: "medium",
  },
];

async function seedDecisions() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("🌱 Seeding sample decisions...");

    // Get admin user (usually id 1)
    const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
    const adminId = users[0]?.id || 1;

    // Insert decisions
    for (const decision of sampleDecisions) {
      const votingStartsAt = new Date();
      const votingEndsAt = new Date(votingStartsAt.getTime() + 72 * 60 * 60 * 1000); // 72 hours

      await connection.execute(
        "INSERT INTO decisions (ministryId, title, description, category, status, proposedBy, votingStartsAt, votingEndsAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          decision.ministryId,
          decision.title,
          decision.description,
          decision.category,
          "voting",
          adminId,
          votingStartsAt,
          votingEndsAt,
        ]
      );
      console.log(`✓ Added decision: ${decision.title}`);
    }

    console.log("✅ Sample decisions seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding decisions:", error);
  } finally {
    await connection.end();
  }
}

seedDecisions();
