import { BoardRepository } from '../repositories/BoardRepository.js';
import { CreateBoardDTO, UpdateBoardDTO } from '../dtos/BoardDTO.js';
import { AppError, ValidationError, NotFoundError, AuthorizationError } from '../exceptions/AppError.js';
import { FileUtils } from '../utils/fileUtils.js';

export class BoardService {
  constructor() {
    this.boardRepository = new BoardRepository();
  }

  // 게시글 생성
  async createBoard(boardData, userId) {
    try {
      const createBoardDTO = new CreateBoardDTO({ ...boardData, userId });
      const validationErrors = createBoardDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const board = await this.boardRepository.create(createBoardDTO);

      return {
        success: true,
        data: {
          boardId: board.boardId,
          userId: board.userId,
          title: board.title,
          content: board.content,
          image: board.image,
          createdAt: board.createdAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('게시글 생성 중 오류가 발생했습니다.', 500);
    }
  }

  // 게시글 목록 조회
  async getBoards(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const boards = await this.boardRepository.findAll(offset, limit);
      const totalCount = await this.boardRepository.count();

      return {
        success: true,
        data: {
          boards: boards.map(board => ({
            boardId: board.boardId,
            userId: board.userId,
            title: board.title,
            content: board.content,
            image: board.image,
            createdAt: board.createdAt,
            user: board.user ? {
              name: board.user.name,
              email: board.user.email
            } : null
          })),
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('게시글 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }

  // 게시글 상세 조회
  async getBoardById(boardId) {
    try {
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new NotFoundError('게시글을 찾을 수 없습니다.');
      }

      return {
        success: true,
        data: {
          boardId: board.boardId,
          userId: board.userId,
          title: board.title,
          content: board.content,
          image: board.image,
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
          user: board.user ? {
            name: board.user.name,
            email: board.user.email
          } : null
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('게시글 조회 중 오류가 발생했습니다.', 500);
    }
  }

  // 게시글 수정
  async updateBoard(boardId, updateData, userId) {
    try {
      const updateBoardDTO = new UpdateBoardDTO(updateData);
      const validationErrors = updateBoardDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        throw new NotFoundError('게시글을 찾을 수 없습니다.');
      }

      // 작성자 확인
      if (board.userId !== userId) {
        throw new AuthorizationError('본인의 게시글만 수정할 수 있습니다.');
      }

      const updatedBoard = await this.boardRepository.update(boardId, updateBoardDTO);

      return {
        success: true,
        data: {
          boardId: updatedBoard.boardId,
          userId: updatedBoard.userId,
          title: updatedBoard.title,
          content: updatedBoard.content,
          image: updatedBoard.image,
          updatedAt: updatedBoard.updatedAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('게시글 수정 중 오류가 발생했습니다.', 500);
    }
  }

  // 게시글 삭제
  async deleteBoard(boardId, userId) {
    try {
      console.log(`🗑️ 게시글 ${boardId} 삭제 요청 시작 - 사용자: ${userId}`);
      
      const board = await this.boardRepository.findById(boardId);
      if (!board) {
        console.log(`❌ 게시글 ${boardId}을 찾을 수 없습니다.`);
        throw new NotFoundError('게시글을 찾을 수 없습니다.');
      }

      console.log(`📝 게시글 정보:`, {
        boardId: board.boardId,
        title: board.title,
        userId: board.userId,
        image: board.image,
        imageName: board.imageName,
        originalImageName: board.originalImageName
      });

      // 작성자 확인
      if (board.userId !== userId) {
        console.log(`❌ 권한 없음: 게시글 작성자(${board.userId}) != 요청자(${userId})`);
        throw new AuthorizationError('본인의 게시글만 삭제할 수 있습니다.');
      }

      // 이미지 파일 삭제 (데이터베이스 삭제 전에 실행)
      console.log(`🗑️ 게시글 ${boardId} 이미지 파일 삭제 시작...`);
      const fileDeleted = await FileUtils.deleteBoardImages(board);
      
      if (fileDeleted) {
        console.log(`✅ 이미지 파일 삭제 완료`);
      } else {
        console.warn(`⚠️ 일부 이미지 파일 삭제 실패 - 데이터베이스 삭제는 계속 진행`);
      }

      // 데이터베이스에서 게시글 삭제
      console.log(`🗑️ 데이터베이스에서 게시글 ${boardId} 삭제 중...`);
      await this.boardRepository.delete(boardId);
      console.log(`✅ 데이터베이스에서 게시글 ${boardId} 삭제 완료`);

      return {
        success: true,
        message: '게시글이 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      console.error(`❌ 게시글 ${boardId} 삭제 중 오류:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('게시글 삭제 중 오류가 발생했습니다.', 500);
    }
  }
}
