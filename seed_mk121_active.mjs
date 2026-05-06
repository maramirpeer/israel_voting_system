import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // Check if cycle exists
  const [existing] = await connection.execute('SELECT * FROM mk121Cycles WHERE status = "active" LIMIT 1');
  
  if (existing.length > 0) {
    console.log('Active cycle already exists');
    process.exit(0);
  }
  
  // Get max cycle number
  const [[{ maxNum }]] = await connection.execute('SELECT MAX(cycleNumber) as maxNum FROM mk121Cycles');
  const cycleNumber = (maxNum || 0) + 1;
  
  // Create active cycle
  const now = new Date();
  const endDate = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now
  
  const [cycleResult] = await connection.execute(
    'INSERT INTO mk121Cycles (cycleNumber, startDate, endDate, status) VALUES (?, ?, ?, ?)',
    [cycleNumber, now, endDate, 'active']
  );
  
  const cycleId = cycleResult.insertId;
  console.log('Created cycle:', cycleId);
  
  // Add bills
  const bills = [
    ['הגדלת תקציב החינוך ב-5%', 'הצעה להגדלת תקציב החינוך בשנה הקרובה', 'חינוך'],
    ['מעבר לאנרגיה ירוקה', 'הצעה להחלפת מקורות אנרגיה לאנרגיה ירוקה', 'סביבה'],
    ['שיפור תחבורה ציבורית', 'הצעה לשיפור שירותי התחבורה הציבורית', 'תחבורה'],
    ['הקטנת עוני', 'הצעה לתכנית להקטנת שיעורי העוני', 'רווחה'],
  ];
  
  for (const [title, description, category] of bills) {
    await connection.execute(
      'INSERT INTO mk121Bills (cycleId, title, description, category, proposedBy, status) VALUES (?, ?, ?, ?, ?, ?)',
      [cycleId, title, description, category, 1, 'active']
    );
  }
  console.log('Added bills');
  
  // Add questions
  const questions = [
    ['מדיניות הביטחון', 'שאילתה על מדיניות הביטחון של המדינה', 'משרד הביטחון', 'דחוף'],
    ['זכויות אדם', 'שאילתה על הגנת זכויות אדם', 'משרד המשפטים', 'בינוני'],
    ['בריאות הציבור', 'שאילתה על מדיניות בריאות הציבור', 'משרד הבריאות', 'דחוף'],
  ];
  
  for (const [title, description, ministry, urgency] of questions) {
    await connection.execute(
      'INSERT INTO mk121Questions (cycleId, title, description, targetMinistry, urgencyLevel, proposedBy, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [cycleId, title, description, ministry, urgency, 1, 'active']
    );
  }
  console.log('Added questions');
  
  console.log('✅ MK 121 data seeded successfully!');
  
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
