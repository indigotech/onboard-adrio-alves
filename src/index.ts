import dotenv from 'dotenv';
import { setupServer } from './app';
import { setupDatabase } from './db';

dotenv.config({ path: `${process.env.NODE_ENV || 'development'}.env` });

async function main() {
  await setupDatabase();
  await setupServer();
}

main();
