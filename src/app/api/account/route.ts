import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: 현재 사용자 정보 가져오기
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error('[account GET] ERROR:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PUT: 사용자 정보 업데이트
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, email } = body;

    if (!displayName?.trim()) {
      return NextResponse.json({ error: '닉네임은 필수입니다.' }, { status: 400 });
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: '이메일은 필수입니다.' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 닉네임 중복 확인 (자기 자신 제외)
    if (displayName.trim() !== currentUser.displayName) {
      const existingByName = await prisma.user.findFirst({
        where: {
          displayName: displayName.trim(),
          id: { not: currentUser.id },
        },
      });
      if (existingByName) {
        return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 });
      }
    }

    // 이메일 중복 확인 (자기 자신 제외)
    if (email.trim().toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (existingByEmail) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
      }
    }

    // 이름 파싱 (firstName, lastName)
    const nameParts = displayName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({
      message: '계정 정보가 업데이트되었습니다.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('[account PUT] ERROR:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
