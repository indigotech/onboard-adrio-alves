import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { describe, it } from 'mocha';
import { prisma } from '../src/db';

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

    const { password, ...userWithoutPassword } = user!;

    expect(status).to.equal(200);
    expect(data.user).to.deep.eq({ ...userWithoutPassword, birthdate: userWithoutPassword.birthdate?.toISOString() });

    const decoded = jwt.decode(data.token) as jwt.JwtPayload;

    expect(decoded).haveOwnProperty('exp');

    const expiresInSeconds = decoded.exp! - Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 60 * 60;

    expect(Math.abs(expiresInSeconds - sevenDaysInSeconds)).lt(10);
  });

  it('should fail with non-existent user', async () => {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      {
        email: 'nouser@example.com',
        password: 'irrelevant',
      },
      { validateStatus: status => status === 401 },
    );
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      code: 'AUTH_01',
      details: 'Invalid credentials. User not found',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should fail with invalid password', async () => {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      {
        email: userData.email,
        password: 'wrongpassword',
      },
      { validateStatus: status => status === 401 },
    );
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      code: 'AUTH_02',
      details: 'Invalid credentials.',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should fail with missing fields', async () => {
    const response = await axios.post(
      `${BASE_URL}/auth`,
      { email: userData.email },
      { validateStatus: status => status === 400 },
    );
    expect(response.data).to.deep.equal({
      error: 'ValidationError',
      code: 'AUTH_VALIDATION',
      details: 'Invalid credentials input',
      message: 'Erro na validação: algum campo da requisição não é válido.',
    });
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
    if (!decoded.exp) throw new Error('Token expiration not found');

    const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    // Allow a 10-second margin due to processing delays
    expect(Math.abs(expiresInSeconds - sevenDaysInSeconds)).lt(10);
  });
});
