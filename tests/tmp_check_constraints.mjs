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
    // Check for constraints on OrgGroup
    const res = await client.query(`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = '"OrgGroup"'::regclass;
    `);
    console.log('Constraints for OrgGroup:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
