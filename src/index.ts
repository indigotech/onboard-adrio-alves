import express from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const port: number = 3000;

const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/users', async (req: Request, res: Response) => {
  const userInput = req.body;

  // Validate request body
  if (!userInput.email || !userInput.name || !userInput.password) {
    res.status(400).json({ error: 'Email, name, and password are required.' });
  }

  try {
    // Save user to the database
    const user = await prisma.user.create({
      data: req.body,
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the user.' });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
