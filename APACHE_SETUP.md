# Apache 서버 배포 설정 가이드

## Apache VirtualHost 설정

Apache 서버에 배포할 때 다음과 같이 설정하세요:

### 1. Apache VirtualHost 설정 파일

`/etc/apache2/sites-available/your-site.conf` 또는 `/etc/httpd/conf.d/your-site.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/your-project/frontend/build

    # 프론트엔드 React 앱 (정적 파일)
    <Directory /path/to/your-project/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 백엔드 API 프록시 (/api/*)
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api

    # 업로드된 이미지/파일 프록시 (/uploads/*)
    # 옵션 1: 백엔드 서버로 프록시 (권장)
    ProxyPass /uploads http://localhost:5000/uploads
    ProxyPassReverse /uploads http://localhost:5000/uploads

    # 옵션 2: Apache가 직접 서빙 (백엔드 업로드 폴더를 심볼릭 링크)
    # Alias /uploads /path/to/your-project/backend/uploads
    # <Directory /path/to/your-project/backend/uploads>
    #     Options -Indexes +FollowSymLinks
    #     AllowOverride None
    #     Require all granted
    # </Directory>

    # 로그 파일
    ErrorLog ${APACHE_LOG_DIR}/your-site-error.log
    CustomLog ${APACHE_LOG_DIR}/your-site-access.log combined
</VirtualHost>
```

### 2. Apache 모듈 활성화

```bash
# 프록시 모듈 활성화
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers

# 설정 적용
sudo systemctl restart apache2
# 또는
sudo systemctl restart httpd
```

### 3. 백엔드 서버 설정

백엔드는 PM2나 systemd로 관리하는 것을 권장합니다:

#### PM2 사용:
```bash
cd /path/to/your-project/backend
npm install -g pm2
pm2 start server.js --name "backend-api"
pm2 save
pm2 startup
```

#### systemd 사용:
`/etc/systemd/system/backend-api.service`:
```ini
[Unit]
Description=Backend API Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/your-project/backend
Environment="NODE_ENV=production"
Environment="PORT=5000"
Environment="DATABASE_URL=mysql://user:password@localhost:3306/database"
ExecStart=/usr/bin/node /path/to/your-project/backend/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable backend-api
sudo systemctl start backend-api
```

### 4. 환경 변수 설정

#### 백엔드 `.env` 파일:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:password@localhost:3306/database
JWT_SECRET=your-secret-key
FRONTEND_URL=http://your-domain.com
```

#### 프론트엔드 빌드 전 `.env` 파일:
```env
REACT_APP_API_URL=
# 또는 빈 값으로 두면 상대 경로 사용
```

### 5. 파일 권한 설정

```bash
# 업로드 폴더 권한 설정
sudo chown -R www-data:www-data /path/to/your-project/backend/uploads
sudo chmod -R 755 /path/to/your-project/backend/uploads
```

### 6. 프론트엔드 빌드

```bash
cd /path/to/your-project/frontend
npm run build
# build 폴더를 Apache DocumentRoot로 설정
```

## 주요 설정 포인트

1. **이미지 URL**: 백엔드에서 `/uploads/images/...` 형식으로 반환
2. **프론트엔드**: 개발 환경에서는 `http://localhost:5000/uploads/...` 사용, 배포 환경에서는 `/uploads/...` 상대 경로 사용
3. **Apache 프록시**: `/api/*`와 `/uploads/*`를 백엔드 서버로 프록시
4. **CORS**: 백엔드에서 배포 도메인을 허용하도록 설정

## 문제 해결

### 이미지가 안 보이는 경우:
1. Apache 프록시 설정 확인 (`/uploads` 경로가 백엔드로 프록시되는지)
2. 백엔드 서버가 실행 중인지 확인
3. 파일 권한 확인
4. 브라우저 개발자 도구 네트워크 탭에서 이미지 요청 확인

### CORS 에러:
1. 백엔드 `.env`의 `FRONTEND_URL` 설정 확인
2. Apache 헤더 설정 확인

