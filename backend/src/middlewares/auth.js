import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';

// JWT 토큰 생성
export const generateToken = (userId) => {
  const payload = {
    userId,
    iat: Math.floor(Date.now() / 1000)
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// JWT 토큰 검증
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
  } catch (error) {
    return null;
  }
};

// 인증 미들웨어
export const authenticateToken = async (req, res, next) => {
  try {
    let token = null;
    
    // 1. Authorization 헤더에서 토큰 추출
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // 2. 쿠키에서 토큰 추출 (헤더에 토큰이 없는 경우)
    if (!token) {
      token = req.cookies.accessToken;
      console.log('🍪 쿠키에서 토큰 발견:', token ? '있음' : '없음');
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '액세스 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      });
    }

    // 사용자 정보 조회
    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    console.error('인증 미들웨어 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const userRepository = new UserRepository();
        const user = await userRepository.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('선택적 인증 미들웨어 에러:', error);
    next(); // 에러가 있어도 계속 진행
  }
};

// 관리자 권한 확인 미들웨어
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  // 관리자 권한 확인 (예: 특정 이메일 도메인 또는 role 필드)
  const isAdmin = req.user.email.includes('@admin.') || req.user.role === 'admin';
  
  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: '관리자 권한이 필요합니다.'
    });
  }

  next();
};

// 본인 데이터 접근 확인 미들웨어
export const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  const requestedUserId = parseInt(req.params.userId || req.params.id);
  const currentUserId = req.user.userId;

  if (requestedUserId !== currentUserId) {
    return res.status(403).json({
      success: false,
      message: '본인의 데이터만 접근할 수 있습니다.'
    });
  }

  next();
};

// 토큰 갱신 미들웨어
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '리프레시 토큰이 필요합니다.'
      });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: '유효하지 않은 리프레시 토큰입니다.'
      });
    }

    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 새로운 액세스 토큰 생성
    const newAccessToken = generateToken(user.userId);
    
    res.json({
      success: true,
      message: '토큰이 갱신되었습니다.',
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('토큰 갱신 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};
