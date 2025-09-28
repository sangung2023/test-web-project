import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { setCookie } from './utils/cookieUtils.js';
import './LoginPage.css';

interface LoginPageProps {
  onBackClick?: () => void;
  onLoginSuccess?: () => void;
  onLogoClick?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onLogoClick }) => {
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 로딩 상태 표시
    setErrorMessage('');
    
    try {
      console.log('로그인 시도:', { email: formData.username, password: formData.password });
      
      // 백엔드 API 호출 (쿠키 자동 전송)
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        credentials: 'include', // 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.username, // username을 email로 사용
          password: formData.password
        })
      });

      console.log('응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('로그인 응답:', data); // 디버깅용 로그

      if (data.success) {
        // 로그인 성공 - JWT 토큰 저장
        console.log('저장할 토큰:', data.accessToken); // 디버깅용 로그
        console.log('저장할 사용자:', data.user); // 디버깅용 로그
        
        // 쿠키 저장
        setCookie('isLoggedIn', 'true', 7);
        setCookie('username', data.user.name, 7);
        setCookie('accessToken', data.accessToken, 7);
        
        // 저장 확인
        console.log('쿠키 저장 완료, 확인:', {
          isLoggedIn: document.cookie.includes('isLoggedIn=true'),
          username: document.cookie.includes('username='),
          accessToken: document.cookie.includes('accessToken=')
        });
        
        setErrorMessage('');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        // 로그인 성공 후 홈으로 이동하고 페이지 새로고침
        navigate('/');
        window.location.reload();
      } else {
        // 로그인 실패
        setErrorMessage(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      setErrorMessage('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
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
              <p>계정이 없으신가요? <button type="button" className="link-button" onClick={() => navigate('/signup')}>회원가입</button></p>
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
