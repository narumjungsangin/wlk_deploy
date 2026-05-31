import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    
    // 사용자 수 확인
    const userCount = await prisma.user.count();
    
    // 게시물 수 확인
    const postCount = await prisma.post.count();
    
    // 댓글 수 확인
    const commentCount = await prisma.comment.count();
    
    // 관리자 계정 확인
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@wlafayettekorea.org' }
    });
    
    // 카테고리별 게시물 확인
    const postsByCategory = await prisma.post.groupBy({
      by: ['category'],
      _count: true
    });
    
    // 최근 게시물 5개 확인
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      stats: {
        users: userCount,
        posts: postCount,
        comments: commentCount
      },
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.displayName
      } : null,
      postsByCategory,
      recentPosts
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      database: 'connection_failed'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
