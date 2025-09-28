import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import usersRouter from './src/routes/users.router.js';
import boardsRouter from './src/routes/boards.router.js';
import supportsRouter from './src/routes/supports.router.js';
import { testConnection, disconnectDatabase } from './src/config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 URL
  credentials: true // 쿠키 전송 허용
}));
app.use(cookieParser()); // 쿠키 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Express 서버가 정상적으로 실행 중입니다!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// API 라우트 예시
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 라우터 연결
app.use('/api/users', usersRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/supports', supportsRouter);

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: '요청한 경로를 찾을 수 없습니다.',
    path: req.originalUrl
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : '서버 오류'
  });
});

// 데이터베이스 연결 및 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
    await testConnection();
    console.log('✅ Prisma 데이터베이스 연결이 준비되었습니다.');
    
    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`📱 API 테스트: http://localhost:${PORT}`);
      console.log(`🔍 헬스 체크: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 서버를 종료합니다...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 서버를 종료합니다...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();
