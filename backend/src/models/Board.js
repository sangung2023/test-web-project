import prisma from '../config/database.js';

// Prisma를 사용한 Board 서비스 클래스
class BoardService {
  // 게시물 생성
  static async create(boardData) {
    const { userId, title, content, image } = boardData;
    
    return await prisma.board.create({
      data: {
        userId,
        title,
        content,
        image: image || null
      }
    });
  }

  // 모든 게시물 조회 (사용자 정보 포함)
  static async findAll() {
    return await prisma.board.findMany({
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // ID로 게시물 조회
  static async findById(boardId) {
    return await prisma.board.findUnique({
      where: { boardId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 사용자별 게시물 조회
  static async findByUserId(userId) {
    return await prisma.board.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // 게시물 수정
  static async update(boardId, updateData) {
    const { title, content, image } = updateData;
    
    return await prisma.board.update({
      where: { boardId },
      data: {
        title,
        content,
        image: image || null
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  // 게시물 삭제
  static async delete(boardId) {
    return await prisma.board.delete({
      where: { boardId }
    });
  }

  // 게시물 검색
  static async search(keyword) {
    return await prisma.board.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } }
        ]
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export default BoardService;
