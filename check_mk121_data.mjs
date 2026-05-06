import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('//')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'voting_db',
  ssl: 'Amazon RDS' in (process.env.DATABASE_URL || '') ? { rejectUnauthorized: false } : undefined,
});

try {
  const [cycles] = await connection.execute('SELECT * FROM mk121_voting_cycles');
  console.log('Voting Cycles:', cycles);
  
  const [bills] = await connection.execute('SELECT * FROM mk121_bills LIMIT 5');
  console.log('Bills:', bills);
  
  const [questions] = await connection.execute('SELECT * FROM mk121_questions LIMIT 5');
  console.log('Questions:', questions);
} catch (error) {
  console.error('Database error:', error.message);
} finally {
  await connection.end();
}
