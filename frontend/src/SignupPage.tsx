import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import './SignupPage.css';

interface SignupPageProps {
  onBackClick?: () => void;
  onSignupSuccess?: () => void;
  onLogoClick?: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onLogoClick }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    repassword: '',
    name: '',
    birthDate: ''
  });
  
  // 로고 이미지 URL 처리 (개발/배포 환경 대응)
  const getLogoUrl = () => {
    const logoPath = '/uploads/images/logo.png';
    if (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3000'
    )) {
      return `http://localhost:5000${logoPath}`;
    }
    return logoPath;
  };
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
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.repassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 필드 검증
    if (!formData.username || !formData.password || !formData.name || !formData.birthDate) {
      setErrorMessage('모든 필드를 입력해주세요.');
      return;
    }

    try {
      console.log('🚀 회원가입 시도:', formData);
      
      const requestBody = {
        name: formData.name,
        email: formData.username, // username을 email로 사용
        password: formData.password,
        repassword: formData.repassword,
        birthday: formData.birthDate
      };
      
      console.log('📤 전송할 데이터:', requestBody);
      
      // 백엔드 API 호출
      const response = await fetch('/api/users/signup', {
        method: 'POST',
        credentials: 'include', // 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 회원가입 응답 상태:', response.status);
      console.log('📥 응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP 오류:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 회원가입 응답:', data);

      if (data.success) {
        // 회원가입 성공
        setErrorMessage('');
        alert('회원가입이 성공적으로 완료되었습니다!');
        
        if (onSignupSuccess) {
          onSignupSuccess();
        }
        navigate('/login');
        window.location.reload();
      } else {
        // 회원가입 실패
        setErrorMessage(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setErrorMessage('서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="signup-page">
      <Header onLogoClick={onLogoClick} />
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <img 
              src={getLogoUrl()} 
              alt="드래곤 로고" 
              className="signup-logo"
              style={{ border: 'none', outline: 'none', padding: 0, margin: 0, boxShadow: 'none', background: 'transparent' }}
              onError={(e) => {
                console.error('로고 이미지 로드 실패:', e);
              }}
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
              <label htmlFor="repassword">비밀번호 확인</label>
              <input
                type="password"
                id="repassword"
                name="repassword"
                value={formData.repassword}
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
              <p>이미 계정이 있으신가요? <button type="button" className="link-button" onClick={() => navigate('/login')}>로그인</button></p>
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
