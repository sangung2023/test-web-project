// API 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const API_ENDPOINTS = {
  // 사용자 관련
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users/register`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // 게시판 관련
  BOARDS: `${API_BASE_URL}/api/boards`,
  
  // 지원 관련
  SUPPORTS: `${API_BASE_URL}/api/supports`,
};

export default API_BASE_URL;
