import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient();

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function validadeBody(body: User) {
  if (!body) {
    throw new ValidationError('Request body is required.');
  }

  if (!body.email || !body.name || !body.password) {
    throw new ValidationError('Email, name, and password are required.');
  }

  // Password validation: at least 6 chars, at least 1 letter and 1 digit
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(body.password)) {
    throw new ValidationError(
      'Password must be at least 6 characters long and contain at least one letter and one digit.',
    );
  }

  // Birthdate validation (if provided)
  if (
    body.birthdate &&
    Number.isNaN(Date.parse(typeof body.birthdate === 'string' ? body.birthdate : body.birthdate.toISOString()))
  ) {
    throw new ValidationError('Invalid birthdate format. Use YYYY-MM-DD.');
  }

  // Email uniqueness check
  const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
  console.log('existingUser', existingUser);
  if (existingUser) {
    throw new ValidationError('Email already exists.');
  }
}
