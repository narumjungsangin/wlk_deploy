import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Post as PrismaPost, User as PrismaUser } from '@/generated/prisma/client';

type PostWithRelations = PrismaPost & {
  author: Pick<PrismaUser, 'id' | 'displayName'>;
  _count: { comments: number };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    const subCategory = searchParams.get('sub');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '15', 10);

    const where = {
      ...(category ? { category } : {}),
      ...(subCategory ? { subCategory } : {}),
      ...(tag ? { tag } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, displayName: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const items = (posts as PostWithRelations[]).map((p) => ({
      id: p.id,
      category: p.category,
      subCategory: p.subCategory,
      title: p.title,
      authorId: p.authorId,
      author: p.author,
      viewCount: p.viewCount,
      commentCount: p._count.comments,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (err) {
    console.error('[GET /api/posts]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { category, subCategory, tag, title, content } = body;

    if (!category || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '카테고리, 제목, 내용은 필수입니다.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        category,
        subCategory: subCategory ?? null,
        tag: tag ?? null,
        title: title.trim(),
        content: content.trim(),
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, displayName: true } },
      },
    });

    return NextResponse.json(
      {
        id: post.id,
        category: post.category,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        author: post.author,
        viewCount: post.viewCount,
        commentCount: 0,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/posts]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
