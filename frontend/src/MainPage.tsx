import React from 'react';
import Header from './Header.tsx';
import bannerImage from './images/banner.png';
import './MainPage.css';

interface MainPageProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLoginClick, onSignupClick, isLoggedIn = false, onLogout, onLogoClick }) => {
  const teamMembers = [
    {
      name: '임성빈',
      role: '프론트엔드 개발',
      image: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=김철수'
    },
    {
      name: '박화랑',
      role: '백엔드 개발',
      image: 'https://via.placeholder.com/150x150/7ED321/FFFFFF?text=이영희'
    },
    {
      name: '김시현',
      role: 'AI/ML 엔지니어',
      image: 'https://via.placeholder.com/150x150/F5A623/FFFFFF?text=박민수'
    },
    {
      name: '문상웅',
      role: 'UI/UX 디자이너',
      image: 'https://via.placeholder.com/150x150/BD10E0/FFFFFF?text=정수진'
    }
  ];

  return (
    <div className="main-page">
      <Header 
        onLoginClick={onLoginClick} 
        onSignupClick={onSignupClick}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onLogoClick={onLogoClick}
      />
      {/* 배경은 블록 섹션 */}
      <img src={bannerImage} alt="banner" className="banner-image"/>

      {/* 소개 섹션 */}
      <section id="introduction" className="section-block">
        <div className="section-content">
          <h2 className="section-title">소개</h2>
          <p className="section-text">
            One Step은 지혜가 담긴 AI 기술을 통해 Suricata Rule을 자동으로 생성하는 혁신적인 플랫폼입니다. 
            MCP(Model Context Protocol)를 활용하여 정확하고 효율적인 보안 규칙을 제공하며, 
            사용자가 복잡한 설정 없이도 강력한 네트워크 보안을 구축할 수 있도록 도와줍니다.
          </p>
        </div>
      </section>

      {/* 팀 원 섹션 */}
      <section id="team" className="section-block">
        <div className="section-content">
          <h2 className="section-title">팀 원</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="team-image"
                />
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 아키텍처 섹션 */}
      <section id="architecture" className="section-block">
        <div className="section-content">
          <h2 className="section-title">아키텍처</h2>
          <div className="architecture-placeholder">
            <p>아키텍처 다이어그램이 여기에 표시됩니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
