import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.tsx';
import { getAuthHeaders, isLoggedIn, clearAllAuthCookies } from './utils/cookieUtils.js';
import './BoardPage.css';

interface BoardPost {
  boardId: number;
  userId: number;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
}

interface BoardPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLogoClick?: () => void;
}

const BoardPage = ({ isLoggedIn: propIsLoggedIn, onLogout, onLogoClick }: BoardPageProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([] as BoardPost[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null as number | null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [selectedPost, setSelectedPost] = useState(null as BoardPost | null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPost, setEditPost] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 이미지 URL을 적절히 처리하는 함수
  const getImageUrl = (url: string) => {
    console.log('🔍 원본 URL:', url);
    console.log('🔍 URL 타입:', url.startsWith('data:image/') ? 'data:image' : '일반 URL');
    
    // data:image URL인 경우 유효성 검증 후 반환
    if (url.startsWith('data:image/')) {
      if (isValidDataImageUrl(url)) {
        console.log('✅ 유효한 data:image URL 직접 사용');
        return url;
      } else {
        console.warn('⚠️ 유효하지 않은 data:image URL:', url);
        // 유효하지 않은 data:image URL도 일단 시도해보기
        return url;
      }
    }
    
    // 이미 프록시 URL인 경우 그대로 반환
    if (url.includes('images.weserv.nl') || url.includes('cors-anywhere.herokuapp.com')) {
      console.log('✅ 프록시 URL 직접 사용');
      return url;
    }
    
    // 구글 이미지 URL인 경우 특별 처리
    if (url.includes('googleusercontent.com') || url.includes('googleapis.com')) {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
      console.log('✅ 구글 이미지 프록시 URL 생성:', proxyUrl);
      return proxyUrl;
    }
    
    // 기타 URL들도 프록시를 통해 처리
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    console.log('✅ 일반 URL 프록시 URL 생성:', proxyUrl);
    return proxyUrl;
  };

  // data:image URL인지 확인하는 함수
  const isDataImageUrl = (url: string) => {
    return url.startsWith('data:image/');
  };

  // data:image URL의 유효성을 검증하는 함수
  const isValidDataImageUrl = (url: string) => {
    if (!url.startsWith('data:image/')) {
      return false;
    }
    
    // data:image/jpeg;base64, 또는 data:image/png;base64, 형태인지 확인
    const dataImagePattern = /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/;
    return dataImagePattern.test(url);
  };

  // 현재 사용자 정보 조회
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentUserId(data.data.userId);
        }
      }
    } catch (error) {
      console.error('현재 사용자 정보 조회 오류:', error);
    }
  };

  // 게시글 목록 조회
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/boards', {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any
      });

      if (!response.ok) {
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('게시글 응답 데이터:', data);
      
      // 백엔드 API 응답 구조에 맞게 처리
      if (data.success && data.data && Array.isArray(data.data.boards)) {
        setPosts(data.data.boards);
      } else if (Array.isArray(data)) {
        setPosts(data);
      } else if (data.data && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        console.warn('예상하지 못한 응답 구조:', data);
        setPosts([]);
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 작성
  const handleWritePost = async (e: any) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/boards', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any,
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        throw new Error('게시글 작성에 실패했습니다.');
      }

      const data = await response.json();
      console.log('게시글 작성 성공:', data);
      
      // 폼 초기화 및 목록 새로고침
      setNewPost({ title: '', content: '', image: '' });
      setShowWriteForm(false);
      
      // 로그인 상태 재확인
      const loginStatus = isLoggedIn();
      setUserLoggedIn(loginStatus);
      console.log('🔍 게시글 작성 후 로그인 상태 재확인:', loginStatus);
      
      // 로그인 상태가 유지되지 않았다면 경고
      if (!loginStatus) {
        console.warn('⚠️ 게시글 작성 후 로그인 상태가 유지되지 않음');
        setError('로그인 상태가 유지되지 않았습니다. 다시 로그인해주세요.');
      }
      
      fetchPosts();
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      setError('게시글 작성에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (boardId: number) => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('본인이 작성한 게시글만 삭제할 수 있습니다.');
          // 3초 후 에러 메시지 자동 제거
          setTimeout(() => {
            setError('');
          }, 1000);
        } else {
          setError(errorData.message || '게시글 삭제에 실패했습니다.');
        }
        return;
      }

      const result = await response.json();
      if (result.success) {
        fetchPosts(); // 목록 새로고침
        setError(''); // 에러 메시지 초기화
      } else {
        setError(result.message || '게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const loginStatus = isLoggedIn();
      setUserLoggedIn(loginStatus);
      console.log('🔍 게시판 페이지 로그인 상태:', loginStatus);
    };
    
    // props로 전달받은 로그인 상태 우선 사용
    if (propIsLoggedIn !== undefined) {
      setUserLoggedIn(propIsLoggedIn);
      console.log('🔍 props로 전달받은 로그인 상태:', propIsLoggedIn);
    } else {
      checkLoginStatus();
    }
    
    // 로그인한 상태라면 현재 사용자 정보 조회
    if (propIsLoggedIn || isLoggedIn()) {
      fetchCurrentUser();
    }
    
    fetchPosts();

    // 페이지 포커스 시 로그인 상태 재확인
    const handleFocus = () => {
      checkLoginStatus();
    };

    // 페이지 가시성 변경 시 로그인 상태 재확인
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkLoginStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 클린업
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // props로 전달받은 로그인 상태가 변경될 때 업데이트
  useEffect(() => {
    if (propIsLoggedIn !== undefined) {
      setUserLoggedIn(propIsLoggedIn);
      console.log('🔍 props 로그인 상태 변경:', propIsLoggedIn);
      
      // 로그인한 상태라면 현재 사용자 정보 조회
      if (propIsLoggedIn) {
        fetchCurrentUser();
      } else {
        setCurrentUserId(null);
      }
    }
  }, [propIsLoggedIn]);

  // 게시글 상세 모달 열기
  const handlePostClick = (post: BoardPost) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  // 수정 모달 열기
  const handleEditClick = (post: BoardPost) => {
    setEditPost({
      title: post.title,
      content: post.content,
      image: post.image || ''
    });
    setShowEditModal(true);
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPost({ title: '', content: '', image: '' });
  };

  // 게시글 수정
  const handleEditPost = async (e: any) => {
    e.preventDefault();
    
    if (!selectedPost) return;

    try {
      const response = await fetch(`http://localhost:5000/api/boards/${selectedPost.boardId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          ...getAuthHeaders()
        } as any,
        body: JSON.stringify(editPost)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('본인이 작성한 게시글만 수정할 수 있습니다.');
          setTimeout(() => {
            setError('');
          }, 3000);
        } else {
          setError(errorData.message || '게시글 수정에 실패했습니다.');
        }
        return;
      }

      const result = await response.json();
      if (result.success) {
        handleCloseEditModal();
        fetchPosts(); // 목록 새로고침
        setError(''); // 에러 메시지 초기화
      } else {
        setError(result.message || '게시글 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      setError('게시글 수정에 실패했습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      console.log('🚪 게시판 페이지에서 로그아웃 시작');
      
      // props로 전달받은 onLogout 함수가 있으면 사용
      if (onLogout) {
        onLogout();
        return;
      }
      
      // 백엔드 로그아웃 API 호출 (선택사항)
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
      
      // 쿠키 및 localStorage 정리
      clearAllAuthCookies();
      
      // 로그인 상태 업데이트
      setUserLoggedIn(false);
      
      console.log('✅ 로그아웃 완료');
      
      // 메인 페이지로 이동
      navigate('/');
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error);
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

  return (
    <div className="board-page">
      <Header 
        isLoggedIn={userLoggedIn}
        onLogout={handleLogout}
        onLogoClick={onLogoClick}
      />
      
      <div className="board-container">
        <div className="board-header">
          <h1>🗨️ 자유게시판</h1>
          <p>자유롭게 소통하고 정보를 공유해보세요!</p>
        </div>

        {userLoggedIn && (
          <div className="board-actions">
            <button 
              className="write-button"
              onClick={() => setShowWriteForm(!showWriteForm)}
            >
              ✍️ 글쓰기
            </button>
          </div>
        )}

        {userLoggedIn && showWriteForm && (
          <div className="write-form-container">
            <form className="write-form" onSubmit={handleWritePost}>
              <div className="form-group">
                <label htmlFor="title">제목</label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="content">내용</label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="자유롭게 작성해보세요!"
                  rows={6}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">이미지 URL (선택사항)</label>
                <input
                  type="text"
                  id="image"
                  value={newPost.image}
                  onChange={(e) => {
                    const url = e.target.value;
                    setNewPost({ ...newPost, image: url });
                    if (url) {
                      setImageLoading(true);
                    }
                  }}
                  placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
                />
                <div className="url-help">
                  <p>💡 팁: http:// 또는 https://로 시작하는 완전한 URL을 입력하세요</p>
                </div>
                {newPost.image && (
                  <div className="image-preview">
                    {imageLoading && (
                      <div className="image-loading">
                        <div className="loading-spinner"></div>
                        <p>🔄 이미지 로딩 중...</p>
                      </div>
                    )}
                    <img 
                      src={getImageUrl(newPost.image)} 
                      alt="미리보기"
                      style={{display: 'none'}}
                      onLoad={(e) => {
                        console.log('✅ 이미지 로드 성공:', {
                          originalUrl: newPost.image,
                          processedUrl: getImageUrl(newPost.image),
                          isDataImage: isDataImageUrl(newPost.image)
                        });
                        e.currentTarget.style.display = 'block';
                        setImageLoading(false);
                        setImageError(false);
                        const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'none';
                      }}
                      onError={(e) => {
                        console.error('❌ 이미지 로드 실패:', {
                          originalUrl: newPost.image,
                          processedUrl: getImageUrl(newPost.image),
                          isDataImage: isDataImageUrl(newPost.image),
                          error: e
                        });
                        e.currentTarget.style.display = 'none';
                        setImageLoading(false);
                        setImageError(true);
                        const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'block';
                      }}
                    />
                    <div className="image-error" style={{display: 'none'}}>
                      <p>⚠️ 이미지를 불러올 수 없습니다</p>
                      <p>URL: {newPost.image}</p>
                      <p>처리된 URL: {getImageUrl(newPost.image)}</p>
                      <div className="error-solutions">
                        <p>💡 해결 방법:</p>
                        <ul>
                          <li><strong>구글 이미지:</strong> 이미지 주소를 우클릭 → "이미지 주소 복사" 사용</li>
                          <li><strong>다른 사이트:</strong> 이미지를 우클릭 → "이미지 주소 복사" 사용</li>
                          <li><strong>직접 업로드:</strong> <a href="https://imgur.com" target="_blank" rel="noopener noreferrer">Imgur</a> 같은 이미지 호스팅 서비스 사용</li>
                          <li><strong>다른 이미지:</strong> 다른 이미지 URL을 시도해보세요</li>
                        </ul>
                      </div>
                      <div className="alternative-services">
                        <p>🖼️ 추천 이미지 호스팅 서비스:</p>
                        <div className="service-links">
                          <a href="https://imgur.com" target="_blank" rel="noopener noreferrer">Imgur</a>
                          <a href="https://postimages.org" target="_blank" rel="noopener noreferrer">PostImages</a>
                          <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer">ImgBB</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">
                  📝 게시하기
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowWriteForm(false)}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {!userLoggedIn && (
          <div className="login-prompt">
            <div className="login-prompt-content">
              <h3>🔐 로그인이 필요합니다</h3>
              <p>게시글을 작성하려면 로그인해주세요.</p>
              <button 
                className="login-button"
                onClick={() => navigate('/login')}
              >
                로그인하기
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="posts-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>게시글을 불러오는 중...</p>
            </div>
          ) : !Array.isArray(posts) || posts.length === 0 ? (
            <div className="empty-posts">
              <div className="empty-icon">📝</div>
              <h3>아직 게시글이 없습니다</h3>
              <p>첫 번째 게시글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <div key={post.boardId} className="post-card" onClick={() => handlePostClick(post)}>
                  <div className="post-header">
                    <div className="post-author">
                      <span className="author-name">👤 {post.user.name}</span>
                    </div>
                    {userLoggedIn && (
                      <div className="post-actions">
                        <button 
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post.boardId);
                          }}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    {post.image && (
                      <div className="post-image">
                        <img 
                          src={getImageUrl(post.image)} 
                          alt="게시글 이미지"
                          onLoad={() => {
                            console.log('✅ 게시글 목록 이미지 로드 성공:', {
                              originalUrl: post.image,
                              processedUrl: getImageUrl(post.image),
                              isDataImage: isDataImageUrl(post.image)
                            });
                          }}
                          onError={(e) => {
                            console.error('❌ 게시글 목록 이미지 로드 실패:', {
                              originalUrl: post.image,
                              processedUrl: getImageUrl(post.image),
                              isDataImage: isDataImageUrl(post.image),
                              error: e
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="post-footer">
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 게시글 상세 모달 */}
      {showModal && selectedPost && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedPost.title}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-author">
                <span className="author-name">👤 {selectedPost.user.name}</span>
                <span className="modal-date">{formatDate(selectedPost.createdAt)}</span>
              </div>
              
              <div className="modal-text">
                {selectedPost.content}
              </div>
              
              {selectedPost.image && (
                <div className="modal-image">
                  <img 
                    src={getImageUrl(selectedPost.image)} 
                    alt="게시글 이미지"
                    onLoad={() => {
                      console.log('✅ 상세보기 이미지 로드 성공:', {
                        originalUrl: selectedPost.image,
                        processedUrl: getImageUrl(selectedPost.image),
                        isDataImage: isDataImageUrl(selectedPost.image)
                      });
                    }}
                    onError={(e) => {
                      console.error('❌ 상세보기 이미지 로드 실패:', {
                        originalUrl: selectedPost.image,
                        processedUrl: getImageUrl(selectedPost.image),
                        isDataImage: isDataImageUrl(selectedPost.image),
                        error: e
                      });
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {userLoggedIn && currentUserId === selectedPost.userId && (
                <>
                  <button 
                    className="modal-edit-button"
                    onClick={() => handleEditClick(selectedPost)}
                  >
                    ✏️ 수정
                  </button>
                  <button 
                    className="modal-delete-button"
                    onClick={() => {
                      handleDeletePost(selectedPost.boardId);
                      handleCloseModal();
                    }}
                  >
                    🗑️ 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 게시글 수정 모달 */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">게시글 수정</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ✕
              </button>
            </div>
            
            <form className="edit-form" onSubmit={handleEditPost}>
              <div className="form-group">
                <label htmlFor="edit-title">제목</label>
                <input
                  type="text"
                  id="edit-title"
                  value={editPost.title}
                  onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-content">내용</label>
                <textarea
                  id="edit-content"
                  value={editPost.content}
                  onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                  placeholder="자유롭게 작성해보세요!"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">🖼️ 이미지 URL (선택 사항)</label>
                <input
                  type="text"
                  id="edit-image"
                  value={editPost.image}
                  onChange={(e) => {
                    const url = e.target.value;
                    setEditPost({ ...editPost, image: url });
                    if (url) {
                      setImageLoading(true);
                    }
                  }}
                  placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
                />
                <div className="url-help">
                  <p>💡 팁: http:// 또는 https://로 시작하는 완전한 URL을 입력하세요</p>
                </div>
                {editPost.image && (
                  <div className="image-preview">
                    {imageLoading && (
                      <div className="image-loading">
                        <div className="loading-spinner"></div>
                        <p>🔄 이미지 로딩 중...</p>
                      </div>
                    )}
                    <img 
                      src={getImageUrl(editPost.image)} 
                      alt="미리보기"
                      style={{display: 'none'}}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                        setImageLoading(false);
                        setImageError(false);
                        const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setImageLoading(false);
                        setImageError(true);
                        const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'block';
                      }}
                    />
                    <div className="image-error" style={{display: 'none'}}>
                      <p>⚠️ 이미지를 불러올 수 없습니다</p>
                      <p>URL: {editPost.image}</p>
                      <p>처리된 URL: {getImageUrl(editPost.image)}</p>
                      <div className="error-solutions">
                        <p>💡 해결 방법:</p>
                        <ul>
                          <li><strong>구글 이미지:</strong> 이미지 주소를 우클릭 → "이미지 주소 복사" 사용</li>
                          <li><strong>다른 사이트:</strong> 이미지를 우클릭 → "이미지 주소 복사" 사용</li>
                          <li><strong>직접 업로드:</strong> <a href="https://imgur.com" target="_blank" rel="noopener noreferrer">Imgur</a> 같은 이미지 호스팅 서비스 사용</li>
                          <li><strong>다른 이미지:</strong> 다른 이미지 URL을 시도해보세요</li>
                        </ul>
                      </div>
                      <div className="alternative-services">
                        <p>🖼️ 추천 이미지 호스팅 서비스:</p>
                        <div className="service-links">
                          <a href="https://imgur.com" target="_blank" rel="noopener noreferrer">Imgur</a>
                          <a href="https://postimages.org" target="_blank" rel="noopener noreferrer">PostImages</a>
                          <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer">ImgBB</a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>


              <div className="form-actions">
                <button type="submit" className="submit-button">
                  수정 완료
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseEditModal}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
