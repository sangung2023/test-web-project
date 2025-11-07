import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, isLoggedIn } from './utils/cookieUtils.js';
import { apiGet } from './utils/apiUtils.js';
import './InquiryHistoryPage.css';

interface Inquiry {
  supportId: number;
  userId: number;
  name: string;
  mobile: string;
  email: string;
  title: string;
  category: string;
  content: string;
  file?: string;
  fileName?: string;
  originalFileName?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  comments?: Comment[];
}

interface Comment {
  commentId: number;
  supportId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: number;
    name: string;
    email: string;
    role: string;
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
    const loginStatus = !!isLoggedIn();
    setUserLoggedIn(loginStatus);
    
    if (loginStatus) {
      fetchInquiries();
    }
  }, [propIsLoggedIn]);

  // 문의내역 조회
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/supports');

      if (!response) {
        // 토큰 만료로 인한 자동 로그아웃 처리됨
        return;
      }

      if (!response.ok) {
        throw new Error('문의내역을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('문의내역 응답 데이터:', data);
      
      // 파일 정보 확인 (개발용)
      if (data.success && data.data && data.data.supports) {
        data.data.supports.forEach((inquiry: any, index: number) => {
          if (inquiry.file) {
            console.log(`📎 문의 ${index + 1} 파일:`, {
              title: inquiry.title,
              originalFileName: inquiry.originalFileName,
              fileName: inquiry.fileName,
              fileUrl: inquiry.file
            });
          }
        });
      }
      
      if (data.success && data.data && data.data.supports && Array.isArray(data.data.supports)) {
        console.log('문의내역 배열:', data.data.supports);
        setInquiries(data.data.supports);
      } else if (data.success && data.data && Array.isArray(data.data)) {
        console.log('문의내역 배열 (직접):', data.data);
        setInquiries(data.data);
      } else if (Array.isArray(data)) {
        console.log('문의내역 배열 (루트):', data);
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
        await fetch('/api/users/logout', {
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

        <div className="inquiry-tabs">
          <button 
            className="tab-button"
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

        <div className="inquiry-history-content">

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
                      </div>
                      
                      <div className="inquiry-footer">
                        <div className="inquiry-author-info">
                          <span className="inquiry-author">👤 {inquiry.name}</span>
                        </div>
                        <div className="inquiry-status">
                          {inquiry.file && (
                            <span className="file-attached">📎 파일첨부</span>
                          )}
                          {inquiry.comments && inquiry.comments.length > 0 && (
                            <span className="comment-count">💬 답변 {inquiry.comments.length}개</span>
                          )}
                        </div>
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
                  <span className="info-value">{selectedInquiry.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">전화번호:</span>
                  <span className="info-value">{selectedInquiry.mobile}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">이메일:</span>
                  <span className="info-value">{selectedInquiry.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">작성일:</span>
                  <span className="info-value">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
                {selectedInquiry.file && (
                    <div className="info-item">
                      <span className="info-label">첨부파일:</span>
                      <a 
                        href={selectedInquiry.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="info-value file-link"
                        style={{ 
                          color: '#667eea', 
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        📎 {selectedInquiry.originalFileName || '첨부파일'}
                      </a>
                    </div>
                )}
              </div>
              
              <div className="modal-text">
                <h4>문의 내용</h4>
                <div className="content-text">
                  {selectedInquiry.content}
                </div>
              </div>

              {/* 댓글 섹션 */}
              {selectedInquiry.comments && selectedInquiry.comments.length > 0 && (
                <div className="comments-section">
                  <h4>💬 관리자 답변</h4>
                  {selectedInquiry.comments.map((comment) => (
                    <div key={comment.commentId} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">👤 {comment.user.name}</span>
                        <span className="comment-date">
                          📅 {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="comment-content">
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryHistoryPage;
