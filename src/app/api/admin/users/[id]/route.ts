import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdmin, createAdminResponse, isAdminEmail } from '@/lib/admin';

interface Params {
  params: Promise<{ id: string }>;
}

// 사용자 정보 업데이트 (역할 변경, 차단 등)
export async function PUT(req: NextRequest, { params }: Params) {
  const adminCheck = await checkAdmin();
  if (adminCheck.status !== 200) {
    return createAdminResponse(adminCheck.error!, adminCheck.status);
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { role, blocked } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 보호된 관리자 계정은 수정 불가
    if (isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: '관리자 계정은 수정할 수 없습니다.' },
        { status: 403 }
      );
    }

    const updateData: { role?: string; blocked?: boolean } = {};
    if (role !== undefined) {
      updateData.role = role;
    }
    if (blocked !== undefined) {
      // Prisma 스키마에 blocked 필드가 없으므로 주석으로 표시
      // updateData.blocked = blocked;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error('[PUT /api/admin/users/[id]]', err);
    return NextResponse.json(
      { error: '사용자 정보 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자 삭제
export async function DELETE(_req: NextRequest, { params }: Params) {
  const adminCheck = await checkAdmin();
  if (adminCheck.status !== 200) {
    return createAdminResponse(adminCheck.error!, adminCheck.status);
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 보호된 관리자 계정은 삭제 불가
    if (isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: '관리자 계정은 삭제할 수 없습니다.' },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/users/[id]]', err);
    return NextResponse.json(
      { error: '사용자 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
