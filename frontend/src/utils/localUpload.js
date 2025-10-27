/**
 * 로컬 서버에 파일을 업로드하는 함수
 * @param {File} file - 업로드할 파일
 * @param {string} endpoint - 업로드 엔드포인트 (예: '/api/upload/image', '/api/upload/file')
 * @returns {Promise<{url: string, fileName: string, originalName: string}>} 업로드된 파일의 정보
 */
export const uploadFileToLocal = async (file, endpoint = '/api/upload') => {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', file);

    // API 엔드포인트 URL 구성
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const uploadURL = `${baseURL}${endpoint}`;

    console.log('로컬 서버에 파일 업로드 시작...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      endpoint: uploadURL
    });

    // 파일 업로드 요청
    const response = await fetch(uploadURL, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `파일 업로드 실패 (${response.status})`);
    }

    const result = await response.json();
    console.log('파일 업로드 성공:', result);

    // 이미지 URL의 포트를 항상 5000번으로 변환
    let fixedUrl = result.url;
    if (fixedUrl && fixedUrl.startsWith('http://localhost:3001/')) {
      fixedUrl = fixedUrl.replace('http://localhost:3001/', 'http://localhost:5000/');
    }
    return {
      url: fixedUrl,
      fileName: result.fileName,
      originalName: result.originalName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('로컬 파일 업로드 에러:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

/**
 * 여러 파일을 로컬 서버에 업로드하는 함수
 * @param {FileList} files - 업로드할 파일들
 * @param {string} endpoint - 업로드 엔드포인트
 * @returns {Promise<Array>} 업로드된 파일들의 정보 배열
 */
export const uploadMultipleFilesToLocal = async (files, endpoint = '/api/upload') => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFileToLocal(file, endpoint));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('다중 파일 업로드 에러:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

/**
 * 로컬 서버에서 파일을 삭제하는 함수
 * @param {string} fileName - 삭제할 파일명
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteFileFromLocal = async (fileName) => {
  try {
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const deleteURL = `${baseURL}/api/upload/${encodeURIComponent(fileName)}`;

    const response = await fetch(deleteURL, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('파일 삭제에 실패했습니다.');
    }

    return true;
  } catch (error) {
    console.error('로컬 파일 삭제 에러:', error);
    throw error;
  }
};
