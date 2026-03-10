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
    // Use proper escaping for "User" table
    const res = await client.query(`
        SELECT conname, contype 
        FROM pg_constraint 
        WHERE conrelid = '"User"'::regclass;
    `);
    console.log('Constraints for User:', res.rows);
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
