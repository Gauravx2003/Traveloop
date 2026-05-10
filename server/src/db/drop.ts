import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query('DROP TABLE IF EXISTS "users" CASCADE;');
    console.log('Users table dropped successfully');
  } catch (error) {
    console.error('Error dropping table:', error);
  } finally {
    await pool.end();
  }
}

run();
