import { UserService } from '../services/UserService.js';
import { AppError } from '../exceptions/AppError.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  // 사용자 생성
  createUser = async (req, res) => {
    try {
      console.log('📥 회원가입 요청 받음:', req.body);
      
      const result = await this.userService.createUser(req.body);
      
      console.log('✅ 회원가입 성공:', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ 회원가입 오류:', error);
      this.handleError(error, res);
    }
  };

  // 사용자 로그인
  loginUser = async (req, res) => {
    try {
      const result = await this.userService.loginUser(req.body);
      
      if (result.success && result.accessToken) {
        // JWT 토큰을 쿠키에 자동 저장
        const cookieOptions = {
          httpOnly: true, // XSS 공격 방지
          secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
          sameSite: 'lax', // CSRF 공격 방지
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
          path: '/' // 모든 경로에서 접근 가능
        };
        
        res.cookie('accessToken', result.accessToken, cookieOptions);
        res.cookie('isLoggedIn', 'true', cookieOptions);
        res.cookie('username', result.user.name, cookieOptions);
        
        console.log('🍪 로그인 성공: 쿠키에 토큰 저장됨');
      }
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 내 프로필 조회 (인증된 사용자)
  getMyProfile = async (req, res) => {
    try {
      const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
      const result = await this.userService.getUserById(userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 내 정보 수정 (인증된 사용자)
  updateMyProfile = async (req, res) => {
    try {
      const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
      const result = await this.userService.updateUser(userId, req.body);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 내 계정 삭제 (인증된 사용자)
  deleteMyAccount = async (req, res) => {
    try {
      const userId = req.user.userId; // auth 미들웨어에서 설정된 사용자 ID
      const result = await this.userService.deleteUser(userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 에러 처리
  handleError = (error, res) => {
    console.error('UserController Error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        status: error.status
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.',
      status: 'error'
    });
  };
}
