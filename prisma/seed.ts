import { PrismaClient } from '../src/generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { SEED_POSTS, SEED_COMMENTS } from '../src/lib/seed-data';

const connectionString = (process.env.DATABASE_URL || '').replace('mysql://', 'mariadb://');
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding legacy user...');
  await prisma.user.upsert({
    where: { id: 'legacy' },
    update: {},
    create: {
      id: 'legacy',
      email: 'legacy@wlk.internal',
      password: '',
      displayName: '운영자',
      firstName: '운영',
      lastName: '자',
    },
  });

  console.log(`Seeding ${SEED_POSTS.length} posts...`);
  for (const post of SEED_POSTS) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        category: post.category,
        subCategory: post.subCategory ?? null,
        tag: post.tag ?? null,
        title: post.title,
        content: post.content,
        authorId: 'legacy',
        viewCount: post.viewCount ?? 0,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      },
    });
  }

  console.log(`Seeding ${SEED_COMMENTS.length} comments...`);
  for (const comment of SEED_COMMENTS) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {},
      create: {
        id: comment.id,
        postId: comment.postId,
        authorId: 'legacy',
        content: comment.content,
        createdAt: new Date(comment.createdAt),
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
