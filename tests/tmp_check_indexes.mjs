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
    const res = await client.query(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'OrgGroup';
    `);
    console.log('Indexes for OrgGroup:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
