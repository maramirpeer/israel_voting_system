import mysql from "mysql2/promise";

const ministries = [
  {
    name: "משרד האוצר",
    description: "ניהול תקציב המדינה, מדיניות כלכלית, מיסוי, השקעות",
    icon: "💰",
    color: "#1e40af",
  },
  {
    name: "משרד הפנים, החברה והרווחה",
    description: "רשויות מקומיות, פיתוח כפרי, רווחה חברתית, שירותים לאזרח",
    icon: "👥",
    color: "#0891b2",
  },
  {
    name: "משרד הביטחון",
    description: "ביטחון המדינה, פיקוח על צה״ל, מדיניות אסטרטגית",
    icon: "🛡️",
    color: "#7c3aed",
  },
  {
    name: "משרד המשפטים",
    description: "ייעוץ משפטי, מערכת המשפט, חקיקה, אכיפה",
    icon: "⚖️",
    color: "#dc2626",
  },
  {
    name: "משרד החדשנות ואיכות הסביבה",
    description: "קידום טכנולוגיה, אנרגיה ירוקה, מדיניות סביבתית, חדשנות",
    icon: "🌱",
    color: "#16a34a",
  },
  {
    name: "משרד החוץ וההסברה העולמית",
    description: "יחסים בינלאומיים, דיפלומטיה, תדמית המדינה, הסברה",
    icon: "🌍",
    color: "#0369a1",
  },
  {
    name: "משרד החינוך",
    description: "מערכת החינוך, פיתוח תוכניות לימוד, רווחת תלמידים",
    icon: "📚",
    color: "#ea580c",
  },
  {
    name: "משרד הבריאות",
    description: "מערכת הבריאות, קידום בריאות, רפואה ציבורית",
    icon: "⚕️",
    color: "#be185d",
  },
  {
    name: "משרד התרבות",
    description: "תרבות, אמנות, ספורט, זהות תרבותית",
    icon: "🎭",
    color: "#6366f1",
  },
];

async function seedGovernance() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("🌱 Seeding governance data...");

    // Insert ministries
    for (const ministry of ministries) {
      await connection.execute(
        "INSERT INTO ministries (name, description, icon, color) VALUES (?, ?, ?, ?)",
        [ministry.name, ministry.description, ministry.icon, ministry.color]
      );
      console.log(`✓ Added ministry: ${ministry.name}`);
    }

    console.log("✅ Governance data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await connection.end();
  }
}

seedGovernance();
