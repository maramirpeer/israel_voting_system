import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3]?.split('?')[0] || 'voting_system',
  ssl: { rejectUnauthorized: false },
});

const decisions = [
  { ministryId: 1, title: "הגדלת תקציב החינוך ב-15%", description: "הצעה להגדלת תקציב משרד החינוך ב-15% לשנת 2026", category: "major", votesFor: 4250, votesAgainst: 1850, status: "approved" },
  { ministryId: 2, title: "הקמת 50 מרכזי קהילה בערים שוליות", description: "הקמת מרכזי קהילה חדשים בערים שוליות", category: "major", votesFor: 3890, votesAgainst: 2100, status: "approved" },
  { ministryId: 3, title: "שיפור מערכת ההגנה האווירית", description: "השקעה בשיפור מערכות ההגנה", category: "major", votesFor: 5200, votesAgainst: 800, status: "approved" },
  { ministryId: 4, title: "חוק שוויון זכויות לאנשים עם מוגבלויות", description: "הצעת חוק חדשה לשוויון זכויות", category: "major", votesFor: 4100, votesAgainst: 1200, status: "approved" },
  { ministryId: 5, title: "מעבר ל-80% אנרגיה ירוקה עד 2030", description: "תכנית להגדלת שימוש באנרגיה ירוקה", category: "major", votesFor: 3950, votesAgainst: 2300, status: "approved" },
  { ministryId: 6, title: "הסכם סחר חדש עם 5 מדינות", description: "חתימה על הסכמי סחר חדשים", category: "medium", votesFor: 3200, votesAgainst: 1500, status: "approved" },
  { ministryId: 7, title: "תכנית לשיפור מתמטיקה בחטיבות ביניים", description: "תכנית חדשה לשיפור הוראת מתמטיקה", category: "medium", votesFor: 2800, votesAgainst: 900, status: "approved" },
  { ministryId: 8, title: "הרחבת כיסוי ביטוח בריאות", description: "הרחבת כיסוי ביטוח בריאות לטיפולים נוספים", category: "major", votesFor: 4500, votesAgainst: 1100, status: "approved" },
  { ministryId: 9, title: "תמיכה בתיאטרון וקולנוע ישראלי", description: "הגדלת תקציב התמיכה בתיאטרון וקולנוע", category: "medium", votesFor: 2600, votesAgainst: 1800, status: "approved" }
];

try {
  for (const decision of decisions) {
    await connection.execute(
      `INSERT INTO decisions (ministryId, title, description, category, votesFor, votesAgainst, status, createdAt, votingEndsAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 72 HOUR))`,
      [decision.ministryId, decision.title, decision.description, decision.category, 
       decision.votesFor, decision.votesAgainst, decision.status]
    );
  }
  console.log('✅ Realistic decisions seeded successfully');
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}
