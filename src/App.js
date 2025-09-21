import React, { useState, useEffect } from 'react';
import MainPage from './MainPage.tsx';
import LoginPage from './LoginPage.tsx';
import { isLoggedIn, getCookie } from './utils/cookieUtils.js';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('main');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 로그인 상태 확인
    setIsUserLoggedIn(isLoggedIn());
  }, []);

  const navigateToLogin = () => {
    setCurrentPage('login');
  };

  const navigateToMain = () => {
    setCurrentPage('main');
  };

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    setCurrentPage('main');
  };

  const handleLogout = () => {
    // 쿠키 삭제
    document.cookie = 'isLoggedIn=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    // 페이지 새로고침
    window.location.reload();
  };

  return (
    <div className="App">
      {currentPage === 'main' ? (
        <MainPage 
          onLoginClick={navigateToLogin} 
          isLoggedIn={isUserLoggedIn}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage 
          onBackClick={navigateToMain} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export default App;
