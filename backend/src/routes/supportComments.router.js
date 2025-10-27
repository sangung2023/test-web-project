import express from 'express';
import { SupportCommentController } from '../controllers/SupportCommentController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();
const supportCommentController = new SupportCommentController();

// 관리자 댓글 생성 (관리자만 가능)
router.post('/', authenticateToken, requireAdmin, supportCommentController.createComment);

// 특정 문의에 대한 댓글 조회 (모두 가능)
router.get('/support/:supportId', supportCommentController.getCommentsBySupportId);

// 관리자 댓글 수정 (관리자만 가능, 본인 댓글만)
router.put('/:commentId', authenticateToken, requireAdmin, supportCommentController.updateComment);

// 관리자 댓글 삭제 (관리자만 가능, 본인 댓글만)
router.delete('/:commentId', authenticateToken, requireAdmin, supportCommentController.deleteComment);

export default router;
