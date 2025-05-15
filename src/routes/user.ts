import bcrypt from 'bcrypt';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { UserDTO } from '../types/user';
import { validateBody } from '../utils/validation';

const SALT_ROUNDS = 10;
const userRouter = Router();

userRouter.post('/', async (req: Request, res: Response) => {
  const userInput = req.body as UserDTO;
  await validateBody(userInput);

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

export { userRouter };
