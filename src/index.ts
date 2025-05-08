import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient, type User } from '@prisma/client';

import { validadeBody, ValidationError } from './utils';

const app = express();
const port: number = 3000;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/users', async (req: Request<User>, res: Response) => {
  try {
    await validadeBody(req.body);

    const userInput = req.body;

    // Save user to the database
    const user = await prisma.user.create({
      data: {
        name: userInput.name,
        email: userInput.email,
        password: userInput.password,
        birthdate: userInput.birthdate ? new Date(userInput.birthdate) : undefined,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An error occurred while saving the user.' });
    }
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
