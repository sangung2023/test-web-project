# 로컬 파일 저장소 설정 가이드

Firebase Storage 대신 로컬 파일 시스템을 사용하도록 프로젝트를 설정하는 방법입니다.

## 1. 백엔드 설정

### 1.1 환경 변수 설정
`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database - 로컬 MySQL 설정
DATABASE_URL="mysql://root:password@localhost:3306/your_database_name"

# JWT
JWT_SECRET="your_jwt_secret_key_here"

# Server
PORT=3001
NODE_ENV=development
API_BASE_URL="http://localhost:3001"
```

**중요**: `your_database_name`, `password`, `your_jwt_secret_key_here` 부분을 실제 값으로 변경하세요.

### 1.2 업로드 디렉토리 생성
백엔드 프로젝트 루트에 `uploads` 디렉토리를 생성하세요:

```bash
cd backend
mkdir uploads
```

### 1.3 서버 실행
```bash
# 개발 모드로 서버 실행
npm run dev

# 또는 프로덕션 모드
npm start
```

## 2. 프론트엔드 설정

### 2.1 환경 변수 설정
`frontend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Base URL
REACT_APP_API_URL=http://localhost:3001
```

### 2.2 프론트엔드 실행
```bash
cd frontend
npm start
```

## 3. 파일 업로드 API 엔드포인트

### 3.1 단일 파일 업로드
```
POST /api/upload
Content-Type: multipart/form-data

Body: file (파일)
```

**응답 예시:**
```json
{
  "success": true,
  "message": "파일이 성공적으로 업로드되었습니다.",
  "fileName": "1703123456789-123456789-original.jpg",
  "originalName": "original.jpg",
  "url": "http://localhost:3001/uploads/1703123456789-123456789-original.jpg",
  "size": 1024000,
  "mimetype": "image/jpeg"
}
```

### 3.2 여러 파일 업로드
```
POST /api/upload/multiple
Content-Type: multipart/form-data

Body: files[] (파일 배열)
```

### 3.3 파일 삭제
```
DELETE /api/upload/:fileName
```

## 4. 지원하는 파일 형식

- **이미지**: jpeg, jpg, png, gif
- **문서**: pdf, doc, docx, txt
- **최대 파일 크기**: 50MB

## 5. 파일 접근

업로드된 파일들은 다음 URL로 접근할 수 있습니다:
```
http://localhost:3001/uploads/[파일명]
```

예시:
```
http://localhost:3001/uploads/1703123456789-123456789-image.jpg
```

## 6. 보안 고려사항

### 6.1 파일 타입 검증
- 서버에서 파일 확장자와 MIME 타입을 검증합니다
- 허용되지 않는 파일 형식은 업로드가 거부됩니다

### 6.2 파일 크기 제한
- 단일 파일 최대 크기: 50MB
- 필드 크기 제한: 50MB

### 6.3 파일명 보안
- 업로드된 파일은 고유한 이름으로 저장됩니다
- 원본 파일명은 데이터베이스에 별도로 저장됩니다

## 7. 문제 해결

### 7.1 업로드 디렉토리 권한 오류
```bash
# Windows
# uploads 폴더에 쓰기 권한이 있는지 확인

# macOS/Linux
chmod 755 backend/uploads
```

### 7.2 파일 업로드 실패
1. 파일 크기가 50MB를 초과하지 않는지 확인
2. 지원되는 파일 형식인지 확인
3. 서버 로그에서 오류 메시지 확인

### 7.3 파일 접근 불가
1. 서버가 실행 중인지 확인
2. 정적 파일 서빙 설정이 올바른지 확인
3. 파일 경로가 정확한지 확인

## 8. 프로덕션 배포 시 고려사항

### 8.1 파일 저장 위치
- 프로덕션에서는 외부 스토리지(예: AWS S3, Google Cloud Storage) 사용 권장
- 로컬 파일 시스템은 개발/테스트 환경에만 적합

### 8.2 백업 전략
- 업로드된 파일들의 정기적인 백업 필요
- 데이터베이스와 파일 시스템 모두 백업

### 8.3 성능 최적화
- CDN 사용 고려
- 이미지 리사이징 및 압축
- 파일 캐싱 전략

## 9. 마이그레이션 가이드

### 9.1 Firebase Storage에서 로컬로 마이그레이션
1. 기존 Firebase Storage 파일들을 다운로드
2. 로컬 uploads 디렉토리에 저장
3. 데이터베이스의 파일 URL 업데이트

### 9.2 데이터베이스 스키마 변경
현재 스키마는 그대로 유지됩니다:
- `image`: 파일 URL
- `imageName`: 저장된 파일명
- `originalImageName`: 원본 파일명
