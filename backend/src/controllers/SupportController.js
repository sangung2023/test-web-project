import { SupportService } from '../services/SupportService.js';
import { AppError } from '../exceptions/AppError.js';

export class SupportController {
  constructor() {
    this.supportService = new SupportService();
  }

  // 문의 생성
  createSupport = async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const result = await this.supportService.createSupport(req.body, userId);
      
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 문의 목록 조회
  getSupports = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const userId = req.user?.userId;
      
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
