import { PrismaClient, type User } from '@prisma/client';
import type { UserDTO } from './types/user';

const prisma = new PrismaClient();

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function validadeBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required.');
  }
  const input = body as UserDTO;

  if (!input.email || !input.name || !input.password) {
    throw new ValidationError('Email, name, and password are required.');
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(input.password)) {
    throw new ValidationError(
      'Password must be at least 6 characters long and contain at least one letter and one digit.',
    );
  }

  const isValidBirthdate = input.birthdate && Number.isNaN(Date.parse(input.birthdate));
  if (isValidBirthdate) {
    throw new ValidationError('Invalid birthdate format. Use YYYY-MM-DD.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new ValidationError('Email already exists.');
  }
}
