import dotenv from 'dotenv';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config({ path: `${process.env.NODE_ENV || 'development'}.env` });
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding 50 users...');

  const users = await Promise.all(
    Array.from({ length: 50 }, async (_, i) => ({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: await bcrypt.hash('password123', SALT_ROUNDS),
      birthdate: new Date(1990 + ((i + 1) % 30), ((i + 1) % 12), ((i + 1) % 28) + 1),
    }))
  );

  // Bulk insert, skip duplicates on any unique constraint
  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} new users (duplicates skipped).`);
}

main().catch(e => {
  console.error('Seed error:', e);
  process.exit(1);
});
