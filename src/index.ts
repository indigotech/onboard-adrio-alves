import { PrismaClient, type User } from '@prisma/client';
import bcrypt from 'bcrypt';
import express from 'express';
import type { Request, Response } from 'express';

import { ValidationError, validadeBody } from './utils';

const SALT_ROUNDS = 10;

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
