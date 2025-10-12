import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// 데이터베이스 연결 테스트
export const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ 로컬 MySQL 데이터베이스 연결이 성공적으로 설정되었습니다.');
  } catch (error) {
    console.error('❌ 데이터베이스 연결에 실패했습니다:', error.message);
    throw error;
  }
};

// Prisma 클라이언트 종료
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export default prisma;
