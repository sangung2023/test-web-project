import express from 'express';
import SupportService from '../models/Support.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 모든 문의 조회 (관리자만)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const supports = await SupportService.findAll();
    
    res.json({
      success: true,
      supports: supports,
      count: supports.length
    });
  } catch (error) {
    console.error('문의 목록 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 문의 조회
router.get('/:supportId', authenticateToken, async (req, res) => {
  try {
    const { supportId } = req.params;
    const support = await SupportService.findById(parseInt(supportId));
    
    if (!support) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    // 본인 문의이거나 관리자인지 확인
    const isOwner = support.userId === req.user.userId;
    const isAdmin = req.user.email.includes('@admin.') || req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '본인의 문의만 조회할 수 있습니다.'
      });
    }

    res.json({
      success: true,
      support: support
    });
  } catch (error) {
    console.error('문의 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 문의 생성 (인증 필요)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, category, content, file } = req.body;
    const userId = req.user.userId;

    if (!title || !category || !content) {
      return res.status(400).json({
        success: false,
        message: '제목, 카테고리, 내용은 필수입니다.'
      });
    }

    // 유효한 카테고리인지 확인
    const validCategories = ['PROJECT', 'ETC'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 카테고리입니다.'
      });
    }

    const support = await SupportService.create({
      userId,
      title,
      category,
      content,
      file
    });

    res.status(201).json({
      success: true,
      message: '문의가 성공적으로 생성되었습니다.',
      support: support
    });
  } catch (error) {
    console.error('문의 생성 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 문의 수정 (본인만)
router.put('/:supportId', authenticateToken, async (req, res) => {
  try {
    const { supportId } = req.params;
    const { title, category, content, file } = req.body;
    const userId = req.user.userId;

    // 문의 존재 확인
    const existingSupport = await SupportService.findById(parseInt(supportId));
    if (!existingSupport) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (existingSupport.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '본인의 문의만 수정할 수 있습니다.'
      });
    }

    const updatedSupport = await SupportService.update(parseInt(supportId), {
      title,
      category,
      content,
      file
    });

    res.json({
      success: true,
      message: '문의가 성공적으로 수정되었습니다.',
      support: updatedSupport
    });
  } catch (error) {
    console.error('문의 수정 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 문의 삭제 (본인만)
router.delete('/:supportId', authenticateToken, async (req, res) => {
  try {
    const { supportId } = req.params;
    const userId = req.user.userId;

    // 문의 존재 확인
    const existingSupport = await SupportService.findById(parseInt(supportId));
    if (!existingSupport) {
      return res.status(404).json({
        success: false,
        message: '문의를 찾을 수 없습니다.'
      });
    }

    // 작성자 확인
    if (existingSupport.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '본인의 문의만 삭제할 수 있습니다.'
      });
    }

    await SupportService.delete(parseInt(supportId));

    res.json({
      success: true,
      message: '문의가 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('문의 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 내 문의 조회
router.get('/my/supports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const supports = await SupportService.findByUserId(userId);

    res.json({
      success: true,
      supports: supports,
      count: supports.length
    });
  } catch (error) {
    console.error('내 문의 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 카테고리별 문의 조회
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const supports = await SupportService.findByCategory(category);

    res.json({
      success: true,
      supports: supports,
      count: supports.length
    });
  } catch (error) {
    console.error('카테고리별 문의 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 문의 검색
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const supports = await SupportService.search(keyword);

    res.json({
      success: true,
      supports: supports,
      count: supports.length
    });
  } catch (error) {
    console.error('문의 검색 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 카테고리별 통계 (관리자만)
router.get('/stats/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await SupportService.getCategoryStats();

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('문의 통계 조회 에러:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;
