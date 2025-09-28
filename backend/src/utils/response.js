// API 응답 유틸리티 함수들

export const successResponse = (res, data, message = '성공', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message = '오류가 발생했습니다.', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: '입력 데이터가 유효하지 않습니다.',
    errors
  });
};

export const notFoundResponse = (res, message = '요청한 리소스를 찾을 수 없습니다.') => {
  return res.status(404).json({
    success: false,
    message
  });
};

export const unauthorizedResponse = (res, message = '인증이 필요합니다.') => {
  return res.status(401).json({
    success: false,
    message
  });
};

export const forbiddenResponse = (res, message = '권한이 없습니다.') => {
  return res.status(403).json({
    success: false,
    message
  });
};
