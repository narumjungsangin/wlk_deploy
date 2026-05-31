import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, loginLimiter } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check (로그인과 동일한 제한 적용)
    const rateLimitResult = await checkRateLimit(loginLimiter, req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // 사용자가 존재하지 않아도 성공 메시지 반환 (보안)
    if (!user) {
      return NextResponse.json({
        message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
      });
    }

    // 소셜 로그인 계정 체크
    if (!user.password || user.password === '') {
      return NextResponse.json({
        error: '소셜 로그인으로 가입한 계정은 비밀번호 재설정이 불가능합니다.',
      }, { status: 400 });
    }

    // 재설정 토큰 생성 (1시간 유효)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 이메일 발송
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      console.error('[forgot-password] Email sending failed:', emailErr);
      return NextResponse.json(
        { error: '이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
