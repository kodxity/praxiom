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
    // List all unique indexes in the public schema
    const res = await client.query(`
        SELECT
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM
            pg_indexes
        WHERE
            schemaname = 'public'
            AND indexdef LIKE '%UNIQUE%';
    `);
    console.log('ALL UNIQUE INDEXES:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
