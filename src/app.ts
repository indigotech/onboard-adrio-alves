import express from 'express';
import type { Request, Response } from 'express';
import { errorHandler } from './middlewares/error-handler';
import { userRouter } from './routes/user';
import { authRouter } from './routes/auth';
import { listenAsync } from './utils/listen-async';
const PORT = +(process.env.PORT || 3000);

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use('/users', userRouter);
app.use('/auth', authRouter);

app.use(errorHandler);

async function setupServer() {
  const server = await listenAsync(app, PORT);

  console.log(`API is running at http://localhost:${PORT}`);

  return server;
}

export { app, setupServer };
