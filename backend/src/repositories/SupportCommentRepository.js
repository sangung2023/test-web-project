import prisma from '../config/database.js';
import { AppError } from '../exceptions/AppError.js';

export class SupportCommentRepository {
  async create(commentData) {
    const { supportId, userId, content } = commentData;
    try {
      return await prisma.supportComment.create({
        data: {
          supportId,
          userId,
          content
        },
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      throw new AppError('댓글 생성 중 데이터베이스 오류가 발생했습니다.', 500);
    }
  }

  async findById(commentId) {
    try {
      return await prisma.supportComment.findUnique({
        where: { commentId },
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
              role: true
            }
          },
          support: true
        }
      });
    } catch (error) {
      throw new AppError('댓글 조회 중 데이터베이스 오류가 발생했습니다.', 500);
    }
  }

  async findBySupportId(supportId) {
    try {
      return await prisma.supportComment.findMany({
        where: { supportId },
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
      });
    } catch (error) {
      throw new AppError('문의에 대한 댓글 조회 중 데이터베이스 오류가 발생했습니다.', 500);
    }
  }

  async update(commentId, updateData) {
    try {
      return await prisma.supportComment.update({
        where: { commentId },
        data: updateData,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      throw new AppError('댓글 수정 중 데이터베이스 오류가 발생했습니다.', 500);
    }
  }

  async delete(commentId) {
    try {
      return await prisma.supportComment.delete({
        where: { commentId }
      });
    } catch (error) {
      throw new AppError('댓글 삭제 중 데이터베이스 오류가 발생했습니다.', 500);
    }
  }
}
