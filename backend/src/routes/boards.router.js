import express from 'express';
import { BoardController } from '../controllers/BoardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();
const boardController = new BoardController();

// 게시글 생성 (인증 필요)
router.post('/', authenticateToken, boardController.createBoard);

// 게시글 목록 조회
router.get('/', boardController.getBoards);

// 게시글 상세 조회
router.get('/:boardId', boardController.getBoardById);

// 게시글 수정 (인증 필요)
router.put('/:boardId', authenticateToken, boardController.updateBoard);

// 게시글 삭제 (인증 필요)
router.delete('/:boardId', authenticateToken, boardController.deleteBoard);

export default router;