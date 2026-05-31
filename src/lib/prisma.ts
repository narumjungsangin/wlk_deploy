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
  
  // 연결 풀 파라미터 추가
  if (connectionString && !connectionString.includes('connection_limit=')) {
    connectionString += '?connection_limit=20&pool_timeout=30&connect_timeout=30';
  }
  
  const adapter = new PrismaMariaDb(connectionString || 'mariadb://localhost:3306/placeholder_db');

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: connectionString,
      },
    },
    // 연결 풀 설정
    __internal: {
      engine: {
        connectionTimeout: 30000, // 30초 타임아웃
        poolTimeout: 30000, // 30초 풀 타임아웃
        idleTimeout: 60000, // 60초 유휴 타임아웃
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
