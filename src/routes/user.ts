import bcrypt from 'bcrypt';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT } from '../middlewares/auth-middleware';
import { NotFoundError, ValidationError } from '../types/errors';
import type { UserDTO } from '../types/user';
import { validateBody } from '../utils/validation';

const SALT_ROUNDS = 10;
const userRouter = Router();

userRouter.post('/', authenticateJWT, async (req: Request, res: Response) => {
  await validateBody(req.body);
  const userInput = req.body as UserDTO;

  const hashedPassword = await bcrypt.hash(userInput.password, SALT_ROUNDS);

  const savedUser = await prisma.user.create({
    data: {
      name: userInput.name,
      email: userInput.email,
      password: hashedPassword,
      birthdate: userInput.birthdate ? new Date(userInput.birthdate) : undefined,
    },
  });

  // Do not return the password in the response
  const { password: _, ...userWithoutPassword } = savedUser;
  res.status(201).json(userWithoutPassword);
});

userRouter.get('/:id', authenticateJWT, async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  if (Number.isNaN(userId)) {
    throw new ValidationError('Invalid user ID', 'USER_VALIDATION');
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found', 'USER_NOT_FOUND');
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

export { userRouter };
