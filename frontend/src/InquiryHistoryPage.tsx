import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, isLoggedIn } from './utils/cookieUtils.js';
import './InquiryHistoryPage.css';

interface Inquiry {
  supportId: number;
  userId: number;
  title: string;
  category: string;
  content: string;
  file?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}

interface InquiryHistoryPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const InquiryHistoryPage: React.FC<InquiryHistoryPageProps> = ({ isLoggedIn: propIsLoggedIn, onLogout, onLogoClick }) => {
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const loginStatus = isLoggedIn();
    setUserLoggedIn(loginStatus);
    
    if (loginStatus) {
      fetchInquiries();
    }
  }, [propIsLoggedIn]);

  // 문의내역 조회
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/supports', {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any
      });

      if (!response.ok) {
        throw new Error('문의내역을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('문의내역 응답 데이터:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setInquiries(data.data);
      } else if (Array.isArray(data)) {
        setInquiries(data);
      } else {
        console.warn('예상하지 못한 응답 구조:', data);
        setInquiries([]);
      }
    } catch (error) {
      console.error('문의내역 조회 오류:', error);
      setError('문의내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 문의 상세보기
  const handleInquiryClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInquiry(null);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '제품 관련 문의': '#667eea',
      '제품 및 서비스 고객 제안': '#4ecdc4',
      '불편 사항 접수': '#ff6b6b',
      '이벤트 문의': '#ffd93d',
      '기타문의': '#6c757d',
      '가정 배달 서비스 문의': '#a8e6cf'
    };
    return colors[category] || '#6c757d';
  };

  return (
    <div className="inquiry-history-page">
      <Header 
        isLoggedIn={userLoggedIn}
        onLogout={handleLogout}
        onLogoClick={onLogoClick}
      />
      
      <div className="inquiry-history-container">
        <div className="inquiry-history-header">
          <h1>📋 문의내역</h1>
          <p>제출하신 문의내역을 확인하실 수 있습니다.</p>
        </div>

        <div className="inquiry-history-content">
          <div className="inquiry-tabs">
            <button 
              className="tab-button"
              onClick={() => navigate('/inquiry')}
            >
              고객문의
            </button>
            <button 
              className="tab-button active"
              onClick={() => navigate('/inquiry-history')}
            >
              문의내역
            </button>
          </div>

          {!userLoggedIn ? (
            <div className="login-prompt">
              <div className="login-prompt-content">
                <h3>🔐 로그인이 필요합니다</h3>
                <p>문의내역을 확인하려면 로그인해주세요.</p>
                <button 
                  className="login-button"
                  onClick={() => navigate('/login')}
                >
                  로그인하기
                </button>
              </div>
            </div>
          ) : (
            <div className="inquiries-container">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>문의내역을 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="error-message">
                  {error}
                </div>
              ) : inquiries.length === 0 ? (
                <div className="empty-inquiries">
                  <div className="empty-icon">📝</div>
                  <h3>문의내역이 없습니다</h3>
                  <p>첫 번째 문의를 작성해보세요!</p>
                  <button 
                    className="create-inquiry-button"
                    onClick={() => navigate('/inquiry')}
                  >
                    문의 작성하기
                  </button>
                </div>
              ) : (
                <div className="inquiries-list">
                  {inquiries.map((inquiry) => (
                    <div 
                      key={inquiry.supportId} 
                      className="inquiry-card"
                      onClick={() => handleInquiryClick(inquiry)}
                    >
                      <div className="inquiry-header">
                        <div className="inquiry-category">
                          <span 
                            className="category-badge"
                            style={{ backgroundColor: getCategoryColor(inquiry.category) }}
                          >
                            {inquiry.category}
                          </span>
                        </div>
                        <div className="inquiry-date">
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </div>
                      
                      <div className="inquiry-content">
                        <h3 className="inquiry-title">{inquiry.title}</h3>
                        <p className="inquiry-preview">
                          {inquiry.content.length > 100 
                            ? `${inquiry.content.substring(0, 100)}...` 
                            : inquiry.content
                          }
                        </p>
                      </div>
                      
                      <div className="inquiry-footer">
                        <span className="inquiry-author">👤 {inquiry.user.name}</span>
                        {inquiry.file && (
                          <span className="file-attached">📎 파일첨부</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 문의 상세 모달 */}
      {showModal && selectedInquiry && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedInquiry.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <div className="info-item">
                  <span className="info-label">분류:</span>
                  <span 
                    className="info-value category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedInquiry.category) }}
                  >
                    {selectedInquiry.category}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">작성자:</span>
                  <span className="info-value">{selectedInquiry.user.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">작성일:</span>
                  <span className="info-value">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
                {selectedInquiry.file && (
                  <div className="info-item">
                    <span className="info-label">첨부파일:</span>
                    <span className="info-value file-link">📎 {selectedInquiry.file}</span>
                  </div>
                )}
              </div>
              
              <div className="modal-text">
                <h4>문의 내용</h4>
                <div className="content-text">
                  {selectedInquiry.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryHistoryPage;
