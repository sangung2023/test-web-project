import React, { useState } from 'react';
import Header from './Header.tsx';
import './SignupPage.css';

interface SignupPageProps {
  onBackClick?: () => void;
  onSignupSuccess?: () => void;
  onLogoClick?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBackClick, onSignupSuccess, onLogoClick }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: ''
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
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 필드 검증
    if (!formData.username || !formData.password || !formData.name || !formData.birthDate) {
      setErrorMessage('모든 필드를 입력해주세요.');
      return;
    }

    // 회원가입 성공 (실제로는 서버에 데이터 전송)
    console.log('Signup data:', formData);
    setErrorMessage('');
    
    if (onSignupSuccess) {
      onSignupSuccess();
    }
  };

  const handleBackToHome = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  return (
    <div className="signup-page">
      <Header onLogoClick={onLogoClick} />
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <img 
              src="https://via.placeholder.com/60x60/FF6B6B/FFFFFF?text=🐉" 
              alt="드래곤 로고" 
              className="signup-logo"
            />
            <h1>회원가입</h1>
          </div>
          
          <form className="signup-form" onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">생년월일</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            
            <button type="submit" className="signup-button">
              회원가입
            </button>
            
            <div className="login-link">
              <p>이미 계정이 있으신가요? <button type="button" className="link-button" onClick={() => onBackClick?.()}>로그인</button></p>
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

export default SignupPage;
