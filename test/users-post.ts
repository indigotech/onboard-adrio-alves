import type { User } from '@prisma/client';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { describe, it } from 'mocha';
import { prisma } from '../src/db';
import { generateToken } from '../src/utils/jwt';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const jwtToken = generateToken({ id: 0 });

describe('POST /users', () => {
  it('should create a new user when authenticated', async () => {
    const userData = {
      name: 'Test User',
      email: 'Test.User@Mail.com',
      password: 'password123',
      birthdate: '1990-01-01',
    };
    const { password: plainPassword, ...userDataWithoutPassword } = userData;

    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const createdUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    expect(createdUser).to.not.be.null;
    if (!createdUser) throw new Error('User was not created');
    const { id, password, ...userColumns } = createdUser;
    expect(id).to.be.gt(0);
    expect(userColumns).to.deep.equal({
      ...userDataWithoutPassword,
      birthdate: new Date(userData.birthdate),
    });
    expect(await bcrypt.compare(userData.password, password)).to.be.true;

    expect(response.status).to.equal(201);
    expect(response.data).to.be.deep.eq({
      id: id,
      ...userColumns,
      birthdate: new Date(userData.birthdate).toISOString(),
    });
  });

  it('should fail if Authorization header is missing', async () => {
    const userData = {
      name: 'No Auth',
      email: 'noauth@mail.com',
      password: 'password123',
    };
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Authorization header missing',
      code: 'AUTH_MISSING_HEADER',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should fail if Authorization header is not Bearer', async () => {
    const userData = {
      name: 'Bad Auth',
      email: 'badauth@mail.com',
      password: 'password123',
    };
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Token ${jwtToken}` },
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Invalid Authorization header format. Expected Bearer token.',
      code: 'AUTH_INVALID_FORMAT',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should fail if Authorization token is invalid', async () => {
    const userData = {
      name: 'Invalid Token',
      email: 'invalidtoken@mail.com',
      password: 'password123',
    };

    const fakeToken = jwt.sign({ id: 0 }, 'wrong_secret', { expiresIn: '1h' });
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      headers: { Authorization: `Bearer ${fakeToken}` },
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Invalid or expired token.',
      code: 'AUTH_INVALID_TOKEN',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  describe('Validation', () => {
    it('should fail if body is missing', async () => {
      const response = await axios.post(`${BASE_URL}/users`, undefined, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        validateStatus: status => status === 400,
      });
      expect(response.data).to.deep.equal({
        error: 'ValidationError',
        code: 'USR_01',
        message: 'Erro na validação: algum campo da requisição não é válido.',
        details: 'Request body is required.',
      });
    });

    it('should fail if required fields are missing', async () => {
      const invalidBodies = [
        {},
        { name: 'Test' },
        { email: 'test@mail.com' },
        { password: 'abc123' },
        { name: 'Test', email: 'test@mail.com' },
        { name: 'Test', password: 'abc123' },
        { email: 'test@mail.com', password: 'abc123' },
      ];
      for (const body of invalidBodies) {
        const response = await axios.post(`${BASE_URL}/users`, body, {
          headers: { Authorization: `Bearer ${jwtToken}` },
          validateStatus: status => status === 400,
        });
        expect(response.data).to.deep.equal({
          error: 'ValidationError',
          code: 'USR_02',
          message: 'Erro na validação: algum campo da requisição não é válido.',
          details: 'Email, name, and password are required.',
        });
      }
    });
  });

  it('should fail if password is too short or lacks digits/letters', async () => {
    const invalidPasswords = ['abc', '123456', 'abcdef', 'abc12'];
    for (const password of invalidPasswords) {
      const response = await axios.post(
        `${BASE_URL}/users`,
        {
          name: 'Test',
          email: `test${password}@mail.com`,
          password,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          validateStatus: status => status === 400,
        },
      );
      expect(response.data).to.deep.equal({
        error: 'ValidationError',
        code: 'USR_03',
        message: 'Erro na validação: algum campo da requisição não é válido.',
        details: 'Password must be at least 6 characters long and contain at least one letter and one digit.',
      });
    }
  });

  it('should fail if birthdate is invalid', async () => {
    const response = await axios.post(
      `${BASE_URL}/users`,
      {
        name: 'Test',
        email: 'testbirthdate@mail.com',
        password: 'abc123',
        birthdate: 'not-a-date',
      },
      {
        headers: { Authorization: `Bearer ${jwtToken}` },
        validateStatus: status => status === 400,
      },
    );
    expect(response.data).to.deep.equal({
      error: 'ValidationError',
      code: 'USR_04',
      message: 'Erro na validação: algum campo da requisição não é válido.',
      details: 'Invalid birthdate format. Use YYYY-MM-DD.',
    });
  });

  it('should fail if email already exists', async () => {
    const user = {
      name: 'Test',
      email: 'duplicate@mail.com',
      password: 'abc123',
    };
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
      },
    });
    const response = await axios.post(`${BASE_URL}/users`, user, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      validateStatus: status => status === 409,
    });
    expect(response.data).to.deep.equal({
      error: 'ConflictError',
      code: 'USR_05',
      message: 'Erro de conflito: já existe um recurso com os mesmos dados.',
      details: 'Email already exists.',
    });
  });
});
