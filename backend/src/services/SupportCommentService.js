import { SupportCommentRepository } from '../repositories/SupportCommentRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AppError, ValidationError, AuthorizationError, NotFoundError } from '../exceptions/AppError.js';

export class SupportCommentService {
  constructor() {
    this.supportCommentRepository = new SupportCommentRepository();
    this.userRepository = new UserRepository();
  }

  async createComment(supportId, userId, content) {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('댓글 내용은 필수입니다.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      throw new AuthorizationError('관리자만 댓글을 작성할 수 있습니다.');
    }

    const comment = await this.supportCommentRepository.create({ supportId, userId, content });
    return { success: true, message: '댓글이 성공적으로 작성되었습니다.', data: comment };
  }

  async getCommentById(commentId) {
    const comment = await this.supportCommentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }
    return { success: true, data: comment };
  }

  async getCommentsBySupportId(supportId) {
    const comments = await this.supportCommentRepository.findBySupportId(supportId);
    return { success: true, data: comments };
  }

  async updateComment(commentId, userId, content) {
    if (!content || content.trim().length === 0) {
      throw new ValidationError('댓글 내용은 필수입니다.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      throw new AuthorizationError('관리자만 댓글을 수정할 수 있습니다.');
    }

    const existingComment = await this.supportCommentRepository.findById(commentId);
    if (!existingComment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }
    if (existingComment.userId !== userId) {
      throw new AuthorizationError('본인이 작성한 댓글만 수정할 수 있습니다.');
    }

    const updatedComment = await this.supportCommentRepository.update(commentId, { content });
    return { success: true, message: '댓글이 성공적으로 수정되었습니다.', data: updatedComment };
  }

  async deleteComment(commentId, userId) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.role !== 'ADMIN') {
      throw new AuthorizationError('관리자만 댓글을 삭제할 수 있습니다.');
    }

    const existingComment = await this.supportCommentRepository.findById(commentId);
    if (!existingComment) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }
    if (existingComment.userId !== userId) {
      throw new AuthorizationError('본인이 작성한 댓글만 삭제할 수 있습니다.');
    }

    await this.supportCommentRepository.delete(commentId);
    return { success: true, message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
