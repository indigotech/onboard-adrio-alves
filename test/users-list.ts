import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { prisma } from '../src/db';
import { generateToken } from '../src/utils/jwt';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const jwtToken = generateToken({ id: 0 });

describe('GET /users', () => {
  let userObjs: Array<{ id: number; name: string; email: string; birthdate: string | null }> = [];
  beforeEach(async () => {
    await prisma.user.createMany({
      data: [
        {
          name: 'Charlie',
          email: 'charlie@mail.com',
          password: await bcrypt.hash('abc123', 10),
          birthdate: new Date('1990-01-03'),
        },
        {
          name: 'Alice',
          email: 'alice@mail.com',
          password: await bcrypt.hash('abc123', 10),
          birthdate: new Date('1990-01-01'),
        },
        {
          name: 'Bob',
          email: 'bob@mail.com',
          password: await bcrypt.hash('abc123', 10),
          birthdate: new Date('1990-01-02'),
        },
      ],
    });
    const allUsers = await prisma.user.findMany({ orderBy: { name: 'asc' } });
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
    expect(response.data).to.include({ error: 'ValidationError' });
    expect(response.data.code).to.equal('USER_VALIDATION');
  });

  it('should return 400 for invalid skip parameter', async () => {
    const response = await axios.get(`${BASE_URL}/users?skip=-1`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      validateStatus: status => status === 400,
    });
    expect(response.data).to.include({ error: 'ValidationError' });
    expect(response.data.code).to.equal('USER_VALIDATION');
  });

  it('should return 401 if Authorization header is missing', async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      validateStatus: status => status === 401,
    });
    expect(response.data).to.include({ error: 'AuthError' });
    expect(response.data.code).to.equal('AUTH_MISSING_HEADER');
  });

  it('should return 401 if Authorization token is invalid', async () => {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: 'Bearer invalidtoken' },
      validateStatus: status => status === 401,
    });
    expect(response.data).to.include({ error: 'AuthError' });
    expect(response.data.code).to.equal('AUTH_INVALID_TOKEN');
  });
});
