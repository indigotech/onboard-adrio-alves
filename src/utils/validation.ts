import { prisma } from '../db';
import { ConflictError, ValidationError } from '../types/errors';
import type { UserDTO } from '../types/user';

export async function validateBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required.', 'USR_01');
  }
  const input = body as UserDTO;

  if (!input.email || !input.name || !input.password) {
    throw new ValidationError('Email, name, and password are required.', 'USR_02');
  }

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(input.password)) {
    throw new ValidationError(
      'Password must be at least 6 characters long and contain at least one letter and one digit.',
      'USR_03',
    );
  }

  const isValidBirthdate = input.birthdate && Number.isNaN(Date.parse(input.birthdate));
  if (isValidBirthdate) {
    throw new ValidationError('Invalid birthdate format. Use YYYY-MM-DD.', 'USR_04');
  }

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new ConflictError('Email already exists.', 'USR_05');
  }
}
