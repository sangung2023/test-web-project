# Firebase Storage 설정 가이드

이 프로젝트는 Firebase Storage를 사용하여 이미지와 파일을 저장합니다.

## 1. Firebase 프로젝트 설정

### 1.1 Firebase 콘솔에서 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 및 설정 완료

### 1.2 Storage 활성화
1. Firebase 콘솔에서 "Storage" 메뉴 클릭
2. "시작하기" 클릭
3. 보안 규칙 설정 (개발용으로는 모든 읽기/쓰기 허용 가능)
4. 위치 선택 (asia-northeast3 권장)

## 2. 백엔드 설정

### 2.1 서비스 계정 키 생성
1. Firebase 콘솔 → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드

### 2.2 환경 변수 설정
`backend/.env` 파일을 생성하고 다음 내용을 추가:

```env
# Database
DATABASE_URL="your_database_url"

# JWT
JWT_SECRET="your_jwt_secret_key"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="your-client-id"

# Server
PORT=3001
```

## 3. 프론트엔드 설정

### 3.1 웹 앱 등록
1. Firebase 콘솔 → 프로젝트 설정 → 일반
2. "웹 앱 추가" 클릭
3. 앱 닉네임 입력
4. Firebase SDK 설정 정보 복사

### 3.2 환경 변수 설정
`frontend/.env` 파일을 생성하고 다음 내용을 추가:

```env
# Firebase 설정
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# API Base URL
REACT_APP_API_BASE_URL=http://localhost:3001
```

## 4. 보안 규칙 설정

### 4.1 Storage 보안 규칙
Firebase 콘솔 → Storage → 규칙에서 다음 규칙 설정:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 모든 인증된 사용자가 읽기/쓰기 가능
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // 또는 공개 읽기, 인증된 사용자만 쓰기
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. 사용법

### 5.1 백엔드
- 파일 업로드: `POST /api/boards` (이미지), `POST /api/supports` (파일)
- 자동으로 Firebase Storage에 업로드되고 URL이 데이터베이스에 저장됩니다.

### 5.2 프론트엔드
- 게시판: 이미지 파일 선택 시 자동으로 Firebase Storage에 업로드
- 문의: 첨부파일 선택 시 자동으로 Firebase Storage에 업로드

## 6. 지원 파일 형식

### 이미지 (게시판)
- JPEG, JPG, PNG, GIF
- 최대 크기: 50MB

### 파일 (문의)
- JPEG, JPG, PNG, GIF, PDF, DOC, DOCX, TXT
- 최대 크기: 50MB

## 7. 문제 해결

### 7.1 CORS 오류
Firebase Storage는 CORS를 지원하므로 별도 설정이 필요하지 않습니다.

### 7.2 권한 오류
- Firebase 콘솔에서 Storage 보안 규칙 확인
- 서비스 계정 키가 올바르게 설정되었는지 확인

### 7.3 업로드 실패
- 파일 크기 제한 확인 (50MB)
- 지원되는 파일 형식인지 확인
- 네트워크 연결 상태 확인

## 8. 비용 고려사항

Firebase Storage는 사용량에 따라 요금이 부과됩니다:
- 저장: $0.026/GB/월
- 다운로드: $0.12/GB
- 작업: $0.05/10,000회

개발 및 테스트 시에는 무료 할당량이 제공됩니다.
