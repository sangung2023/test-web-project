// 커스텀 에러 클래스
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 비즈니스 로직 에러
export class BusinessError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}

// 인증 에러
export class AuthenticationError extends AppError {
  constructor(message = '인증이 필요합니다.') {
    super(message, 401);
  }
}

// 권한 에러
export class AuthorizationError extends AppError {
  constructor(message = '권한이 없습니다.') {
    super(message, 403);
  }
}

// 리소스 없음 에러
export class NotFoundError extends AppError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.') {
    super(message, 404);
  }
}

// 유효성 검사 에러
export class ValidationError extends AppError {
  constructor(message = '입력 데이터가 유효하지 않습니다.') {
    super(message, 400);
  }
}

// 데이터베이스 에러
export class DatabaseError extends AppError {
  constructor(message = '데이터베이스 오류가 발생했습니다.') {
    super(message, 500);
  }
}
