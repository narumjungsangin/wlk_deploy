import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: '닉네임을 입력해주세요.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        displayName: {
          equals: username.trim(),
        },
      },
    });

    return NextResponse.json({
      available: !existing,
      username: username.trim(),
    });
  } catch (err) {
    console.error('[check-username] ERROR:', err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
