import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName, firstName, lastName } = body;

    if (!email || !password || !displayName || !firstName || !lastName) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findFirst({
      where: {
        displayName: {
          equals: displayName.trim(),
        },
      },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: '이미 사용 중인 닉네임입니다.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      select: { id: true, email: true, displayName: true, firstName: true, lastName: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
