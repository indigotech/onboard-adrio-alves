import type { Server } from 'node:http';
import dotenv from 'dotenv';
import { after, before } from 'mocha';
import { setupServer } from '../src/app';
import { prisma, setupDatabase } from '../src/db';

let server: Server;

before(async () => {
  dotenv.config({ path: `${process.cwd()}/test.env` });
  await setupDatabase();
  server = await setupServer();
});

import './hello-world';
import './user-get';
import './users-list';
import './users-post';
import './auth';

afterEach(async () => {
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
});

after(async () => {
  await server.close();
});
