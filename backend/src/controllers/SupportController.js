import { SupportService } from '../services/SupportService.js';
import { AppError } from '../exceptions/AppError.js';
import { uploadToFirebase } from '../middlewares/firebaseUpload.js';

export class SupportController {
  constructor() {
    this.supportService = new SupportService();
  }

  // 문의 생성
  createSupport = async (req, res) => {
    try {
      console.log('=== 문의 생성 요청 시작 ===');
      console.log('요청 헤더:', req.headers);
      console.log('요청 body:', req.body);
      console.log('파일 정보:', req.file);
      console.log('사용자 정보:', req.user);
      
      const userId = req.user?.userId;
      if (!userId) {
        console.log('인증 실패: userId 없음');
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 프론트엔드에서 이미 업로드된 파일 정보를 사용
      const supportData = {
        category: req.body.category,
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        subject: req.body.subject,
        content: req.body.content,
        file: req.body.file,
        fileName: req.body.fileName,
        originalFileName: req.body.originalFileName
      };

      console.log('추출된 데이터:', supportData);
      console.log('사용자 ID:', userId);

      const result = await this.supportService.createSupport(supportData, userId);
      
      console.log('문의 생성 성공:', result);
      res.status(201).json(result);
    } catch (error) {
      console.error('=== 문의 생성 오류 ===');
      console.error('오류 타입:', error.constructor.name);
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      this.handleError(error, res);
    }
  };

  // 문의 목록 조회
  getSupports = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }
      
      const result = await this.supportService.getSupports(page, limit, userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 문의 상세 조회
  getSupportById = async (req, res) => {
    try {
      const { supportId } = req.params;
      const userId = req.user?.userId;
      
      const result = await this.supportService.getSupportById(parseInt(supportId), userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 문의 수정
  updateSupport = async (req, res) => {
    try {
      const { supportId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const result = await this.supportService.updateSupport(parseInt(supportId), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 문의 삭제
  deleteSupport = async (req, res) => {
    try {
      const { supportId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const result = await this.supportService.deleteSupport(parseInt(supportId), userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 에러 처리
  handleError = (error, res) => {
    console.error('SupportController Error:', error);
    console.error('Error stack:', error.stack);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        status: error.status
      });
    }

    // 데이터베이스 연결 오류
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다.',
        status: 'error'
      });
    }

    // Prisma 오류
    if (error.code && error.code.startsWith('P')) {
      console.error('Prisma Error:', error);
      return res.status(500).json({
        success: false,
        message: '데이터베이스 오류가 발생했습니다.',
        status: 'error'
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.',
      status: 'error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  };
}
