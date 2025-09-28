# Suricata Rule Generator

MCP를 활용한 Suricata Rule 생성 AI 웹사이트

## 프로젝트 구조

```
├── frontend/          # React 프론트엔드
├── backend/           # Express 백엔드 API
├── package.json       # 루트 package.json
└── README.md
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm run install:all
```

### 2. 개발 서버 실행
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:frontend  # 프론트엔드만
npm run dev:backend   # 백엔드만
```

## API 엔드포인트

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000

## 배포

### 프론트엔드 빌드
```bash
npm run build:frontend
```

### 백엔드 실행
```bash
npm run start:backend
```

## 기술 스택

### Frontend
- React 19.1.1
- TypeScript
- CSS3

### Backend
- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- bcrypt

## 주요 기능

- 사용자 인증 (로그인/회원가입)
- 게시판 기능
- 지원 시스템
- Suricata Rule 생성 AI
