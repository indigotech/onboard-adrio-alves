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
});
