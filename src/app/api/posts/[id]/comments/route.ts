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
    const comments = await prisma.comment.findMany({
      where: { postId: id },
      include: { author: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(
      (comments as CommentWithAuthor[]).map((c) => ({
        id: c.id,
        content: c.content,
        postId: c.postId,
        authorId: c.authorId,
        author: c.author,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error('[GET /api/posts/[id]/comments]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: '댓글 내용을 입력해주세요.' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content.trim(),
        postId: id,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, displayName: true } } },
    });

    return NextResponse.json(
      {
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        authorId: comment.authorId,
        author: comment.author,
        createdAt: comment.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/posts/[id]/comments]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
