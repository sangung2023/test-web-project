import { SupportCommentService } from '../services/SupportCommentService.js';
import { AppError, ValidationError, AuthorizationError, NotFoundError } from '../exceptions/AppError.js';

export class SupportCommentController {
  constructor() {
    this.supportCommentService = new SupportCommentService();
  }

  handleError(error, res) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof AuthorizationError) {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error instanceof NotFoundError) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error('Unhandled error:', error);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }

  createComment = async (req, res) => {
    try {
      const { supportId, content } = req.body;
      const userId = req.user.userId; // JWT에서 추출된 사용자 ID

      const result = await this.supportCommentService.createComment(supportId, userId, content);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getCommentsBySupportId = async (req, res) => {
    try {
      const { supportId } = req.params;
      const result = await this.supportCommentService.getCommentsBySupportId(parseInt(supportId));
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;

      const result = await this.supportCommentService.updateComment(parseInt(commentId), userId, content);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deleteComment = async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.userId;

      const result = await this.supportCommentService.deleteComment(parseInt(commentId), userId);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
