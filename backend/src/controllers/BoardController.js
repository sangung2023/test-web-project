import { BoardService } from '../services/BoardService.js';
import { AppError } from '../exceptions/AppError.js';
import { uploadToFirebase } from '../middlewares/firebaseUpload.js';

export class BoardController {
  constructor() {
    this.boardService = new BoardService();
  }

  // 게시글 생성
  createBoard = async (req, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      // 프론트엔드에서 이미 업로드된 이미지 정보를 사용
      const boardData = {
        ...req.body,
        // 이미지 정보는 프론트엔드에서 전송됨
      };

      const result = await this.boardService.createBoard(boardData, userId);
      
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 게시글 목록 조회
  getBoards = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await this.boardService.getBoards(page, limit);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 게시글 상세 조회
  getBoardById = async (req, res) => {
    try {
      const { boardId } = req.params;
      const result = await this.boardService.getBoardById(parseInt(boardId));
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 게시글 수정
  updateBoard = async (req, res) => {
    try {
      const { boardId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const result = await this.boardService.updateBoard(parseInt(boardId), req.body, userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 게시글 삭제
  deleteBoard = async (req, res) => {
    try {
      const { boardId } = req.params;
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const result = await this.boardService.deleteBoard(parseInt(boardId), userId);
      
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  // 에러 처리
  handleError = (error, res) => {
    console.error('BoardController Error:', error);

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
