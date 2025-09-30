import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie } from './utils/cookieUtils.js';
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
  
  const handleLinkClick = (section: string) => {
    // 스크롤을 해당 섹션으로 이동
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img 
            src="https://via.placeholder.com/40x40/FF6B6B/FFFFFF?text=🐉" 
            alt="드래곤 로고" 
            className="logo-image"
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
                onClick={() => handleLinkClick('notification')}
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
                안녕하세요, {getCookie('username')}님!
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
