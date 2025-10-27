import express from 'express';
import { upload, handleMulterError } from '../middlewares/upload.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 단일 파일 업로드
router.post('/', upload.single('file'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '파일이 제공되지 않았습니다.'
      });
    }

    // 이미지 파일인지 확인
    const isImage = req.file.mimetype.startsWith('image/');
    const folderPath = isImage ? 'images' : 'files';
    
    // 파일 URL 생성 (새로운 폴더 구조 반영)
    const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
    const fileUrl = `${baseURL}/uploads/${folderPath}/${req.file.filename}`;

    console.log('파일 업로드 완료:', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      folderPath: folderPath,
      url: fileUrl
    });

    res.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('파일 업로드 에러:', error);
    res.status(500).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.'
    });
  }
});

// 여러 파일 업로드
router.post('/multiple', upload.array('files', 10), handleMulterError, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '파일이 제공되지 않았습니다.'
      });
    }

    const baseURL = process.env.API_BASE_URL || 'http://localhost:5000';
    const uploadedFiles = req.files.map(file => {
      const isImage = file.mimetype.startsWith('image/');
      const folderPath = isImage ? 'images' : 'files';
      
      return {
        fileName: file.filename,
        originalName: file.originalname,
        url: `${baseURL}/uploads/${folderPath}/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      message: '파일들이 성공적으로 업로드되었습니다.',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('다중 파일 업로드 에러:', error);
    res.status(500).json({
      success: false,
      message: '파일 업로드 중 오류가 발생했습니다.'
    });
  }
});

// 파일 삭제
router.delete('/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    
    // 이미지 파일인지 확인하여 적절한 폴더에서 삭제
    const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(fileName);
    const folderPath = isImage ? 'images' : 'files';
    const filePath = path.join(__dirname, '../../uploads', folderPath, fileName);

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '파일을 찾을 수 없습니다.'
      });
    }

    // 파일 삭제
    fs.unlinkSync(filePath);

    console.log(`파일 삭제 완료: ${folderPath}/${fileName}`);

    res.json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('파일 삭제 에러:', error);
    res.status(500).json({
      success: false,
      message: '파일 삭제 중 오류가 발생했습니다.'
    });
  }
});

export default router;
