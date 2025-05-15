import bcrypt from 'bcrypt';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { AuthDTO } from '../types/auth';
import { AuthError, ValidationError } from '../types/errors';
import { generateToken } from '../utils/jwt';

const authRouter = Router();

authRouter.post('/', async (req: Request, res: Response) => {
  const credentialsInput = req.body as AuthDTO;
  const rememberMe = typeof req.body.rememberMe === 'boolean' ? req.body.rememberMe : false;

  if (
    !credentialsInput.email ||
    typeof credentialsInput.email !== 'string' ||
    !credentialsInput.password ||
    typeof credentialsInput.password !== 'string'
  ) {
    throw new ValidationError('Email and password are required.', 'AUTH_VALIDATION');
  }

  const user = await prisma.user.findUnique({ where: { email: credentialsInput.email } });
  if (!user) {
    throw new AuthError('Invalid credentials. User not found', 'AUTH_01');
  }

  const isValid = await bcrypt.compare(credentialsInput.password, user.password);
  if (!isValid) {
    throw new AuthError('Invalid credentials.', 'AUTH_02');
  }

  const token = generateToken({ id: user.id }, rememberMe ? '7d' : undefined);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

export { authRouter };
