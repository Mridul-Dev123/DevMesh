import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TECH_STACKS = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'];
const LANGUAGES = ['javascript', 'typescript', 'python', 'rust', 'go', 'java', 'cpp', 'bash'];
const CODE_SNIPPETS = [
  `const fetchData = async (url) => {\n  const res = await fetch(url);\n  return res.json();\n};`,
  `def fibonacci(n):\n  if n <= 1:\n    return n\n  return fibonacci(n-1) + fibonacci(n-2)`,
  `fn main() {\n  println!("Hello, world!");\n}`,
  `SELECT u.username, COUNT(p.id) AS post_count\nFROM users u\nLEFT JOIN posts p ON u.id = p.author_id\nGROUP BY u.username;`,
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1️⃣ Clear all tables in reverse dependency order
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // 2️⃣ Create Users
  const users = [];

  for (let i = 0; i < 8; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        email: faker.internet.email(),
        bio: faker.lorem.sentence({ min: 5, max: 20 }).substring(0, 160),
        avatarUrl: faker.image.avatar(),
        techStack: faker.helpers.arrayElements(TECH_STACKS, { min: 2, max: 5 }),
      },
    });

    users.push(user);
  }

  console.log(`✅ ${users.length} users created`);

  // 3️⃣ Create Follow relationships
  const followPairs = new Set();

  for (const follower of users) {
    const targets = faker.helpers.arrayElements(
      users.filter((u) => u.id !== follower.id),
      { min: 1, max: 4 }
    );

    for (const target of targets) {
      const key = `${follower.id}-${target.id}`;
      if (followPairs.has(key)) continue;
      followPairs.add(key);

      await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: target.id,
          status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED']), // bias toward ACCEPTED
        },
      });
    }
  }

  console.log(`✅ ${followPairs.size} follow relationships created`);

  // 4️⃣ Create Posts
  const posts = [];

  for (let i = 0; i < 20; i++) {
    const randomUser = faker.helpers.arrayElement(users);
    const hasCode = faker.datatype.boolean();

    const post = await prisma.post.create({
      data: {
        content: faker.lorem.sentences({ min: 1, max: 4 }).substring(0, 500),
        authorId: randomUser.id,
        ...(hasCode && {
          codeSnippet: faker.helpers.arrayElement(CODE_SNIPPETS),
          language: faker.helpers.arrayElement(LANGUAGES),
        }),
      },
    });

    posts.push(post);
  }

  console.log(`✅ ${posts.length} posts created`);

  // 5️⃣ Create Likes
  const likePairs = new Set();
  let likeCount = 0;

  for (const post of posts) {
    const likers = faker.helpers.arrayElements(users, { min: 0, max: 6 });

    for (const user of likers) {
      const key = `${user.id}-${post.id}`;
      if (likePairs.has(key)) continue;
      likePairs.add(key);

      await prisma.like.create({
        data: {
          userId: user.id,
          postId: post.id,
        },
      });
      likeCount++;
    }
  }

  console.log(`✅ ${likeCount} likes created`);

  // 6️⃣ Create Comments
  let commentCount = 0;

  for (const post of posts) {
    const commenters = faker.helpers.arrayElements(users, { min: 0, max: 4 });

    for (const user of commenters) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentence().substring(0, 280),
          authorId: user.id,
          postId: post.id,
        },
      });
      commentCount++;
    }
  }

  console.log(`✅ ${commentCount} comments created`);
  console.log('🌱 Seeding done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
