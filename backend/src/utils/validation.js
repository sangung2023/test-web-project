// 유효성 검사 유틸리티 함수들

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName}은(는) 필수입니다.`;
  }
  return null;
};

export const validateLength = (value, minLength, maxLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`;
  }
  if (value && value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자를 초과할 수 없습니다.`;
  }
  return null;
};

export const validateDate = (dateString, fieldName) => {
  if (!dateString) {
    return `${fieldName}은(는) 필수입니다.`;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName}은(는) 유효한 날짜 형식이어야 합니다.`;
  }
  
  return null;
};

export const validateEnum = (value, allowedValues, fieldName) => {
  if (value && !allowedValues.includes(value)) {
    return `${fieldName}은(는) ${allowedValues.join(', ')} 중 하나여야 합니다.`;
  }
  return null;
};

export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

export const validatePagination = (page, limit) => {
  const errors = [];
  
  if (page && (isNaN(page) || page < 1)) {
    errors.push('페이지 번호는 1 이상의 숫자여야 합니다.');
  }
  
  if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    errors.push('페이지 크기는 1-100 사이의 숫자여야 합니다.');
  }
  
  return errors;
};
