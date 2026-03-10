import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    // Try to insert a second group for teacher 'cmmk9rtdd000004jm6cvmp5el'
    console.log('Attempting manual insert of a second group for existing teacher...');
    const res = await client.query(`
        INSERT INTO "OrgGroup" (id, name, "teacherId", "createdAt")
        VALUES ('manual-test-id-1', 'Manual Test Group', 'cmmk9rtdd000004jm6cvmp5el', NOW());
    `);
    console.log('Success!', res.command);
    
    // Clean up
    await client.query("DELETE FROM \"OrgGroup\" WHERE id = 'manual-test-id-1';");
    console.log('Cleaned up manual test.');

  } catch (err) {
    console.error('SQL Insert Error:', err.message);
    if (err.detail) console.log('Detail:', err.detail);
    if (err.constraint) console.log('Constraint:', err.constraint);
  } finally {
    await client.end();
  }
}

run();
