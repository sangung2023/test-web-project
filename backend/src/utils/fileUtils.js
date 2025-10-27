import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 파일 삭제 유틸리티
 */
export class FileUtils {
  /**
   * 파일 삭제
   * @param {string} filePath - 삭제할 파일 경로
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async deleteFile(filePath) {
    try {
      if (!filePath) {
        return true; // 파일 경로가 없으면 삭제할 필요 없음
      }

      // 상대 경로를 절대 경로로 변환
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(__dirname, '../../', filePath);

      // 파일 존재 확인
      if (!fs.existsSync(absolutePath)) {
        console.log(`파일이 존재하지 않습니다: ${absolutePath}`);
        return true; // 파일이 없으면 삭제 성공으로 간주
      }

      // 파일 삭제
      await fs.promises.unlink(absolutePath);
      console.log(`✅ 파일 삭제 성공: ${absolutePath}`);
      return true;
    } catch (error) {
      console.error(`❌ 파일 삭제 실패: ${filePath}`, error);
      return false;
    }
  }

  /**
   * 파일이 이미지인지 확인
   * @param {string} fileName - 파일명
   * @returns {boolean} 이미지 파일 여부
   */
  static isImageFile(fileName) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const ext = path.extname(fileName).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * 게시글의 이미지 파일 삭제
   * @param {Object} board - 게시글 객체
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async deleteBoardImages(board) {
    if (!board) {
      console.log('게시글 객체가 없습니다.');
      return true;
    }

    console.log('🗑️ 게시글 이미지 삭제 시작:', {
      boardId: board.boardId,
      image: board.image,
      imageName: board.imageName,
      originalImageName: board.originalImageName
    });

    let allDeleted = true;

    // 이미지 파일 경로가 있다면 삭제
    if (board.image) {
      console.log(`이미지 경로 삭제 시도: ${board.image}`);
      const result = await this.deleteFile(board.image);
      allDeleted = allDeleted && result;
    }

    // imageName이 있으면 적절한 폴더에서 해당 파일 삭제
    if (board.imageName) {
      const isImage = this.isImageFile(board.imageName);
      const folderPath = isImage ? 'uploads/images' : 'uploads/files';
      const uploadsPath = path.join(__dirname, '../../', folderPath, board.imageName);
      console.log(`${folderPath} 폴더 파일 삭제 시도: ${uploadsPath}`);
      const result = await this.deleteFile(uploadsPath);
      allDeleted = allDeleted && result;
    }

    // originalImageName도 확인해서 삭제
    if (board.originalImageName && board.originalImageName !== board.imageName) {
      const isImage = this.isImageFile(board.originalImageName);
      const folderPath = isImage ? 'uploads/images' : 'uploads/files';
      const originalPath = path.join(__dirname, '../../', folderPath, board.originalImageName);
      console.log(`원본 파일명으로 삭제 시도: ${originalPath}`);
      const result = await this.deleteFile(originalPath);
      allDeleted = allDeleted && result;
    }

    // imageName이 null이지만 image URL에서 파일명을 추출해서 삭제 시도
    if (!board.imageName && board.image) {
      try {
        const url = new URL(board.image);
        const fileName = path.basename(url.pathname);
        if (fileName) {
          const isImage = this.isImageFile(fileName);
          const folderPath = isImage ? 'uploads/images' : 'uploads/files';
          const uploadsPath = path.join(__dirname, '../../', folderPath, fileName);
          console.log(`URL에서 추출한 파일명으로 삭제 시도: ${uploadsPath}`);
          const result = await this.deleteFile(uploadsPath);
          allDeleted = allDeleted && result;
        }
      } catch (error) {
        console.log('URL 파싱 실패:', error.message);
      }
    }

    console.log(`게시글 ${board.boardId} 이미지 삭제 완료. 성공: ${allDeleted}`);
    return allDeleted;
  }

  /**
   * uploads 폴더의 고아 파일들 정리
   * @returns {Promise<{deleted: number, errors: string[]}>}
   */
  static async cleanupOrphanFiles() {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads');
      const imagesDir = path.join(__dirname, '../../uploads/images');
      const filesDir = path.join(__dirname, '../../uploads/files');
      
      const errors = [];
      let deleted = 0;

      // 기존 uploads 폴더의 파일들 정리 (이전 구조)
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log(`🔍 기존 uploads 폴더에서 ${files.length}개 파일 확인 중...`);

        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          
          try {
            // 파일이 실제 파일인지 확인
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              console.log(`🗑️ 기존 고아 파일 삭제: ${file}`);
              await fs.promises.unlink(filePath);
              deleted++;
            }
          } catch (error) {
            console.error(`❌ 파일 삭제 실패: ${file}`, error);
            errors.push(`${file}: ${error.message}`);
          }
        }
      }

      // images 폴더의 고아 파일들 정리
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        console.log(`🔍 images 폴더에서 ${files.length}개 파일 확인 중...`);

        for (const file of files) {
          const filePath = path.join(imagesDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              console.log(`🗑️ 이미지 고아 파일 삭제: ${file}`);
              await fs.promises.unlink(filePath);
              deleted++;
            }
          } catch (error) {
            console.error(`❌ 이미지 파일 삭제 실패: ${file}`, error);
            errors.push(`images/${file}: ${error.message}`);
          }
        }
      }

      // files 폴더의 고아 파일들 정리
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        console.log(`🔍 files 폴더에서 ${files.length}개 파일 확인 중...`);

        for (const file of files) {
          const filePath = path.join(filesDir, file);
          
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              console.log(`🗑️ 파일 고아 파일 삭제: ${file}`);
              await fs.promises.unlink(filePath);
              deleted++;
            }
          } catch (error) {
            console.error(`❌ 파일 삭제 실패: ${file}`, error);
            errors.push(`files/${file}: ${error.message}`);
          }
        }
      }

      console.log(`✅ 고아 파일 정리 완료: ${deleted}개 삭제, ${errors.length}개 오류`);
      return { deleted, errors };
    } catch (error) {
      console.error('❌ 고아 파일 정리 중 오류:', error);
      return { deleted: 0, errors: [error.message] };
    }
  }
}
