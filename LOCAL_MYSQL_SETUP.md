# 로컬 MySQL 설정 가이드

AWS RDS 대신 로컬 MySQL을 사용하도록 프로젝트를 설정하는 방법입니다.

## 1. MySQL 설치

### Windows
1. [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) 다운로드
2. MySQL Installer 실행
3. "Developer Default" 옵션 선택
4. 설치 과정에서 root 비밀번호 설정 (예: `password`)

### macOS
```bash
# Homebrew 사용
brew install mysql
brew services start mysql

# 또는 MySQL 공식 설치 프로그램 사용
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## 2. 데이터베이스 생성

MySQL에 접속하여 데이터베이스를 생성합니다:

```sql
-- MySQL 접속
mysql -u root -p

-- 데이터베이스 생성
CREATE DATABASE your_database_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 (선택사항)
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;

-- 데이터베이스 확인
SHOW DATABASES;
```

## 3. 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database - 로컬 MySQL 설정
DATABASE_URL="mysql://root:password@localhost:3306/your_database_name"

# JWT
JWT_SECRET="your_jwt_secret_key_here"

# Firebase Admin SDK (기존 설정 유지)
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="your-client-id"

# Server
PORT=3001
NODE_ENV=development
```

**중요**: `your_database_name`, `password`, `your_jwt_secret_key_here` 부분을 실제 값으로 변경하세요.

## 4. Prisma 마이그레이션 실행

백엔드 디렉토리에서 다음 명령어를 실행하세요:

```bash
cd backend

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 스키마 적용
npm run db:push

# 또는 마이그레이션 사용 (권장)
npm run db:migrate
```

## 5. 서버 실행

```bash
# 개발 모드로 서버 실행
npm run dev

# 또는 프로덕션 모드
npm start
```

## 6. 연결 확인

서버가 시작되면 다음과 같은 메시지가 표시되어야 합니다:
```
✅ 로컬 MySQL 데이터베이스 연결이 성공적으로 설정되었습니다.
🚀 서버가 포트 3001에서 실행 중입니다.
```

## 7. 문제 해결

### 연결 오류가 발생하는 경우:
1. MySQL 서비스가 실행 중인지 확인
2. 포트 3306이 사용 가능한지 확인
3. 사용자명과 비밀번호가 올바른지 확인
4. 데이터베이스가 존재하는지 확인

### Windows에서 MySQL 서비스 확인:
```cmd
# 서비스 상태 확인
sc query mysql

# 서비스 시작
net start mysql
```

### macOS/Linux에서 MySQL 서비스 확인:
```bash
# 서비스 상태 확인
brew services list | grep mysql
# 또는
sudo systemctl status mysql

# 서비스 시작
brew services start mysql
# 또는
sudo systemctl start mysql
```

## 8. Prisma Studio (선택사항)

데이터베이스 내용을 시각적으로 확인하려면:

```bash
cd backend
npm run db:studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터베이스 내용을 확인할 수 있습니다.
