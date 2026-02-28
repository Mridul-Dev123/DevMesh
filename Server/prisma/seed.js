import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TECH_STACKS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'React',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'AWS',
];
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
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
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
        username: faker.internet
          .username()
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_'),
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

  // 7️⃣ Create Conversations & Messages
  const conversationPairs = new Set();
  const conversations = [];

  // Pick ~6 random unique user pairs
  for (let i = 0; i < 6; i++) {
    const [userA, userB] = faker.helpers.arrayElements(users, 2);
    if (userA.id === userB.id) continue;

    // Keep pairs order-independent to avoid duplicates
    const key = [userA.id, userB.id].sort().join('-');
    if (conversationPairs.has(key)) continue;
    conversationPairs.add(key);

    const conversation = await prisma.conversation.create({
      data: {
        participantA: userA.id,
        participantB: userB.id,
      },
    });

    conversations.push({ conversation, userA, userB });
  }

  console.log(`✅ ${conversations.length} conversations created`);

  // Seed messages inside each conversation
  let messageCount = 0;

  for (const { conversation, userA, userB } of conversations) {
    const messageCount_this = faker.number.int({ min: 3, max: 10 });
    const participants = [userA, userB];

    for (let m = 0; m < messageCount_this; m++) {
      const sender = faker.helpers.arrayElement(participants);
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: sender.id,
          content: faker.lorem.sentence().substring(0, 1000),
          isRead: faker.datatype.boolean(),
        },
      });
      messageCount++;
    }

    // Bump conversation updatedAt to match last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
  }

  console.log(`✅ ${messageCount} messages created`);
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
