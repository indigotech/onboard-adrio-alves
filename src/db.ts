console.log(process.env.DATABASE_URL);
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export async function setupDatabase() {
  console.log(process.env.DATABASE_URL);
  prisma = new PrismaClient();
  await prisma.$connect();
}

export { prisma };
