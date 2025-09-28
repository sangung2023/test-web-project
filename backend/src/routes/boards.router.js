import express from 'express';
import BoardService from '../models/Board.js';
import { authenticateToken, requireOwnership } from '../middlewares/auth.js';

const router = express.Router();

// 모든 게시물 조회
router.get('/', async (req, res) => {
  try {
    const boards = await BoardService.findAll();
    
    res.json({
      success: true,
      boards: boards,
      count: boards.length
    });
  } catch (error) {
    console.error('게시물 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 게시물 조회
router.get('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await BoardService.findById(parseInt(boardId));
    
    if (!board) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      board: board
    });
  } catch (error) {
    console.error('게시물 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 게시물 생성 (인증 필요)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용은 필수입니다.'
      });
    }

    const board = await BoardService.create({
      userId,
      title,
      content,
      image
    });

    res.status(201).json({
      success: true,
      message: '게시물이 성공적으로 생성되었습니다.',
      board: board
    });
  } catch (error) {
    console.error('게시물 생성 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 게시물 수정 (인증 필요)
router.put('/:boardId', authenticateToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, content, image } = req.body;
    const userId = req.user.userId;

    // 게시물 존재 확인
    const existingBoard = await BoardService.findById(parseInt(boardId));
    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (existingBoard.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '본인의 게시물만 수정할 수 있습니다.'
      });
    }

    const updatedBoard = await BoardService.update(parseInt(boardId), {
      title,
      content,
      image
    });

    res.json({
      success: true,
      message: '게시물이 성공적으로 수정되었습니다.',
      board: updatedBoard
    });
  } catch (error) {
    console.error('게시물 수정 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 게시물 삭제 (인증 필요)
router.delete('/:boardId', authenticateToken, async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    // 게시물 존재 확인
    const existingBoard = await BoardService.findById(parseInt(boardId));
    if (!existingBoard) {
      return res.status(404).json({
        success: false,
        message: '게시물을 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (existingBoard.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '본인의 게시물만 삭제할 수 있습니다.'
      });
    }

    await BoardService.delete(parseInt(boardId));

    res.json({
      success: true,
      message: '게시물이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('게시물 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 게시물 검색
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const boards = await BoardService.search(keyword);

    res.json({
      success: true,
      boards: boards,
      count: boards.length
    });
  } catch (error) {
    console.error('게시물 검색 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자별 게시물 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const boards = await BoardService.findByUserId(parseInt(userId));

    res.json({
      success: true,
      boards: boards,
      count: boards.length
    });
  } catch (error) {
    console.error('사용자별 게시물 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;
