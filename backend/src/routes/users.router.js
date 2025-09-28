import express from 'express';
import UserService from '../models/User.js';
import { generateToken, authenticateToken, requireOwnership } from '../middlewares/auth.js';

const router = express.Router();

// 회원가입 API
router.post('/user/signup', async (req, res) => {
  try {
    const { email, password, repassword, name, birthday } = req.body;

    // 입력 데이터 유효성 검사
    if (!email || !password || !repassword || !name || !birthday) {
      return res.status(400).json({
        success: false,
        message: '모든 필드를 입력해주세요.'
      });
    }

    // 비밀번호 확인
    if (password !== repassword) {
      return res.status(400).json({
        success: false,
        message: '비밀번호가 일치하지 않습니다.'
      });
    }

    // 비밀번호 길이 검사
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    // 중복 사용자 확인
    const existingUser = await UserService.findDuplicate(email, name);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 존재하는 이메일 또는 이름입니다.'
      });
    }

    // 새 사용자 생성
    const newUser = await UserService.create({
      name,
      email,
      password,
      birthday
    });

    res.status(201).json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다.',
      user: UserService.sanitizeUser(newUser)
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그인 API
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 데이터 유효성 검사
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.'
      });
    }

    // 사용자 찾기
    const user = await UserService.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await UserService.checkPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.userId);

    res.json({
      success: true,
      message: '로그인이 성공했습니다.',
      user: UserService.sanitizeUser(user),
      token
    });

  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 목록 조회 (개발용)
router.get('/', async (req, res) => {
  try {
    const users = await UserService.findAll();

    res.json({
      success: true,
      users: users,
      count: users.length
    });
  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 프로필 조회 (인증 필요)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.getUserWithAllData(req.user.userId);
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 사용자 조회 (인증 필요)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserService.getUserWithAllData(parseInt(userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('사용자 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 로그아웃 (토큰 무효화는 클라이언트에서 처리)
router.post('/logout', authenticateToken, (req, res) => {
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
