import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/categories';
import { prisma } from '@/lib/prisma';
import PostDetail from './PostDetail';

interface Props {
  params: Promise<{ id: string }>;
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: { id: true, displayName: true } },
        comments: {
          include: { author: { select: { id: true, displayName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return {};
  return { title: post.title };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const cat = getCategoryBySlug(post.category);

  const postData = {
    id: post.id,
    category: post.category,
    categoryLabel: cat?.label ?? post.category,
    title: post.title,
    content: post.content,
    attachments: post.attachments ? JSON.parse(post.attachments) : [],
    authorId: post.authorId,
    author: post.author,
    viewCount: post.viewCount,
    createdAt: post.createdAt.toISOString(),
    comments: post.comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorId: c.authorId,
      author: c.author,
      createdAt: c.createdAt.toISOString(),
    })),
  };

  return <PostDetail post={postData} />;
}
