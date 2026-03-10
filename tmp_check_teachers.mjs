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
    const res = await client.query("SELECT id, username FROM \"User\" WHERE id IN ('cmmi63a7u0001qtcqd4eayo6c', 'cmmk9rtdd000004jm6cvmp5el');");
    console.log('Teachers found:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
