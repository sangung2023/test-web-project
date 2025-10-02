import { SupportRepository } from '../repositories/SupportRepository.js';
import { CreateSupportDTO, UpdateSupportDTO } from '../dtos/SupportDTO.js';
import { AppError, ValidationError, NotFoundError, AuthorizationError } from '../exceptions/AppError.js';

export class SupportService {
  constructor() {
    this.supportRepository = new SupportRepository();
  }

  // ENUM 카테고리를 한글로 변환
  mapCategoryToKorean(category) {
    const categoryMap = {
      'PROJECT': '프로젝트 관련 질문',
      'ETC': '기타 질문'
    };
    return categoryMap[category] || '기타 질문';
  }

  // 문의 생성
  async createSupport(supportData, userId) {
    try {
      const createSupportDTO = new CreateSupportDTO({ ...supportData, userId });
      const validationErrors = createSupportDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const support = await this.supportRepository.create(createSupportDTO);

      return {
        success: true,
        data: {
          supportId: support.supportId,
          userId: support.userId,
          title: support.title,
          category: this.mapCategoryToKorean(support.category),
          content: support.content,
          file: support.file,
          createdAt: support.createdAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('문의 생성 중 오류가 발생했습니다.', 500);
    }
  }

  // 문의 목록 조회
  async getSupports(page = 1, limit = 10, userId = null) {
    try {
      const offset = (page - 1) * limit;
      const supports = await this.supportRepository.findAll(offset, limit, userId);
      const totalCount = await this.supportRepository.count(userId);

      return {
        success: true,
        data: {
          supports: supports.map(support => ({
            supportId: support.supportId,
            userId: support.userId,
            title: support.title,
            category: this.mapCategoryToKorean(support.category),
            content: support.content,
            file: support.file,
            createdAt: support.createdAt,
            user: support.user ? {
              name: support.user.name,
              email: support.user.email
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
      throw new AppError('문의 목록 조회 중 오류가 발생했습니다.', 500);
    }
  }

  // 문의 상세 조회
  async getSupportById(supportId, userId = null) {
    try {
      const support = await this.supportRepository.findById(supportId);
      if (!support) {
        throw new NotFoundError('문의를 찾을 수 없습니다.');
      }

      // 본인 문의만 조회 가능
      if (userId && support.userId !== userId) {
        throw new AuthorizationError('본인의 문의만 조회할 수 있습니다.');
      }

      return {
        success: true,
        data: {
          supportId: support.supportId,
          userId: support.userId,
          title: support.title,
          category: this.mapCategoryToKorean(support.category),
          content: support.content,
          file: support.file,
          createdAt: support.createdAt,
          updatedAt: support.updatedAt,
          user: support.user ? {
            name: support.user.name,
            email: support.user.email
          } : null
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('문의 조회 중 오류가 발생했습니다.', 500);
    }
  }

  // 문의 수정
  async updateSupport(supportId, updateData, userId) {
    try {
      const updateSupportDTO = new UpdateSupportDTO(updateData);
      const validationErrors = updateSupportDTO.validate();
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const support = await this.supportRepository.findById(supportId);
      if (!support) {
        throw new NotFoundError('문의를 찾을 수 없습니다.');
      }

      // 작성자 확인
      if (support.userId !== userId) {
        throw new AuthorizationError('본인의 문의만 수정할 수 있습니다.');
      }

      const updatedSupport = await this.supportRepository.update(supportId, updateSupportDTO);

      return {
        success: true,
        data: {
          supportId: updatedSupport.supportId,
          userId: updatedSupport.userId,
          title: updatedSupport.title,
          category: this.mapCategoryToKorean(updatedSupport.category),
          content: updatedSupport.content,
          file: updatedSupport.file,
          updatedAt: updatedSupport.updatedAt
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('문의 수정 중 오류가 발생했습니다.', 500);
    }
  }

  // 문의 삭제
  async deleteSupport(supportId, userId) {
    try {
      const support = await this.supportRepository.findById(supportId);
      if (!support) {
        throw new NotFoundError('문의를 찾을 수 없습니다.');
      }

      // 작성자 확인
      if (support.userId !== userId) {
        throw new AuthorizationError('본인의 문의만 삭제할 수 있습니다.');
      }

      await this.supportRepository.delete(supportId);

      return {
        success: true,
        message: '문의가 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('문의 삭제 중 오류가 발생했습니다.', 500);
    }
  }
}
