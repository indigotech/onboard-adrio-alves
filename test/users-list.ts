import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { prisma } from '../src/db';
import { generateToken } from '../src/utils/jwt';
import type { Address, User } from '@prisma/client';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const jwtToken = generateToken({ id: 0 });

describe('GET /users', () => {
  let userObjs: Array<
    Omit<User, 'password' | 'birthdate'> & {
      birthdate: string | null;
      addresses: Array<Address>;
    }
  > = [];
  beforeEach(async () => {
    await prisma.user.create({
      data: {
        name: 'Charlie',
        email: 'charlie@mail.com',
        password: await bcrypt.hash('abc123', 10),
        birthdate: new Date('1990-01-03'),
        addresses: {
          create: [
            {
              cep: '11111-111',
              street: 'A St',
              streetNumber: '1',
              complement: null,
              neighborhood: 'Alpha',
              city: 'CityA',
              state: 'CA',
            },
          ],
        },
      },
      include: { addresses: true },
    });
    await prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@mail.com',
        password: await bcrypt.hash('abc123', 10),
        birthdate: new Date('1990-01-01'),
        addresses: {
          create: [
            {
              cep: '22222-222',
              street: 'B St',
              streetNumber: '2',
              complement: null,
              neighborhood: 'Beta',
              city: 'CityB',
              state: 'NY',
            },
          ],
        },
      },
      include: { addresses: true },
    });
    await prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@mail.com',
        password: await bcrypt.hash('abc123', 10),
        birthdate: new Date('1990-01-02'),
      },
    });
    const allUsers = await prisma.user.findMany({ orderBy: { name: 'asc' }, include: { addresses: true } });
    userObjs = allUsers.map(u => {
      const { password, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        birthdate: u.birthdate ? u.birthdate.toISOString() : null,
      };
    });
  });

  it('should return paginated users with metadata (default limit/skip)', async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.eq({
      data: userObjs,
      total: 3,
      hasPrevious: false,
      hasNext: false,
    });
  });

  it('should return only the number of users specified by limit and correct metadata', async () => {
    const response = await axios.get(`${BASE_URL}/users?limit=2`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.eq({
      data: [userObjs[0], userObjs[1]],
      total: 3,
      hasPrevious: false,
      hasNext: true,
    });
  });

  it('should return the next page of users with skip and correct metadata', async () => {
    const response = await axios.get(`${BASE_URL}/users?limit=2&skip=2`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.eq({
      data: [userObjs[2]],
      total: 3,
      hasPrevious: true,
      hasNext: false,
    });
  });

  it('should return 400 for invalid limit parameter', async () => {
    const response = await axios.get(`${BASE_URL}/users?limit=notanumber`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      validateStatus: status => status === 400,
    });
    expect(response.data).to.deep.equal({
      error: 'ValidationError',
      code: 'USER_VALIDATION',
      message: 'Erro na validação: algum campo da requisição não é válido.',
      details: 'Invalid limit parameter',
    });
  });

  it('should return 400 for invalid skip parameter', async () => {
    const response = await axios.get(`${BASE_URL}/users?skip=-1`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      validateStatus: status => status === 400,
    });
    expect(response.data).to.deep.equal({
      error: 'ValidationError',
      code: 'USER_VALIDATION',
      message: 'Erro na validação: algum campo da requisição não é válido.',
      details: 'Invalid skip parameter',
    });
  });

  it('should return 401 if Authorization header is missing', async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Authorization header missing',
      code: 'AUTH_MISSING_HEADER',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should return 401 if Authorization token is invalid', async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: 'Bearer invalidtoken' },
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Invalid or expired token.',
      code: 'AUTH_INVALID_TOKEN',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });
});
