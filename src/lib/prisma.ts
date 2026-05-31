import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL || '';
  if (connectionString.startsWith('mysql://')) {
    connectionString = connectionString.replace('mysql://', 'mariadb://');
  }
  
  // 연결 풀 파라미터 추가 (더 보수적인 설정)
  if (connectionString && !connectionString.includes('connection_limit=')) {
    connectionString += '?connection_limit=5&pool_timeout=60&connect_timeout=60';
  }
  
  const adapter = new PrismaMariaDb(connectionString || 'mariadb://localhost:3306/placeholder_db');

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // 연결 수명 관리
    __internal: {
      engine: {
        // 연결을 더 오래 유지하여 재연결 횟수 줄이기
        connectionTimeout: 60000,
        poolTimeout: 60000,
        idleTimeout: 300000, // 5분 유휴 시간
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
