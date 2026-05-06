import { createConnection } from "mysql2/promise";

try {
  const connection = await createConnection({
    host: process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "localhost",
    user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
    password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
    database: process.env.DATABASE_URL?.split("/").pop() || "test",
  });

  console.log("✓ Connected to database");

  // Check cycles
  const [cycles] = await connection.query("SELECT * FROM mk121Cycles");
  console.log(`✓ Found ${cycles.length} cycles`);
  if (cycles.length > 0) {
    console.log("  Cycle:", cycles[0]);
  }

  // Check bills
  const [bills] = await connection.query("SELECT * FROM mk121Bills");
  console.log(`✓ Found ${bills.length} bills`);
  if (bills.length > 0) {
    console.log("  First bill:", bills[0]);
  }

  // Check questions
  const [questions] = await connection.query("SELECT * FROM mk121Questions");
  console.log(`✓ Found ${questions.length} questions`);
  if (questions.length > 0) {
    console.log("  First question:", questions[0]);
  }

  await connection.end();
} catch (error) {
  console.error("✗ Error:", error.message);
}
