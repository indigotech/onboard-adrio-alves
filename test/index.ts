import { setupServer } from '../src/app';
import { prisma } from '../src/db';
import dotenv from 'dotenv';
import { before } from 'mocha';
import type { Server } from 'node:http';

dotenv.config({ path: '.env.test' });

import './hello-world';
import './user';

let server: Server;

before(() => {
  server = setupServer();
});

after(async () => {
  await prisma.$disconnect();
  if (server) {
    await server.close();
  }
});
