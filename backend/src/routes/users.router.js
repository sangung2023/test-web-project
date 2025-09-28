import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const userController = new UserController();

// 회원가입
router.post('/signup', userController.createUser);

// 로그인
router.post('/login', userController.loginUser);

// 프로필 조회 (인증 필요) - 본인 정보 조회
router.get('/profile', authenticateToken, userController.getMyProfile);

// 사용자 정보 수정 (인증 필요) - 본인 정보 수정
router.put('/profile', authenticateToken, userController.updateMyProfile);

// 사용자 삭제 (인증 필요) - 본인 계정 삭제
router.delete('/profile', authenticateToken, userController.deleteMyAccount);

// 로그아웃
router.post('/logout', authenticateToken, (req, res) => {
  console.log('🚪 백엔드 로그아웃 시작');
  console.log('🍪 로그아웃 전 쿠키:', req.headers.cookie);
  
  // 모든 가능한 옵션으로 쿠키 삭제
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  };
  
  // 기본 쿠키 삭제
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('isLoggedIn', cookieOptions);
  res.clearCookie('username', cookieOptions);
  
  // 도메인별 쿠키 삭제
  res.clearCookie('accessToken', { ...cookieOptions, domain: 'localhost' });
  res.clearCookie('isLoggedIn', { ...cookieOptions, domain: 'localhost' });
  res.clearCookie('username', { ...cookieOptions, domain: 'localhost' });
  
  res.clearCookie('accessToken', { ...cookieOptions, domain: '.localhost' });
  res.clearCookie('isLoggedIn', { ...cookieOptions, domain: '.localhost' });
  res.clearCookie('username', { ...cookieOptions, domain: '.localhost' });
  
  // 경로별 쿠키 삭제
  res.clearCookie('accessToken', { ...cookieOptions, path: '/' });
  res.clearCookie('isLoggedIn', { ...cookieOptions, path: '/' });
  res.clearCookie('username', { ...cookieOptions, path: '/' });
  
  console.log('🍪 백엔드 로그아웃: 모든 쿠키 삭제 완료');
  
  res.json({
    success: true,
    message: '로그아웃이 완료되었습니다.'
  });
});

// 토큰 검증
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: '유효한 토큰입니다.',
    user: req.user
  });
});

export default router;