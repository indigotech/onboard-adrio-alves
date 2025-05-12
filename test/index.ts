import dotenv from 'dotenv';
console.log(process.env.PORT);
console.log(process.env.DATABASE_URL);

import { setupServer } from '../src/app';
import { before } from 'mocha';
import type { Server } from 'node:http';

import './hello-world';
import './user';
import { setupDatabase } from '../src/db';

let server: Server;

before(async () => {
  console.log(`${process.cwd()}/test.env`);
  dotenv.config({ path: `${process.cwd()}/test.env` });
  await setupDatabase();
  server = setupServer(+(process.env.PORT || 3001));
});

after(async () => {
  await server.close();
});
