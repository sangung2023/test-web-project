import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './MainPage.tsx';
import LoginPage from './LoginPage.tsx';
import SignupPage from './SignupPage.tsx';
import MyPage from './MyPage.tsx';
import BoardPage from './BoardPage.tsx';
import { isLoggedIn, clearAllAuthCookies, getAuthHeaders } from './utils/cookieUtils.js';
import './App.css';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    const checkLoginStatus = () => {
      // cookieUtils의 isLoggedIn 함수 사용
      const loginStatus = isLoggedIn();
      
      console.log('🔍 App 로그인 상태 확인:', {
        loginStatus,
        allCookies: document.cookie
      });
      
      setIsUserLoggedIn(loginStatus);
    };
    
    checkLoginStatus();
  }, []);

  const handleLoginSuccess = () => {
    console.log('✅ 로그인 성공, 상태 업데이트');
    // 로그인 성공 후 쿠키에서 다시 확인
    const loginStatus = isLoggedIn();
    
    console.log('🔍 로그인 성공 후 상태 재확인:', {
      loginStatus,
      allCookies: document.cookie
    });
    
    setIsUserLoggedIn(loginStatus);
  };

  const handleSignupSuccess = () => {
    // 회원가입 성공 시 로그인 페이지로 리다이렉트는 컴포넌트에서 처리
  };

  const handleLogoClick = () => {
    // 로고 클릭 시 홈으로 이동 (React Router가 처리)
  };

  const handleLogout = async () => {
    console.log('🚪 로그아웃 시작');
    console.log('🍪 로그아웃 전 쿠키:', document.cookie);
    
    try {
      // 백엔드 로그아웃 API 호출
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 백엔드 로그아웃 성공:', data);
      } else {
        console.warn('⚠️ 백엔드 로그아웃 실패, 프론트엔드에서만 처리');
      }
    } catch (error) {
      console.warn('⚠️ 백엔드 로그아웃 API 호출 실패:', error);
    }
    
    // 프론트엔드에서도 쿠키 삭제
    clearAllAuthCookies();
    
    // 추가적인 강제 삭제
    const authCookies = ['isLoggedIn', 'username', 'accessToken'];
    authCookies.forEach(cookieName => {
      // 모든 가능한 도메인과 경로로 삭제
      const domains = ['', 'localhost', '.localhost', '127.0.0.1', '.127.0.0.1'];
      const paths = ['/', '/;path=/'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          const domainStr = domain ? `;domain=${domain}` : '';
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}${domainStr}`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}${domainStr};SameSite=Lax`;
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path}${domainStr};SameSite=Strict`;
        });
      });
      
      // 빈 값으로 덮어쓰기
      document.cookie = `${cookieName}=;path=/`;
      document.cookie = `${cookieName}=;path=/;domain=localhost`;
      document.cookie = `${cookieName}=;path=/;domain=.localhost`;
    });
    
    // localStorage 강제 삭제
    authCookies.forEach(cookieName => {
      localStorage.removeItem(cookieName);
    });
    
    // 삭제 확인
    setTimeout(() => {
      console.log('🍪 로그아웃 후 쿠키:', document.cookie);
      console.log('💾 localStorage 상태:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        username: localStorage.getItem('username'),
        accessToken: localStorage.getItem('accessToken')
      });
    }, 300);
    
    setIsUserLoggedIn(false);
    // 로그아웃 후 페이지 새로고침
    window.location.reload();
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <MainPage 
                isLoggedIn={isUserLoggedIn}
                onLogout={handleLogout}
                onLogoClick={handleLogoClick}
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                onLogoClick={handleLogoClick}
              />
            } 
          />
          <Route 
            path="/signup" 
            element={
              <SignupPage 
                onSignupSuccess={handleSignupSuccess}
                onLogoClick={handleLogoClick}
              />
            } 
          />
          <Route 
            path="/mypage" 
            element={
              <MyPage 
                isLoggedIn={isUserLoggedIn}
                onLogout={handleLogout}
                onLogoClick={handleLogoClick}
              />
            } 
          />
          <Route 
            path="/board" 
            element={
              <BoardPage 
                isLoggedIn={isUserLoggedIn}
                onLogout={handleLogout}
                onLogoClick={handleLogoClick}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
