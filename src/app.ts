import express from 'express';
import type { Request, Response } from 'express';
import { ValidationError, validadeBody } from './utils';
import type { UserDTO } from './types/user';
import bcrypt from 'bcrypt';
import { prisma } from './db';

const SALT_ROUNDS = 10;

const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.post('/users', async (req: Request, res: Response) => {
  try {
    const userInput = req.body as UserDTO;
    await validadeBody(userInput);

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

function setupServer(port: number) {
  //todo: usar await -> fazer a funcao virar promisse
  return app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
  });
}

export { app, setupServer };
