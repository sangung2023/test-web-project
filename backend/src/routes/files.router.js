import express from 'express';
import { FileController } from '../controllers/FileController.js';

const router = express.Router();
const fileController = new FileController();

// uploads 폴더 통계 조회
router.get('/stats', fileController.getUploadsStats);

// 고아 파일 정리
router.post('/cleanup', fileController.cleanupOrphanFiles);

export default router;
