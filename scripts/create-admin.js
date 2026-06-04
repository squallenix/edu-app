require('dotenv/config');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  const email = process.argv[2];
  const password = process.argv[3] || 'password';

  if (!email) {
    console.error('Usage: node scripts/create-admin.js <email> [password]');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set in environment.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const hashed = await bcrypt.hash(password, 10);

    // Check existing
    const { rows } = await pool.query('SELECT id FROM "Admin" WHERE email = $1', [email]);
    if (rows.length > 0) {
      console.log('Admin already exists:', email);
      process.exit(0);
    }

    // Insert with a generated cuid-like id. Use gen_random_uuid() if available, otherwise use crypto.
    const id = require('crypto').randomUUID();

    await pool.query(
      'INSERT INTO "Admin" (id, email, password, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [id, email, hashed, 'Administrator']
    );

    console.log('Created admin:', email);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
