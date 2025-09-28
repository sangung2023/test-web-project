import prisma from '../config/database.js';

// Prisma를 사용한 Support 서비스 클래스
class SupportService {
  // 문의 생성
  static async create(supportData) {
    const { userId, title, category, content, file } = supportData;
    
    return await prisma.support.create({
      data: {
        userId,
        title,
        category,
        content,
        file: file || null
      }
    });
  }

  // 모든 문의 조회 (사용자 정보 포함)
  static async findAll() {
    return await prisma.support.findMany({
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

  // ID로 문의 조회
  static async findById(supportId) {
    return await prisma.support.findUnique({
      where: { supportId },
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

  // 사용자별 문의 조회
  static async findByUserId(userId) {
    return await prisma.support.findMany({
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

  // 카테고리별 문의 조회
  static async findByCategory(category) {
    return await prisma.support.findMany({
      where: { category },
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

  // 문의 수정
  static async update(supportId, updateData) {
    const { title, category, content, file } = updateData;
    
    return await prisma.support.update({
      where: { supportId },
      data: {
        title,
        category,
        content,
        file: file || null
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

  // 문의 삭제
  static async delete(supportId) {
    return await prisma.support.delete({
      where: { supportId }
    });
  }

  // 문의 검색
  static async search(keyword) {
    return await prisma.support.findMany({
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

  // 카테고리별 문의 통계
  static async getCategoryStats() {
    return await prisma.support.groupBy({
      by: ['category'],
      _count: {
        supportId: true
      }
    });
  }
}

export default SupportService;
