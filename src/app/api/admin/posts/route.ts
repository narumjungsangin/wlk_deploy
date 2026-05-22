import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin, createAdminResponse } from '@/lib/admin';

// 모든 게시물 조회 (어드민용)
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

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, displayName: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.post.count(),
    ]);

    return NextResponse.json({
      posts: posts.map(post => ({
        ...post,
        commentCount: post._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/posts]', err);
    return NextResponse.json(
      { error: '게시물 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
