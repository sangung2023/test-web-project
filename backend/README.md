# Express Backend Server

Node.js Express 프레임워크를 사용한 백엔드 서버입니다.

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 서버 실행
```bash
npm start
```

## API 엔드포인트

### 기본 엔드포인트
- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크

### 사용자 API
- `GET /api/users` - 사용자 목록 조회
- `POST /api/users` - 새 사용자 생성

## 환경 변수

`.env` 파일을 생성하여 다음 변수들을 설정할 수 있습니다:

```
PORT=5000
NODE_ENV=development
```

## 서버 접속

서버가 실행되면 다음 URL로 접속할 수 있습니다:
- http://localhost:5000
- http://localhost:5000/api/health
