import React, { useState } from 'react';
import Header from './Header.tsx';
import { setCookie } from './utils/cookieUtils.js';
import './LoginPage.css';

interface LoginPageProps {
  onBackClick?: () => void;
  onLoginSuccess?: () => void;
  onLogoClick?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBackClick, onLoginSuccess, onLogoClick }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 로그인 검증
    if (formData.username === 'ABC' && formData.password === '1234') {
      // 로그인 성공
      setCookie('isLoggedIn', 'true', 7); // 7일간 유지
      setCookie('username', formData.username, 7);
      setErrorMessage('');
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      // 로그인 실패
      setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleBackToHome = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="login-page">
      <Header onLogoClick={onLogoClick} />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img 
              src="https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=🐉" 
              alt="드래곤 로고" 
              className="login-logo"
            />
            <h1>One Step 로그인</h1>
            <p>MCP를 활용한 Suricata Rule 생성 AI</p>
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            <button type="submit" className="login-button">
              로그인
            </button>
            
            <div className="signup-link">
              <p>계정이 없으신가요? <a href="#">회원가입</a></p>
            </div>
          </form>
          
          <button className="back-button" onClick={handleBackToHome}>
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
