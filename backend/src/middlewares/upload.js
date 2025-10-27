import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 이미지 파일인지 확인하는 함수
const isImageFile = (mimetype) => {
  return mimetype.startsWith('image/');
};

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 이미지 파일인지 확인
    const isImage = isImageFile(file.mimetype);
    
    // 폴더 경로 결정
    const folderPath = isImage 
      ? path.join(__dirname, '../../uploads/images/')
      : path.join(__dirname, '../../uploads/files/');
    
    // 폴더가 존재하지 않으면 생성
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    // 파일명: 타임스탬프_원본파일명
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 파일 필터링 (모든 파일 타입 허용)
const fileFilter = (req, file, cb) => {
  const isImage = isImageFile(file.mimetype);
  const folderType = isImage ? 'images' : 'files';
  
  console.log('파일 업로드:', {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    folderType: folderType
  });
  
  // 모든 파일 타입 허용
  return cb(null, true);
};

// multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB 제한
    fieldSize: 100 * 1024 * 1024, // 필드 크기 제한
  },
  fileFilter: fileFilter
});

// multer 에러 처리 미들웨어
const handleMulterError = (err, req, res, next) => {
  console.error('Multer 에러:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '파일 크기가 너무 큽니다. (최대 100MB)'
      });
    }
    if (err.code === 'LIMIT_FIELD_SIZE') {
      return res.status(400).json({
        success: false,
        message: '필드 크기가 너무 큽니다.'
      });
    }
  }
  
  next(err);
};

export { upload, handleMulterError };
