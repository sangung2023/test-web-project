// Support DTO 클래스들
export class CreateSupportDTO {
  constructor(data) {
    this.userId = data.userId;
    this.title = data.subject || data.title; // 프론트엔드에서 subject로 보내므로 매핑
    this.category = this.mapCategory(data.category); // 한글 카테고리를 ENUM으로 변환
    this.content = data.content;
    this.file = data.file;
  }

  mapCategory(koreanCategory) {
    const categoryMap = {
      '프로젝트 관련 질문': 'PROJECT',
      '기타 질문': 'ETC'
    };
    return categoryMap[koreanCategory] || 'ETC';
  }

  validate() {
    const errors = [];
    
    if (!this.userId) {
      errors.push('사용자 ID는 필수입니다.');
    }
    
    if (!this.title || this.title.trim().length === 0) {
      errors.push('제목은 필수입니다.');
    }
    
    if (!this.category) {
      errors.push('카테고리는 필수입니다.');
    }
    
    if (!this.content || this.content.trim().length === 0) {
      errors.push('내용은 필수입니다.');
    }
    
    if (this.title && this.title.length > 255) {
      errors.push('제목은 255자를 초과할 수 없습니다.');
    }
    
    if (this.category && !['PROJECT', 'ETC'].includes(this.category)) {
      errors.push('유효하지 않은 카테고리입니다.');
    }
    
    return errors;
  }
}

export class UpdateSupportDTO {
  constructor(data) {
    this.title = data.title;
    this.category = data.category;
    this.content = data.content;
    this.file = data.file;
  }

  validate() {
    const errors = [];
    
    if (this.title && this.title.trim().length === 0) {
      errors.push('제목은 비어있을 수 없습니다.');
    }
    
    if (this.content && this.content.trim().length === 0) {
      errors.push('내용은 비어있을 수 없습니다.');
    }
    
    if (this.title && this.title.length > 255) {
      errors.push('제목은 255자를 초과할 수 없습니다.');
    }
    
    if (this.category && !['PROJECT', 'ETC'].includes(this.category)) {
      errors.push('유효하지 않은 카테고리입니다.');
    }
    
    return errors;
  }
}
