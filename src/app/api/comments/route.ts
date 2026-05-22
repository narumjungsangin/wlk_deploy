import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';

// 댓글 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, displayName: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error('[GET /api/comments]', err);
    return NextResponse.json(
      { error: '댓글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 생성
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { postId, content } = body;

    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: '게시글 ID와 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, displayName: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('[POST /api/comments]', err);
    return NextResponse.json(
      { error: '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
