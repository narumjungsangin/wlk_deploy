import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin, createAdminResponse } from '@/lib/admin';

// 모든 댓글 조회 (어드민용)
export async function GET(req: NextRequest) {
  const adminCheck = await checkAdmin();
  if (adminCheck.status !== 200) {
    return createAdminResponse(adminCheck.error!, adminCheck.status);
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, displayName: true },
          },
          post: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.comment.count(),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/comments]', err);
    return NextResponse.json(
      { error: '댓글 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 댓글 일괄 삭제
export async function DELETE(req: NextRequest) {
  const adminCheck = await checkAdmin();
  if (adminCheck.status !== 200) {
    return createAdminResponse(adminCheck.error!, adminCheck.status);
  }

  try {
    const body = await req.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 댓글 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    await prisma.comment.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    console.error('[DELETE /api/admin/comments]', err);
    return NextResponse.json(
      { error: '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
