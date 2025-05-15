import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { after, before, describe, it } from 'mocha';
import { prisma } from '../src/db';
import { generateToken } from '../src/utils/jwt';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('POST /auth', () => {
  const userData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpassword',
    birthdate: '1990-01-01',
  };

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        birthdate: new Date(userData.birthdate),
      },
    });
  });

  it('should authenticate with valid credentials', async () => {
    const { status, data } = await axios.post(`${BASE_URL}/auth`, {
      email: userData.email,
      password: userData.password,
    });

    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!user) throw new Error('User not found in test setup');

    const { password, ...userWithoutPassword } = user;

    expect(status).to.equal(200);
    expect(data.user).to.deep.eq({ ...userWithoutPassword, birthdate: userWithoutPassword.birthdate?.toISOString() });

    const decoded = jwt.verify(data.token, process.env.JWT_SECRET || 'dev_secret');
    expect(decoded).to.have.property('id', user.id);
  });

  it('should fail with non-existent user', async () => {
    try {
      await axios.post(`${BASE_URL}/auth`, {
        email: 'nouser@example.com',
        password: 'irrelevant',
      });
    } catch (error) {
      expect(error.response.status).to.equal(401);
      expect(error.response.data).to.include({ error: 'AuthError' });
      expect(error.response.data.code).to.equal('AUTH_01');
    }
  });

  it('should fail with invalid password', async () => {
    try {
      await axios.post(`${BASE_URL}/auth`, {
        email: userData.email,
        password: 'wrongpassword',
      });
    } catch (error) {
      expect(error.response.status).to.equal(401);
      expect(error.response.data).to.include({ error: 'AuthError' });
      expect(error.response.data.code).to.equal('AUTH_02');
    }
  });

  it('should fail with missing fields', async () => {
    try {
      await axios.post(`${BASE_URL}/auth`, { email: userData.email });
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data).to.include({ error: 'ValidationError' });
      expect(error.response.data.code).to.equal('AUTH_VALIDATION');
    }
  });

  it('should authenticate with rememberMe and return a token with 1 week expiration', async () => {
    const { status, data } = await axios.post(`${BASE_URL}/auth`, {
      email: userData.email,
      password: userData.password,
      rememberMe: true,
    });

    expect(status).to.equal(200);

    const decoded = jwt.decode(data.token) as jwt.JwtPayload;

    expect(decoded).haveOwnProperty('exp');

    const expiresInSeconds = decoded.exp! - Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    // Allow a 10-second margin due to processing delays
    expect(Math.abs(expiresInSeconds - sevenDaysInSeconds)).lt(10);
  });
});
