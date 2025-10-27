import { FileUtils } from '../utils/fileUtils.js';
import { AppError } from '../exceptions/AppError.js';

export class FileController {
  // uploads 폴더 통계 조회
  getUploadsStats = async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const uploadsDir = path.join(__dirname, '../../uploads');
      const imagesDir = path.join(__dirname, '../../uploads/images');
      const filesDir = path.join(__dirname, '../../uploads/files');
      
      let totalFileCount = 0;
      let totalSize = 0;
      let imageCount = 0;
      let fileCount = 0;
      let imageSize = 0;
      let fileSize = 0;
      
      // 기존 uploads 폴더 통계
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            totalFileCount++;
            totalSize += stats.size;
          }
        }
      }
      
      // images 폴더 통계
      if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        for (const file of files) {
          const filePath = path.join(imagesDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            imageCount++;
            imageSize += stats.size;
            totalFileCount++;
            totalSize += stats.size;
          }
        }
      }
      
      // files 폴더 통계
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        for (const file of files) {
          const filePath = path.join(filesDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            fileCount++;
            fileSize += stats.size;
            totalFileCount++;
            totalSize += stats.size;
          }
        }
      }
      
      res.status(200).json({
        success: true,
        data: {
          total: {
            fileCount: totalFileCount,
            totalSize,
            totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
          },
          images: {
            fileCount: imageCount,
            totalSize: imageSize,
            totalSizeMB: Math.round(imageSize / (1024 * 1024) * 100) / 100
          },
          files: {
            fileCount: fileCount,
            totalSize: fileSize,
            totalSizeMB: Math.round(fileSize / (1024 * 1024) * 100) / 100
          }
        }
      });
    } catch (error) {
      console.error('uploads 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: 'uploads 통계 조회 중 오류가 발생했습니다.'
      });
    }
  };

  // 고아 파일 정리
  cleanupOrphanFiles = async (req, res) => {
    try {
      console.log('🧹 고아 파일 정리 요청 받음');
      
      const result = await FileUtils.cleanupOrphanFiles();
      
      res.status(200).json({
        success: true,
        message: '고아 파일 정리가 완료되었습니다.',
        data: {
          deleted: result.deleted,
          errors: result.errors
        }
      });
    } catch (error) {
      console.error('고아 파일 정리 오류:', error);
      res.status(500).json({
        success: false,
        message: '고아 파일 정리 중 오류가 발생했습니다.'
      });
    }
  };

  // 에러 처리
  handleError = (error, res) => {
    console.error('FileController Error:', error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        status: error.status
      });
    }

    res.status(500).json({
      success: false,
      message: '서버 내부 오류가 발생했습니다.',
      status: 'error'
    });
  };
}
