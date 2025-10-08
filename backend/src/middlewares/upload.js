import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    // 파일명: 타임스탬프_원본파일명
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 파일 필터링
const fileFilter = (req, file, cb) => {
  // 허용할 파일 타입
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다. (jpeg, jpg, png, gif, pdf, doc, docx, txt만 허용)'));
  }
};

// multer 설정
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한
    fieldSize: 50 * 1024 * 1024, // 필드 크기 제한
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
        message: '파일 크기가 너무 큽니다. (최대 50MB)'
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
