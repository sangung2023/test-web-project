import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, getAccessToken, isLoggedIn } from './utils/cookieUtils.js';
import './InquiryPage.css';

interface InquiryPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const InquiryPage: React.FC<InquiryPageProps> = ({ isLoggedIn: propIsLoggedIn, onLogout, onLogoClick }) => {
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [inquiry, setInquiry] = useState({
    category: '프로젝트 관련 질문',
    name: '',
    mobile: '',
    email: '',
    subject: '',
    content: '',
    file: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 로그인 상태 확인
  React.useEffect(() => {
    const loginStatus = isLoggedIn();
    setUserLoggedIn(loginStatus);
  }, [propIsLoggedIn]);

  // 문의 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userLoggedIn) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('문의 데이터:', inquiry);
      console.log('인증 헤더:', getAuthHeaders());
      
      const formData = new FormData();
      formData.append('category', inquiry.category);
      formData.append('name', inquiry.name);
      formData.append('mobile', inquiry.mobile);
      formData.append('email', inquiry.email);
      formData.append('subject', inquiry.subject);
      formData.append('content', inquiry.content);
      if (inquiry.file) {
        formData.append('file', inquiry.file);
      }

      console.log('FormData 내용:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // FormData는 직접 fetch로 처리
      const token = getAccessToken();
      const headers: any = {
        'Authorization': `Bearer ${token}`
      };
      
      console.log('FormData 직접 전송:', { headers, formData });
      
      const response = await fetch('http://localhost:5000/api/supports', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('문의 제출 실패:', response.status, response.statusText, errorData);
        throw new Error(`문의 제출에 실패했습니다. (${response.status}: ${response.statusText})`);
      }

      const data = await response.json();
      console.log('문의 제출 성공:', data);
      
      // 폼 초기화
      setInquiry({
        category: '프로젝트 관련 질문',
        name: '',
        mobile: '',
        email: '',
        subject: '',
        content: '',
        file: null
      });
      
      alert('문의가 성공적으로 제출되었습니다.');
    } catch (error) {
      console.error('문의 제출 오류:', error);
      setError('문의 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInquiry({ ...inquiry, file: e.target.files[0] });
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
        return;
      }
      
      // 백엔드 로그아웃 API 호출
      try {
        await fetch('http://localhost:5000/api/users/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...getAuthHeaders()
          } as any
        });
      } catch (error) {
        console.warn('백엔드 로그아웃 API 호출 실패:', error);
      }
      
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  return (
    <div className="inquiry-page">
      <Header 
        isLoggedIn={userLoggedIn}
        onLogout={handleLogout}
        onLogoClick={onLogoClick}
      />
      
      <div className="inquiry-container">
        <div className="inquiry-header">
          <h1>📞 고객 문의</h1>
          <p>궁금한 점이 있으시면 언제든 문의해주세요!</p>
        </div>

        <div className="inquiry-content">
          <div className="inquiry-tabs">
            <button 
              className="tab-button active"
              onClick={() => navigate('/inquiry')}
            >
              고객문의
            </button>
            <button 
              className="tab-button"
              onClick={() => navigate('/inquiry-history')}
            >
              문의내역
            </button>
          </div>

          <div className="inquiry-form-container">
            <form className="inquiry-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category">
                  <span className="icon">👤</span>
                  분류
                </label>
                <select
                  id="category"
                  value={inquiry.category}
                  onChange={(e) => setInquiry({ ...inquiry, category: e.target.value })}
                  required
                >
                  <option value="프로젝트 관련 질문">프로젝트 관련 질문</option>
                  <option value="기타 질문">기타 질문</option>
                </select>
              </div>


              <div className="form-group">
                <label htmlFor="name">
                  <span className="icon">🏷️</span>
                  *성명
                </label>
                <input
                  type="text"
                  id="name"
                  value={inquiry.name}
                  onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="mobile">
                  <span className="icon">📱</span>
                  *휴대번호
                </label>
                <div className="mobile-group">
                  <select>
                    <option value="010">010</option>
                    <option value="011">011</option>
                    <option value="016">016</option>
                    <option value="017">017</option>
                    <option value="018">018</option>
                    <option value="019">019</option>
                  </select>
                  <input
                    type="text"
                    placeholder="0000"
                    value={inquiry.mobile.split('-')[1] || ''}
                    onChange={(e) => {
                      const parts = inquiry.mobile.split('-');
                      setInquiry({ ...inquiry, mobile: `${parts[0] || '010'}-${e.target.value}-${parts[2] || ''}` });
                    }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="0000"
                    value={inquiry.mobile.split('-')[2] || ''}
                    onChange={(e) => {
                      const parts = inquiry.mobile.split('-');
                      setInquiry({ ...inquiry, mobile: `${parts[0] || '010'}-${parts[1] || ''}-${e.target.value}` });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="icon">✉️</span>
                  *이메일
                </label>
                <div className="email-group">
                  <input
                    type="text"
                    placeholder="이메일"
                    value={inquiry.email.split('@')[0] || ''}
                    onChange={(e) => {
                      const parts = inquiry.email.split('@');
                      setInquiry({ ...inquiry, email: `${e.target.value}@${parts[1] || ''}` });
                    }}
                    required
                  />
                  <span>@</span>
                  <input
                    type="text"
                    placeholder="도메인"
                    value={inquiry.email.split('@')[1] || ''}
                    onChange={(e) => {
                      const parts = inquiry.email.split('@');
                      setInquiry({ ...inquiry, email: `${parts[0] || ''}@${e.target.value}` });
                    }}
                    required
                  />
                  <select
                    value={inquiry.email.split('@')[1] || '직접입력'}
                    onChange={(e) => {
                      console.log('도메인 선택:', e.target.value);
                      if (e.target.value !== '직접입력') {
                        const parts = inquiry.email.split('@');
                        const newEmail = `${parts[0] || ''}@${e.target.value}`;
                        console.log('새로운 이메일:', newEmail);
                        setInquiry({ ...inquiry, email: newEmail });
                      }
                    }}
                  >
                    <option value="직접입력">직접입력</option>
                    <option value="gmail.com">gmail.com</option>
                    <option value="naver.com">naver.com</option>
                    <option value="daum.net">daum.net</option>
                    <option value="yahoo.com">yahoo.com</option>
                    <option value="outlook.com">outlook.com</option>
                    <option value="hotmail.com">hotmail.com</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">
                  <span className="icon">✏️</span>
                  *제목
                </label>
                <input
                  type="text"
                  id="subject"
                  value={inquiry.subject}
                  onChange={(e) => setInquiry({ ...inquiry, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">
                  <span className="icon">📄</span>
                  *내용
                </label>
                <textarea
                  id="content"
                  value={inquiry.content}
                  onChange={(e) => setInquiry({ ...inquiry, content: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="file">
                  <span className="icon">📁</span>
                  파일첨부
                </label>
                <div className="file-group">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file')?.click()}
                    className="file-button"
                  >
                    파일선택
                  </button>
                  <span className="file-name">
                    {inquiry.file ? inquiry.file.name : '선택된 파일 없음'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '문의 제출'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InquiryPage;
