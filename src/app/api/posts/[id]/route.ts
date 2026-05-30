import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Comment as PrismaComment, User as PrismaUser } from '@/generated/prisma/client';

type CommentWithAuthor = PrismaComment & {
  author: Pick<PrismaUser, 'id' | 'displayName'>;
};

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

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

    return NextResponse.json({
      id: post.id,
      category: post.category,
      subCategory: post.subCategory,
      title: post.title,
      content: post.content,
      attachments: post.attachments ? JSON.parse(post.attachments) : [],
      authorId: post.authorId,
      author: post.author,
      viewCount: post.viewCount,
      commentCount: post.comments.length,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      comments: (post.comments as CommentWithAuthor[]).map((c) => ({
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        author: c.author,
        createdAt: c.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[GET /api/posts/[id]]', err);
    return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isOwner = post.authorId === session.user.id;
    const isAdmin = (session.user as { role?: string }).role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        ...(body.content ? { content: body.content.trim() } : {}),
        ...(body.subCategory !== undefined ? { subCategory: body.subCategory } : {}),
        ...(body.attachments !== undefined
          ? { attachments: body.attachments.length > 0 ? JSON.stringify(body.attachments) : null }
          : {}),
      },
    });

    return NextResponse.json({ id: updated.id, title: updated.title });
  } catch (err) {
    console.error('[PUT /api/posts/[id]]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isOwner = post.authorId === session.user.id;
    const isAdmin = (session.user as { role?: string }).role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/posts/[id]]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
