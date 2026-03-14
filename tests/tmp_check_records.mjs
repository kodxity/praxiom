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
    const res = await client.query('SELECT id, name, "teacherId" FROM "OrgGroup" LIMIT 10;');
    console.log('Group count:', res.rowCount);
    console.log('Groups:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
