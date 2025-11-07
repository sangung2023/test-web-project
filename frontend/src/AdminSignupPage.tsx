import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSignupPage.css';

const AdminSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    repassword: '',
    birthday: '',
    adminKey: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('이름을 입력해주세요.');
    }

    if (!formData.email.trim()) {
      newErrors.push('이메일을 입력해주세요.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('올바른 이메일 형식을 입력해주세요.');
    }

    if (!formData.password) {
      newErrors.push('비밀번호를 입력해주세요.');
    } else if (formData.password.length < 6) {
      newErrors.push('비밀번호는 6자 이상이어야 합니다.');
    }

    if (!formData.repassword) {
      newErrors.push('비밀번호 확인을 입력해주세요.');
    } else if (formData.password !== formData.repassword) {
      newErrors.push('비밀번호가 일치하지 않습니다.');
    }

    if (!formData.birthday) {
      newErrors.push('생년월일을 입력해주세요.');
    }

    if (!formData.adminKey.trim()) {
      newErrors.push('관리자 생성 키를 입력해주세요.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/users/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', response.headers);

      // 응답을 먼저 텍스트로 받기
      const responseText = await response.text();
      console.log('응답 텍스트:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 텍스트:', responseText);
        setErrors(['서버 응답 형식이 올바르지 않습니다. 서버 상태를 확인해주세요.']);
        return;
      }

      if (result.success) {
        alert('관리자 계정이 성공적으로 생성되었습니다!');
        navigate('/login');
      } else {
        const errorMessage = result.message || '관리자 계정 생성에 실패했습니다.';
        // 관리자 계정이 이미 존재하는 경우 특별한 안내
        if (errorMessage.includes('이미 존재합니다') || errorMessage.includes('하나만 생성')) {
          setErrors([errorMessage + ' 이미 생성된 관리자 계정으로 로그인해주세요.']);
        } else {
          setErrors([errorMessage]);
        }
      }
    } catch (error) {
      console.error('관리자 계정 생성 오류:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrors(['서버 연결에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.']);
      } else {
        setErrors(['서버 오류가 발생했습니다. 다시 시도해주세요.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-signup-container">
      <div className="admin-signup-form">
        <div className="admin-signup-header">
          <h1>관리자 계정 생성</h1>
          <p>관리자 권한이 필요한 계정을 생성합니다.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="이메일을 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호 *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="repassword">비밀번호 확인 *</label>
            <input
              type="password"
              id="repassword"
              name="repassword"
              value={formData.repassword}
              onChange={handleInputChange}
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthday">생년월일 *</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminKey">관리자 생성 키 *</label>
            <input
              type="password"
              id="adminKey"
              name="adminKey"
              value={formData.adminKey}
              onChange={handleInputChange}
              placeholder="관리자 생성 키를 입력하세요"
              disabled={isLoading}
            />
            <small className="form-help">
              관리자 계정을 생성하기 위한 특별한 키가 필요합니다.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : '관리자 계정 생성'}
            </button>
            
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              취소
            </button>
          </div>
        </form>

        <div className="admin-signup-footer">
          <p>
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/login')}
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignupPage;
