import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// 관리자 이메일 목록
export const ADMIN_EMAILS = ['joonst26@gmail.com', 'purepsy@gmail.com'];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

export async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: '로그인이 필요합니다.', status: 401 };
  }
  if (!isAdminEmail(session.user.email)) {
    return { error: '관리자 권한이 없습니다.', status: 403 };
  }
  return { session, status: 200 };
}

export function createAdminResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
