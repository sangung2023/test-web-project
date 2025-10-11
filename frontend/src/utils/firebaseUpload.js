import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Firebase Storage에 파일을 업로드하는 함수
 * @param {File} file - 업로드할 파일
 * @param {string} folder - 저장할 폴더명 (기본값: 'uploads')
 * @returns {Promise<{url: string, fileName: string}>} 업로드된 파일의 URL과 파일명
 */
export const uploadFileToFirebase = async (file, folder = 'uploads') => {
  try {
    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${timestamp}-${randomString}-${file.name}`;
    
    // Firebase Storage 참조 생성
    const storageRef = ref(storage, fileName);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Firebase 업로드 에러:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

/**
 * 여러 파일을 Firebase Storage에 업로드하는 함수
 * @param {FileList} files - 업로드할 파일들
 * @param {string} folder - 저장할 폴더명 (기본값: 'uploads')
 * @returns {Promise<Array>} 업로드된 파일들의 정보 배열
 */
export const uploadMultipleFilesToFirebase = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = Array.from(files).map(file => uploadFileToFirebase(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('다중 파일 업로드 에러:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

/**
 * Firebase Storage에서 파일을 삭제하는 함수
 * @param {string} fileName - 삭제할 파일명
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export const deleteFileFromFirebase = async (fileName) => {
  try {
    const storageRef = ref(storage, fileName);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Firebase 파일 삭제 에러:', error);
    throw new Error('파일 삭제에 실패했습니다.');
  }
};

/**
 * 파일 크기 검증 함수
 * @param {File} file - 검증할 파일
 * @param {number} maxSize - 최대 크기 (바이트, 기본값: 50MB)
 * @returns {boolean} 검증 결과
 */
export const validateFileSize = (file, maxSize = 50 * 1024 * 1024) => {
  return file.size <= maxSize;
};

/**
 * 파일 타입 검증 함수
 * @param {File} file - 검증할 파일
 * @param {Array} allowedTypes - 허용된 MIME 타입 배열
 * @returns {boolean} 검증 결과
 */
export const validateFileType = (file, allowedTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]) => {
  return allowedTypes.includes(file.type);
};
