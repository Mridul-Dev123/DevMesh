import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding basic users & posts...');

  // 1️⃣ Clear only Post & User (order matters)
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2️⃣ Create Users
  const users = [];

  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        email: faker.internet.email(),
      },
    });

    users.push(user);
  }

  console.log('✅ Users created');

  // 3️⃣ Create Posts
  for (let i = 0; i < 10; i++) {
    const randomUser = faker.helpers.arrayElement(users);

    await prisma.post.create({
      data: {
        content: faker.lorem.paragraph(),
        authorId: randomUser.id,
      },
    });
  }

  console.log('✅ Posts created');
  console.log('🌱 Seeding done');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
