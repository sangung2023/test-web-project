import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './MainPage.tsx';
import LoginPage from './LoginPage.tsx';
import SignupPage from './SignupPage.tsx';
import { isLoggedIn } from './utils/cookieUtils.js';
import './App.css';

function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    setIsUserLoggedIn(isLoggedIn());
  }, []);

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
  };

  const handleSignupSuccess = () => {
    // 회원가입 성공 시 로그인 페이지로 리다이렉트는 컴포넌트에서 처리
  };

  const handleLogoClick = () => {
    // 로고 클릭 시 홈으로 이동 (React Router가 처리)
  };

  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = 'isLoggedIn=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
