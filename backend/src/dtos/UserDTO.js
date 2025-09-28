// User DTO 클래스들
export class CreateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.repassword = data.repassword;
    this.birthday = data.birthday;
  }

  validate() {
    const errors = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('이름은 필수입니다.');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('유효한 이메일을 입력해주세요.');
    }
    
    if (!this.password || this.password.length < 6) {
      errors.push('비밀번호는 6자 이상이어야 합니다.');
    }
    
    if (!this.repassword) {
      errors.push('비밀번호 확인은 필수입니다.');
    }
    
    if (this.password && this.repassword && this.password !== this.repassword) {
      errors.push('비밀번호가 일치하지 않습니다.');
    }
    
    if (!this.birthday) {
      errors.push('생년월일은 필수입니다.');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class UpdateUserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.birthday = data.birthday;
  }

  validate() {
    const errors = [];
    
    if (this.name && this.name.trim().length === 0) {
      errors.push('이름은 비어있을 수 없습니다.');
    }
    
    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('유효한 이메일을 입력해주세요.');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class LoginDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
  }

  validate() {
    const errors = [];
    
    if (!this.email) {
      errors.push('이메일은 필수입니다.');
    }
    
    if (!this.password) {
      errors.push('비밀번호는 필수입니다.');
    }
    
    return errors;
  }
}
