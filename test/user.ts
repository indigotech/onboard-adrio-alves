import { prisma } from '../src/db';
import { describe, it } from 'mocha';
import axios from 'axios';
import { expect } from 'chai';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('POST /users', () => {
  it('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'Test.User@Mail.com',
      password: 'password123',
      birthdate: '1990-01-01',
    };

    const response = await axios.post(`${BASE_URL}/users`, userData);

    expect(response.status).to.equal(201);
    expect(response.data).to.be.deep.equal({
      id: 1,
      name: 'Test User',
      email: 'Test.User@Mail.com',
      birthdate: '1990-01-01T00:00:00.000Z',
    });

    await prisma.user.deleteMany({
      where: {
        email: 'Test.User@Mail.com',
      },
    });
  });
});
