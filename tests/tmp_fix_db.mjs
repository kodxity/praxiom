import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
  console.log('Using URL:', process.env.DATABASE_URL ? 'FOUND' : 'MISSING');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database.');
    
    const result = await client.query('DROP INDEX IF EXISTS "OrgGroup_teacherId_key";');
    console.log('Successfully dropped unique index on OrgGroup(teacherId). Result:', result.command);
    
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await client.end();
  }
}

run();
