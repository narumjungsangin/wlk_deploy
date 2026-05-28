import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 내 댓글 목록
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      }),
      prisma.comment.count({ where: { authorId: user.id } }),
    ]);

    const mappedComments = comments.map((c) => ({
      id: c.id,
      content: c.content,
      postId: c.postId,
      postTitle: c.post.title,
      postCategory: c.post.category,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({
      comments: mappedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[account/comments GET] ERROR:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
