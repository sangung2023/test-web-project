import prisma from '../config/database.js';

// Board Repository 클래스
export class BoardRepository {
  // 게시글 생성
  async create(boardData) {
    const { userId, title, content, image } = boardData;
    
    return await prisma.board.create({
      data: {
        userId,
        title,
        content,
        image
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 모든 게시글 조회 (페이지네이션)
  async findAll(offset = 0, limit = 10) {
    return await prisma.board.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 게시글 총 개수
  async count() {
    return await prisma.board.count();
  }

  // ID로 게시글 조회
  async findById(boardId) {
    return await prisma.board.findUnique({
      where: { boardId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 게시글 수정
  async update(boardId, updateData) {
    return await prisma.board.update({
      where: { boardId },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 게시글 삭제
  async delete(boardId) {
    return await prisma.board.delete({
      where: { boardId }
    });
  }
}