import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export async function setupDatabase() {
  prisma = new PrismaClient();
  await prisma.$connect();
}

export { prisma };
