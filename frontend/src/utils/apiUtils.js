// API 호출 유틸리티 함수들
import { getAuthHeaders, getAccessToken, clearAllAuthCookies } from './cookieUtils.js';

// 토큰 만료 감지 및 자동 로그아웃
const handleTokenExpiration = () => {
  console.log('🔒 토큰이 만료되어 자동 로그아웃 처리합니다.');
  
  // 모든 인증 쿠키 삭제
  clearAllAuthCookies();
  
  // 로그인 페이지로 리다이렉트
  window.location.href = '/login';
  
  // 사용자에게 알림
  alert('세션이 만료되었습니다. 다시 로그인해주세요.');
};

// API 호출 래퍼 함수
export const apiCall = async (url, options = {}) => {
  try {
    // FormData인 경우 Content-Type 헤더를 완전히 제거
    const isFormData = options.body instanceof FormData;
    let headers;
    
    if (isFormData) {
      // FormData일 때는 Authorization만 포함
      const token = getAccessToken();
      headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    } else {
      // 일반 요청일 때는 모든 헤더 포함
      headers = { ...getAuthHeaders(), ...options.headers };
    }
    
    console.log('API 호출 헤더:', headers);
    console.log('FormData 여부:', isFormData);

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers
    });

    // 토큰 만료 감지
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      if (data.code === 'TOKEN_EXPIRED' || data.message?.includes('토큰이 만료')) {
        handleTokenExpiration();
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// GET 요청
export const apiGet = async (url, options = {}) => {
  return apiCall(url, { ...options, method: 'GET' });
};

// POST 요청
export const apiPost = async (url, data, options = {}) => {
  return apiCall(url, {
    ...options,
    method: 'POST',
    body: data instanceof FormData ? data : JSON.stringify(data),
    headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
  });
};

// PUT 요청
export const apiPut = async (url, data, options = {}) => {
  return apiCall(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
};

// DELETE 요청
export const apiDelete = async (url, options = {}) => {
  return apiCall(url, { ...options, method: 'DELETE' });
};
