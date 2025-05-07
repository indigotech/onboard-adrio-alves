import { PrismaClient } from '@prisma/client';
// import { PrismaClient } from './generated/clientPg';

const prisma = new PrismaClient();

async function main() {
  // Create a new user
  const newUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
  console.log('Created User:', newUser);

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log('All Users:', users);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
