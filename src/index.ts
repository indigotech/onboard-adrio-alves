import dotenv from 'dotenv';
import { setupServer } from './app';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function main() {
  await setupDatabase();
  await setupServer(+(process.env.PORT || 3000));
}

main();
