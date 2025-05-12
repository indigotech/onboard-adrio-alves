import { setupServer } from '../src/app';
import { prisma } from '../src/db';
import dotenv from 'dotenv';
import { before } from 'mocha';
import type { Server } from 'node:http';

import './hello-world';
import './user';

dotenv.config({ path: '.env.test' });

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
