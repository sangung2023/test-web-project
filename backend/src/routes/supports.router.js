import express from 'express';
import { SupportController } from '../controllers/SupportController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload, handleMulterError } from '../middlewares/upload.js';

const router = express.Router();
const supportController = new SupportController();

// 문의 생성 (인증 필요, 파일 업로드 지원)
router.post('/', authenticateToken, upload.single('file'), handleMulterError, supportController.createSupport);

// 문의 목록 조회 (인증 필요)
router.get('/', authenticateToken, supportController.getSupports);

// 문의 상세 조회 (인증 필요)
router.get('/:supportId', authenticateToken, supportController.getSupportById);

// 문의 수정 (인증 필요)
router.put('/:supportId', authenticateToken, supportController.updateSupport);

// 문의 삭제 (인증 필요)
router.delete('/:supportId', authenticateToken, supportController.deleteSupport);

export default router;