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
    console.log('Connected.');
    
    // Explicitly try to drop the constraint as well
    const res1 = await client.query('ALTER TABLE "OrgGroup" DROP CONSTRAINT IF EXISTS "OrgGroup_teacherId_key";');
    console.log('Drop constraint result:', res1.command);
    
    const res2 = await client.query('DROP INDEX IF EXISTS "OrgGroup_teacherId_key";');
    console.log('Drop index result:', res2.command);

    // List all unique constraint names for this table
    const res3 = await client.query(`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = '"OrgGroup"'::regclass;
    `);
    console.log('Current constraints for OrgGroup:', res3.rows);

  } catch (err) {
    console.error('SQL Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
