import prisma from '../config/database.js';

// Support Repository 클래스
export class SupportRepository {
  // 문의 생성
  async create(supportData) {
    const { userId, name, mobile, email, title, category, content, file } = supportData;
    
    console.log('SupportRepository.create 호출:', { userId, name, mobile, email, title, category, content, file });
    
    return await prisma.support.create({
      data: {
        userId,
        name,
        mobile,
        email,
        title,
        category,
        content,
        file
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

  // 모든 문의 조회 (페이지네이션, 사용자 필터링)
  async findAll(offset = 0, limit = 10, userId = null) {
    const where = userId ? { userId } : {};
    
    console.log('SupportRepository.findAll 호출:', { offset, limit, userId, where });
    
    const result = await prisma.support.findMany({
      where,
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
        },
        comments: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log('SupportRepository.findAll 결과:', result);
    return result;
  }

  // 문의 총 개수
  async count(userId = null) {
    const where = userId ? { userId } : {};
    return await prisma.support.count({ where });
  }

  // 모든 문의 조회 (페이지네이션, 관리자용)
  async findAllWithPagination(offset = 0, limit = 10) {
    console.log('SupportRepository.findAllWithPagination 호출:', { offset, limit });
    
    const result = await prisma.support.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    console.log('SupportRepository.findAllWithPagination 결과:', result);
    return result;
  }

  // 모든 문의 총 개수 (관리자용)
  async countAll() {
    return await prisma.support.count();
  }

  // ID로 문의 조회
  async findById(supportId) {
    return await prisma.support.findUnique({
      where: { supportId },
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

  // 문의 수정
  async update(supportId, updateData) {
    return await prisma.support.update({
      where: { supportId },
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

  // 문의 삭제
  async delete(supportId) {
    return await prisma.support.delete({
      where: { supportId }
    });
  }
}