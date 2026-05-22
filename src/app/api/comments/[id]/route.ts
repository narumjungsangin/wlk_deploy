import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdminEmail } from '@/lib/admin';

interface Params {
  params: Promise<{ id: string }>;
}

// 댓글 수정
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: { select: { email: true } } },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 작성자 또는 관리자만 수정 가능
    const isOwner = comment.authorId === session.user.id;
    const isAdmin = isAdminEmail(session.user?.email || '');
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: '내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: {
          select: { id: true, displayName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PUT /api/comments/[id]]', err);
    return NextResponse.json(
      { error: '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: { select: { email: true } } },
    });

    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 작성자 또는 관리자만 삭제 가능
    const isOwner = comment.authorId === session.user.id;
    const isAdmin = isAdminEmail(session.user?.email || '');
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/comments/[id]]', err);
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
