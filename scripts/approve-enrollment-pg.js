require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const res = await pool.query(
      "UPDATE \"EnrolledExam\" en SET status = 'approved' FROM \"Student\" s WHERE en.\"studentId\" = s.id AND s.email = $1 RETURNING en.id, en.status",
      ['student-test@edu.local']
    );

    if (res.rowCount === 0) {
      console.log('No enrollment updated');
    } else {
      for (const row of res.rows) {
        console.log('Updated enrollment:', row);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
