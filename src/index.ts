import dotenv from 'dotenv';
import { setupServer } from './app';

dotenv.config({ path: `${process.env.NODE_ENV || 'development'}.env` });

async function main() {
  setupDatabase();
  setupServer(+(process.env.PORT || 3000));
}

main();
