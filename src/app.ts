import bcrypt from 'bcrypt';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from './db';
import { errorHandler } from './middlewares/error-handler';
import { userRouter } from './routes/user';
import { listenAsync } from './utils/listen-async';
import { validateBody } from './utils/validation';

const SALT_ROUNDS = 10;
const PORT = +(process.env.PORT || 3000);

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use('/users', userRouter);

app.use(errorHandler);

async function setupServer() {
  const server = await listenAsync(app, PORT);

  console.log(`API is running at http://localhost:${PORT}`);

  return server;
}

export { app, setupServer };
