import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, getCookie, deleteCookie, isLoggedIn as checkLoginStatus } from './utils/cookieUtils.js';
import './MyPage.css';

interface MyPageProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onLogoClick: () => void;
}

const MyPage: React.FC<MyPageProps> = ({ isLoggedIn, onLogout, onLogoClick }) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    birthday: ''
  });

  useEffect(() => {
    const checkLoginAndFetchProfile = async () => {
      console.log('🏠 MyPage 컴포넌트 마운트됨');
      console.log('🔍 props isLoggedIn:', isLoggedIn);
      
      // cookieUtils의 isLoggedIn 함수 사용
      const isActuallyLoggedIn = checkLoginStatus();
      
      console.log('🔍 마이페이지 로그인 상태 확인:', {
        propsIsLoggedIn: isLoggedIn,
        isActuallyLoggedIn: isActuallyLoggedIn,
        allCookies: document.cookie
      });
      
      // 쿠키에서 로그인 상태를 확인하여 판단
      if (!isActuallyLoggedIn) {
        console.log('❌ 쿠키에서 로그인되지 않음, 메인페이지로 이동');
        navigate('/');
        return;
      }
      
      console.log('✅ 로그인됨, 프로필 조회 시작');
      await fetchUserProfile();
    };
    
    checkLoginAndFetchProfile();
  }, [isLoggedIn, navigate]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const authHeaders = getAuthHeaders();
      console.log('프로필 조회 요청 헤더:', authHeaders);
      
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      const data = await response.json();
      console.log('프로필 조회 응답:', data);

      if (data.success) {
        setUserProfile(data.data);
        setEditFormData({
          name: data.data.name,
          birthday: data.data.birthday ? data.data.birthday.split('T')[0] : ''
        });
        setProfileError('');
      } else {
        setProfileError(data.message || '프로필 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      setProfileError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();
      if (data.success) {
        alert('프로필이 성공적으로 업데이트되었습니다!');
        setIsEditing(false);
        fetchUserProfile(); // 업데이트된 프로필 다시 불러오기
      } else {
        alert(data.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('계정이 성공적으로 삭제되었습니다.');
        onLogout(); // 로그아웃 처리
      } else {
        alert(data.message || '계정 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('계정 삭제 오류:', error);
      alert('계정 삭제 중 오류가 발생했습니다.');
    }
  };

  if (!isLoggedIn) { // Display loading screen while redirecting if not logged in
    return (
      <div className="my-page">
        <Header 
          isLoggedIn={isLoggedIn}
          onLogout={onLogout}
          onLogoClick={onLogoClick}
        />
        <div className="my-page-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>로그인 상태를 확인하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-page">
        <Header 
          isLoggedIn={isLoggedIn}
          onLogout={onLogout}
          onLogoClick={onLogoClick}
        />
        <div className="my-page-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>프로필 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-page">
      <Header 
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onLogoClick={onLogoClick}
      />
      <div className="my-page-container">
        <div className="my-page-card">
          <div className="my-page-header">
            <div className="avatar">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h1>{userProfile?.name}님의 마이페이지</h1>
            <p>{userProfile?.email}</p>
          </div>
          
          <div className="profile-details">
            {profileError && (
              <div className="error-message">
                {profileError} <button onClick={fetchUserProfile}>재시도</button>
              </div>
            )}

            {!isEditing ? (
              <>
                <p><strong>이름:</strong> {userProfile?.name}</p>
                <p><strong>이메일:</strong> {userProfile?.email}</p>
                <p><strong>역할:</strong> 
                  <span className={`role-badge ${userProfile?.role === 'ADMIN' ? 'admin' : 'user'}`}>
                    {userProfile?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
                  </span>
                </p>
                <p><strong>생년월일:</strong> {userProfile?.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'N/A'}</p>
                <p><strong>가입일:</strong> {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
              </>
            ) : (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="editName">이름:</label>
                  <input
                    type="text"
                    id="editName"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editBirthday">생년월일:</label>
                  <input
                    type="date"
                    id="editBirthday"
                    name="birthday"
                    value={editFormData.birthday}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="button-group">
                  <button className="save-button" onClick={handleUpdateProfile}>저장</button>
                  <button className="cancel-button" onClick={() => setIsEditing(false)}>취소</button>
                </div>
              </div>
            )}
          </div>

          <div className="account-actions">
            <button className="edit-button" onClick={() => setIsEditing(true)}>프로필 수정</button>
            <button className="delete-account-button" onClick={handleDeleteAccount}>계정 삭제</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
