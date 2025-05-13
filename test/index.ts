import dotenv from 'dotenv';

import type { Server } from 'node:http';
import { before } from 'mocha';
import { setupServer } from '../src/app';

import './hello-world';
import './user';
import { setupDatabase } from '../src/db';

let server: Server;

before(async () => {
  dotenv.config({ path: `${process.cwd()}/test.env` });
  await setupDatabase();
  server = setupServer(+(process.env.PORT || 3001));
});

after(async () => {
  await server.close();
});
