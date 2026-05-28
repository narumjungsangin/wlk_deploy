import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// DELETE: 계정 삭제
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        posts: { select: { id: true } },
        comments: { select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 비밀번호가 설정된 계정인 경우 확인
    if (user.password && user.password !== '') {
      if (!password) {
        return NextResponse.json(
          { error: '비밀번호를 입력해주세요.' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: '비밀번호가 올바르지 않습니다.' },
          { status: 401 }
        );
      }
    }

    // 관련 데이터 삭제 (Prisma cascade 설정에 따라 자동 처리되지만 명시적으로 처리)
    // 댓글 먼저 삭제
    if (user.comments.length > 0) {
      await prisma.comment.deleteMany({
        where: { authorId: user.id },
      });
    }

    // 게시글 삭제 (댓글도 cascade로 삭제됨)
    if (user.posts.length > 0) {
      await prisma.post.deleteMany({
        where: { authorId: user.id },
      });
    }

    // 사용자 삭제
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: '계정이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('[account/delete DELETE] ERROR:', err);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
