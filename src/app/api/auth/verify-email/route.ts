import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 필요합니다.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 인증 링크입니다.' },
        { status: 400 }
      );
    }

    // 이메일 인증 완료 처리
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    return NextResponse.json({ message: '이메일 인증이 완료되었습니다.' });
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
