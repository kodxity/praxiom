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
    // Hunt for ANY unique index that might involve teacherId
    const res = await client.query(`
        SELECT tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE indexdef LIKE '%teacherId%' AND indexdef LIKE '%UNIQUE%';
    `);
    console.log('HUNT RESULT:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
