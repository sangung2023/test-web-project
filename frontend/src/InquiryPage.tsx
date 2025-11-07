
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, getAccessToken, isLoggedIn } from './utils/cookieUtils.js';
import { uploadFileToLocal } from './utils/localUpload.js';
import { API_ENDPOINTS } from './config/api.js';
import './InquiryPage.css';

// 파일 크기 검증 함수 (최대 크기 바이트 단위)
function validateFileSize(file: File, maxSize: number) {
  return file.size <= maxSize;
}

// 파일 타입 검증 함수 (모든 파일 타입 허용)
function validateFileType(file: File) {
  return true; // 모든 파일 타입 허용
}

interface InquiryPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const InquiryPage: React.FC<InquiryPageProps> = ({ isLoggedIn: propIsLoggedIn, onLogout, onLogoClick }) => {
  const navigate = useNavigate();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('USER');
  const [allInquiries, setAllInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
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

  // 로그인 상태 및 사용자 역할 확인
  React.useEffect(() => {
    const loginStatus = isLoggedIn();
    setUserLoggedIn(!!loginStatus);
    
    if (loginStatus) {
      fetchUserRole();
    }
  }, [propIsLoggedIn]);

  // 사용자 역할 조회
  const fetchUserRole = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        const role = userData.data.role || 'USER';
        setUserRole(role);
        
        // 관리자인 경우 모든 문의 조회
        if (role === 'ADMIN') {
          fetchAllInquiries();
        }
      } else {
        console.error('사용자 정보 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('사용자 역할 조회 실패:', error);
    }
  };

  // 모든 문의 조회 (관리자용)
  const fetchAllInquiries = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch('/api/supports/admin/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAllInquiries(data.data?.supports || []);
      } else {
        console.error('문의 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('문의 조회 오류:', error);
    }
  };

  // 댓글 모달 열기
  const openCommentModal = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setShowCommentModal(true);
    setNewComment('');
  };

  // 댓글 모달 닫기
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setSelectedInquiry(null);
    setNewComment('');
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !selectedInquiry) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch('/api/support-comments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          supportId: selectedInquiry.supportId,
          content: newComment
        })
      });

      if (response.ok) {
        alert('댓글이 성공적으로 작성되었습니다.');
        closeCommentModal();
        // 문의 목록 새로고침
        fetchAllInquiries();
      } else {
        const errorData = await response.json();
        alert(`댓글 작성 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

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
      
      // 파일이 있으면 로컬 서버에 먼저 업로드
      let fileInfo: { url: string; fileName: string; originalName: string } | null = null;
      if (inquiry.file) {
        try {
          console.log('로컬 서버에 파일 업로드 시작...');
          fileInfo = await uploadFileToLocal(inquiry.file, '/api/upload');
          console.log('파일 업로드 성공:', fileInfo);
        } catch (uploadError) {
          console.error('파일 업로드 실패:', uploadError);
          setError('파일 업로드에 실패했습니다.');
          return;
        }
      }

      // JSON 데이터로 전송
      const supportData = {
        category: inquiry.category,
        name: inquiry.name,
        mobile: inquiry.mobile,
        email: inquiry.email,
        subject: inquiry.subject,
        content: inquiry.content,
        file: fileInfo ? fileInfo.url : null,
        fileName: fileInfo ? fileInfo.fileName : null,
        originalFileName: fileInfo ? fileInfo.originalName : null
      };

      console.log('전송할 데이터:', supportData);

      const token = getAccessToken();
      const headers: any = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(API_ENDPOINTS.SUPPORTS, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(supportData)
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
      const file = e.target.files[0];
      
      // 파일 크기 검증 (100MB)
      if (!validateFileSize(file, 100 * 1024 * 1024)) {
        setError('파일 크기가 너무 큽니다. (최대 100MB)');
        return;
      }
      
      // 파일 타입 검증 (모든 파일 타입 허용)
      if (!validateFileType(file)) {
        setError('파일 형식에 문제가 있습니다.');
        return;
      }
      
      setInquiry({ ...inquiry, file: file });
      setError(''); // 에러 메시지 초기화
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

  return (
    <div className="inquiry-page">
      <Header 
        isLoggedIn={userLoggedIn}
        onLogout={handleLogout}
        onLogoClick={onLogoClick}
      />
      
      <div className="inquiry-container">
        <div className="inquiry-header">
          {userRole === 'ADMIN' ? (
            <>
              <h1>🛡️ 관리자 패널</h1>
              <p>모든 고객 문의를 관리하고 답변하세요!</p>
            </>
          ) : (
            <>
              <h1>📞 고객 문의</h1>
              <p>궁금한 점이 있으시면 언제든 문의해주세요!</p>
            </>
          )}
        </div>

        {userRole !== 'ADMIN' && (
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
        )}

        <div className="inquiry-content">
          {userRole === 'ADMIN' ? (
            <div className="admin-panel">
              <div className="admin-panel-header">
                <h2>📋 모든 문의 내역</h2>
                <button 
                  className="refresh-button"
                  onClick={fetchAllInquiries}
                >
                  🔄 새로고침
                </button>
              </div>
              
              <div className="admin-inquiries-list">
                {allInquiries.length > 0 ? (
                  allInquiries.map((inquiry) => (
                    <div key={inquiry.supportId} className="admin-inquiry-item">
                      <div className="inquiry-header">
                        <div className="inquiry-info">
                          <h3>{inquiry.subject}</h3>
                          <div className="inquiry-meta">
                            <span>👤 {inquiry.user.name}</span>
                            <span>📧 {inquiry.user.email}</span>
                            <span>📅 {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="inquiry-content">
                        <p><strong>분류:</strong> {inquiry.category}</p>
                        <p><strong>내용:</strong></p>
                        <p>{inquiry.content}</p>
                        {inquiry.file && (
                          <div className="inquiry-file">
                            📎 첨부파일: {inquiry.originalFileName}
                          </div>
                        )}
                      </div>

                      {/* 댓글 섹션 */}
                      {inquiry.comments && inquiry.comments.length > 0 && (
                        <div className="comments-section">
                          <h4>💬 관리자 댓글</h4>
                          {inquiry.comments.map((comment: any) => (
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
                      
                      <div className="admin-actions">
                        <button 
                          className="reply-button"
                          onClick={() => openCommentModal(inquiry)}
                        >
                          💬 답변하기
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-inquiries">
                    <p>📭 아직 문의가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
          )}
        </div>

      </div>

      {/* 댓글 작성 모달 */}
      {showCommentModal && selectedInquiry && (
        <div className="comment-modal-overlay">
          <div className="comment-modal">
            <div className="comment-modal-header">
              <h3>💬 답변 작성</h3>
              <button 
                className="close-button"
                onClick={closeCommentModal}
              >
                ✕
              </button>
            </div>
            
            <div className="comment-modal-content">
              <div className="inquiry-info">
                <h4>📋 문의 정보</h4>
                <p><strong>제목:</strong> {selectedInquiry.subject}</p>
                <p><strong>문의자:</strong> {selectedInquiry.user.name} ({selectedInquiry.user.email})</p>
                <p><strong>분류:</strong> {selectedInquiry.category}</p>
                <p><strong>내용:</strong> {selectedInquiry.content}</p>
              </div>
              
              <div className="comment-form">
                <label htmlFor="comment-content">답변 내용</label>
                <textarea
                  id="comment-content"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="고객님의 문의에 대한 답변을 작성해주세요..."
                  rows={6}
                />
              </div>
              
              <div className="comment-modal-actions">
                <button 
                  className="cancel-button"
                  onClick={closeCommentModal}
                >
                  취소
                </button>
                <button 
                  className="submit-comment-button"
                  onClick={handleSubmitComment}
                >
                  답변 등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
