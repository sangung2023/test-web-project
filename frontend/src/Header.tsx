import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie, getAuthHeaders } from './utils/cookieUtils.js';
import './Header.css';

interface HeaderProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, isLoggedIn = false, onLogout, onLogoClick }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('USER');
  
  // 로고 이미지 URL 처리 (개발/배포 환경 대응)
  const getLogoUrl = () => {
    const logoPath = '/uploads/images/logo.png';
    // 개발 환경: localhost이면 백엔드 서버 직접 사용
    if (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3000'
    )) {
      return `http://localhost:5000${logoPath}`;
    }
    // 배포 환경: 상대 경로 사용 (Apache가 프록시 처리)
    return logoPath;
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserRole();
    }
  }, [isLoggedIn]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const data = await response.json();
      if (data.success && data.data.role) {
        setUserRole(data.data.role);
      }
    } catch (error) {
      console.error('사용자 역할 조회 오류:', error);
    }
  };
  
  const handleLinkClick = (section: string) => {
    // 현재 경로 확인
    const currentPath = window.location.pathname;
    
    // 메인페이지가 아니면 메인페이지로 이동 후 스크롤
    if (currentPath !== '/') {
      navigate(`/#${section}`);
      // 메인페이지로 이동 후 스크롤을 위해 약간의 지연
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 이미 메인페이지에 있으면 바로 스크롤
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleMyPageClick = () => {
    console.log('🔗 마이페이지 버튼 클릭됨');
    console.log('🔍 현재 로그인 상태:', isLoggedIn);
    console.log('🍪 현재 쿠키:', document.cookie);
    navigate('/mypage');
  };

  const handleBoardClick = () => {
    console.log('🔗 게시판 버튼 클릭됨');
    navigate('/board');
  };

  const handleInquiryClick = () => {
    console.log('🔗 고객문의 버튼 클릭됨');
    navigate('/inquiry');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img 
            src={getLogoUrl()} 
            alt="드래곤 로고" 
            className="logo-image"
            style={{ border: 'none', outline: 'none', padding: 0, margin: 0, boxShadow: 'none', background: 'transparent' }}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 이미지로 대체
              console.error('로고 이미지 로드 실패:', e);
            }}
          />
          <h1>One Step</h1>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            <li>
              <button 
                className="nav-link" 
                onClick={() => handleLinkClick('introduction')}
              >
                소개
              </button>
            </li>
            <li>
              <button 
                className="nav-link" 
                onClick={() => handleLinkClick('team')}
              >
                팀원
              </button>
            </li>
            <li>
              <button 
                className="nav-link" 
                onClick={() => handleLinkClick('architecture')}
              >
                아키텍처
              </button>
            </li>
            <li>
              <button 
                className="nav-link" 
                onClick={handleBoardClick}
              >
                게시판
              </button>
            </li>
            <li>
              <button 
                className="nav-link" 
                onClick={handleInquiryClick}
              >
                고객 문의
              </button>
            </li>
          </ul>
        </nav>
        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <span className="welcome-text">
                {getCookie('username')}님
              </span>
              <button className="nav-link mypage-btn" onClick={handleMyPageClick}>
                마이페이지
              </button>
              <button className="nav-link logout-btn" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button className="nav-link login-btn" onClick={handleLoginClick}>
                로그인
              </button>
              <button className="nav-link signup-btn" onClick={handleSignupClick}>
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
