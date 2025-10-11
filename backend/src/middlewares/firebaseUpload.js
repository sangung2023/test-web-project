import multer from 'multer';
import { getStorageBucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// 메모리 스토리지 사용 (Firebase에 직접 업로드하기 위해)
const storage = multer.memoryStorage();

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

// Firebase Storage에 파일 업로드하는 함수
const uploadToFirebase = async (file, folder = 'uploads') => {
  try {
    const bucket = getStorageBucket();
    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Firebase 업로드 에러:', error);
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // 파일을 공개적으로 접근 가능하도록 설정
          await fileUpload.makePublic();
          
          // 공개 URL 생성
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          
          resolve({
            fileName: fileName,
            originalName: file.originalname,
            publicUrl: publicUrl,
            size: file.size,
            mimetype: file.mimetype
          });
        } catch (error) {
          console.error('파일 공개 설정 에러:', error);
          reject(error);
        }
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Firebase 업로드 에러:', error);
    throw error;
  }
};

// 여러 파일을 Firebase Storage에 업로드하는 함수
const uploadMultipleToFirebase = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadToFirebase(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('다중 파일 업로드 에러:', error);
    throw error;
  }
};

// Firebase Storage에서 파일 삭제하는 함수
const deleteFromFirebase = async (fileName) => {
  try {
    const bucket = getStorageBucket();
    const file = bucket.file(fileName);
    
    await file.delete();
    return true;
  } catch (error) {
    console.error('Firebase 파일 삭제 에러:', error);
    throw error;
  }
};

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

export { 
  upload, 
  handleMulterError, 
  uploadToFirebase, 
  uploadMultipleToFirebase, 
  deleteFromFirebase 
};
