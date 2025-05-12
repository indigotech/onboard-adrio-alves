import { describe, it } from 'mocha';
import { setupServer } from '../src/app';
import { prisma } from '../src/db';
import dotenv from 'dotenv';
import { before } from 'mocha';
import type { Server } from 'node:http';
import axios from 'axios';
import { expect } from 'chai';

dotenv.config({ path: '.env.test' });

let server: Server;

before(async () => {
  server = setupServer();
});

after(async () => {
  await prisma.$disconnect();
  if (server) {
    await server.close();
  }
});

describe('POST /users', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      birthdate: '1990-01-01',
    };

    const response = await axios.post('http://localhost:3000/users', userData);

    expect(response.status).to.equal(201);
    expect(response.data).to.include({
      name: userData.name,
      email: userData.email,
    });
    expect(response.data).to.not.have.property('password');
  });
});
