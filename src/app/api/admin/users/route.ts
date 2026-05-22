import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin, createAdminResponse, isAdminEmail } from '@/lib/admin';

// 사용자 목록 조회
export async function GET() {
  const adminCheck = await checkAdmin();
  if (adminCheck.status !== 200) {
    return createAdminResponse(adminCheck.error!, adminCheck.status);
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    // Social login 여부 판단 (비밀번호가 비어있으면 소셜 로그인)
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { password: true },
        });
        return {
          ...user,
          postCount: user._count.posts,
          commentCount: user._count.comments,
          socialLogin: !dbUser?.password || dbUser.password === '',
          isProtectedAdmin: isAdminEmail(user.email),
        };
      })
    );

    return NextResponse.json(usersWithDetails);
  } catch (err) {
    console.error('[GET /api/admin/users]', err);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
