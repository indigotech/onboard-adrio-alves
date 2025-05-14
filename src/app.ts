import bcrypt from 'bcrypt';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from './db';
import { errorHandler } from './middlewares/error-handler';
import type { UserDTO } from './types/user';
import { validateBody } from './utils/validation';
import { listenAsync } from './utils/listen-async';

const SALT_ROUNDS = 10;
const PORT = +(process.env.PORT || 3000);

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/users', async (req: Request, res: Response, next: NextFunction) => {
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

app.use(errorHandler);

async function setupServer() {
  await listenAsync(app, PORT);

  console.log(`API is running at http://localhost:${PORT}`);
}

export { app, setupServer };
