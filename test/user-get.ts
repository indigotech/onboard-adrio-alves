import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { prisma } from '../src/db';
import { generateToken } from '../src/utils/jwt';
import type { Address } from '@prisma/client';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const jwtToken = generateToken({ id: 0 });

describe('GET /users/:id', () => {
  let userId: number;
  let addressObj: Address;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Get User',
        email: 'getuser@mail.com',
        password: await bcrypt.hash('abc123', 10),
        birthdate: new Date('1995-05-15'),
        addresses: {
          create: [
            {
              cep: '99999-999',
              street: 'Side St',
              streetNumber: '456',
              complement: 'Suite 2',
              neighborhood: 'Uptown',
              city: 'Another City',
              state: 'NY',
            },
          ],
        },
      },
      include: { addresses: true },
    });
    userId = user.id;
    addressObj = user.addresses[0];
  });

  it('should return user data when authenticated', async () => {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(response.status).to.equal(200);
    expect(response.data).to.deep.eq({
      id: userId,
      name: 'Get User',
      email: 'getuser@mail.com',
      birthdate: new Date('1995-05-15').toISOString(),
      addresses: [
        {
          id: addressObj.id,
          userId: userId,
          cep: '99999-999',
          street: 'Side St',
          streetNumber: '456',
          complement: 'Suite 2',
          neighborhood: 'Uptown',
          city: 'Another City',
          state: 'NY',
        },
      ],
    });
  });

  it('should fail if user does not exist', async () => {
    const response = await axios.get(`${BASE_URL}/users/999999`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
      validateStatus: status => status === 404,
    });
    expect(response.data).to.deep.equal({
      error: 'NotFoundError',
      code: 'USER_NOT_FOUND',
      message: 'Erro de não encontrado: o recurso solicitado não foi encontrado.',
      details: 'User not found',
    });
  });

  it('should fail if Authorization header is missing', async () => {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
      validateStatus: status => status === 401,
    });
    expect(response.data).to.deep.equal({
      error: 'AuthError',
      details: 'Authorization header missing',
      code: 'AUTH_MISSING_HEADER',
      message: 'Erro de autenticação: as credenciais fornecidas não são válidas.',
    });
  });

  it('should fail if Authorization token is invalid', async () => {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
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
