import axios from 'axios';
import bcrypt from 'bcrypt';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { prisma } from '../src/db';

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
    const { password: plainPassword, ...userDataWithoutPassword } = userData;

    const response = await axios.post(`${BASE_URL}/users`, userData);

    const createdUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    expect(createdUser).to.not.be.null;
    const { id, password, ...userColumns } = createdUser!;
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

  describe('Validation', () => {
    it('should fail if body is missing', async () => {
      try {
        await axios.post(`${BASE_URL}/users`);
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.include({
          error: 'ValidationError',
          code: 'USR_01',
        });
        expect(error.response.data.message).to.be.a('string');
        expect(error.response.data.details).to.equal('Request body is required.');
      }
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
        try {
          await axios.post(`${BASE_URL}/users`, body);
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.include({
            error: 'ValidationError',
            code: 'USR_02',
          });
          expect(error.response.data.details).to.equal('Email, name, and password are required.');
        }
      }
    });

    it('should fail if password is too short or lacks digits/letters', async () => {
      const invalidPasswords = ['abc', '123456', 'abcdef', '123abc', 'abc12', '12345a'];
      for (const password of invalidPasswords) {
        try {
          await axios.post(`${BASE_URL}/users`, {
            name: 'Test',
            email: `test${password}@mail.com`,
            password,
          });
        } catch (error) {
          expect(error.response.status).to.equal(400);
          expect(error.response.data).to.include({
            error: 'ValidationError',
            code: 'USR_03',
          });
          expect(error.response.data.details).to.equal(
            'Password must be at least 6 characters long and contain at least one letter and one digit.',
          );
        }
      }
    });

    it('should fail if birthdate is invalid', async () => {
      try {
        await axios.post(`${BASE_URL}/users`, {
          name: 'Test',
          email: 'testbirthdate@mail.com',
          password: 'abc123',
          birthdate: 'not-a-date',
        });
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.include({
          error: 'ValidationError',
          code: 'USR_04',
        });
        expect(error.response.data.details).to.equal('Invalid birthdate format. Use YYYY-MM-DD.');
      }
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
      try {
        await axios.post(`${BASE_URL}/users`, user);
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data).to.include({
          error: 'ValidationError',
          code: 'USR_05',
        });
        expect(error.response.data.details).to.equal('Email already exists.');
      }
    });
  });
});
