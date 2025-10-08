// 쿠키 관리 유틸리티 함수들

export const setCookie = (name, value, days = 7) => {
  try {
    // localStorage도 함께 저장 (백업용)
    localStorage.setItem(name, value);
    
    // 쿠키 저장 - 더 간단한 방식
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // 여러 방식으로 쿠키 저장 시도
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=localhost`;
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.localhost`;
    
    console.log(`🍪 쿠키 저장 시도: ${name}=${value}`);
    console.log(`📅 만료일: ${expires.toUTCString()}`);
    console.log(`🔗 현재 쿠키: ${document.cookie}`);
    
    // 저장 확인
    setTimeout(() => {
      const savedValue = getCookie(name);
      const localStorageValue = localStorage.getItem(name);
      console.log(`✅ 쿠키 저장 확인: ${name}=${savedValue}`);
      console.log(`💾 localStorage 저장 확인: ${name}=${localStorageValue}`);
      
      if (!savedValue) {
        console.error(`❌ 쿠키 저장 실패: ${name}`);
        console.log(`🔍 현재 모든 쿠키: ${document.cookie}`);
      }
    }, 200);
  } catch (error) {
    console.error(`쿠키 저장 실패: ${name}`, error);
  }
};

export const getCookie = (name) => {
  console.log(`🔍 ${name} 찾는 중...`);
  console.log(`📄 현재 쿠키: ${document.cookie}`);
  
  // localStorage에서 먼저 확인
  const localStorageValue = localStorage.getItem(name);
  if (localStorageValue) {
    console.log(`💾 localStorage에서 ${name} 발견: ${localStorageValue}`);
    return localStorageValue;
  }
  
  // 쿠키에서 확인
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  console.log(`🍪 쿠키 배열:`, ca);
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    console.log(`🔍 쿠키 확인 중: "${c}"`);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      console.log(`✅ 쿠키에서 ${name} 발견: ${value}`);
      return value;
    }
  }
  console.log(`❌ ${name}을 찾을 수 없음`);
  return null;
};

export const deleteCookie = (name) => {
  // localStorage에서도 삭제
  localStorage.removeItem(name);
  
  // 여러 방식으로 쿠키 삭제 시도
  const domains = ['', 'localhost', '.localhost'];
  const paths = ['/', '/;path=/'];
  
  domains.forEach(domain => {
    paths.forEach(path => {
      const domainStr = domain ? `;domain=${domain}` : '';
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}${domainStr}`;
    });
  });
  
  console.log(`🍪 ${name} 삭제 완료`);
};

// 모든 로그인 관련 쿠키 삭제
export const clearAllAuthCookies = () => {
  const authCookies = ['isLoggedIn', 'username', 'accessToken'];
  
  console.log('🧹 모든 인증 쿠키 삭제 시작');
  console.log('🍪 삭제 전 쿠키:', document.cookie);
  
  // 모든 가능한 조합으로 쿠키 삭제 시도
  authCookies.forEach(cookieName => {
    // 기본 삭제
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.localhost`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=127.0.0.1`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.127.0.0.1`;
    
    // SameSite 옵션과 함께 삭제
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
    document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=None`;
    
    // 빈 값으로 덮어쓰기
    document.cookie = `${cookieName}=;path=/`;
    document.cookie = `${cookieName}=;path=/;domain=localhost`;
    document.cookie = `${cookieName}=;path=/;domain=.localhost`;
    
    // localStorage에서도 삭제
    localStorage.removeItem(cookieName);
    
    console.log(`🍪 ${cookieName} 삭제 시도 완료`);
  });
  
  // 추가적인 강제 삭제 시도
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (authCookies.includes(cookieName)) {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.localhost`;
    }
  });
  
  setTimeout(() => {
    console.log('🍪 삭제 후 쿠키:', document.cookie);
    console.log('✅ 모든 인증 쿠키 삭제 완료');
    
    // 삭제 확인
    const remainingAuthCookies = authCookies.filter(cookieName => 
      document.cookie.includes(`${cookieName}=`) || 
      localStorage.getItem(cookieName)
    );
    
    if (remainingAuthCookies.length > 0) {
      console.warn('⚠️ 삭제되지 않은 쿠키:', remainingAuthCookies);
    } else {
      console.log('✅ 모든 인증 쿠키가 성공적으로 삭제되었습니다.');
    }
  }, 200);
};

export const isLoggedIn = () => {
  const loginStatus = getCookie('isLoggedIn');
  const hasAccessToken = getCookie('accessToken');
  
  console.log('🔍 로그인 상태 확인:', {
    isLoggedIn: loginStatus,
    hasAccessToken: !!hasAccessToken,
    allCookies: document.cookie
  });
  
  return loginStatus === 'true' && hasAccessToken;
};

export const getAccessToken = () => {
  return getCookie('accessToken');
};

export const getAuthHeaders = (forFormData = false) => {
  const token = getAccessToken();
  const headers = forFormData ? {} : { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};