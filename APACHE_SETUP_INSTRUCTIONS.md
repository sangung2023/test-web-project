# Apache 설정 완료 가이드

## 현재 Apache 설정에 추가해야 할 내용

현재 Apache 설정 파일에 **`/uploads/` 경로 프록시 설정이 없어서** 이미지와 파일이 표시되지 않습니다.

다음 설정을 추가하세요:

### 1. Apache 설정 파일 수정

기존 Apache 설정 파일에 다음 두 줄을 추가하세요:

```apache
# 업로드된 이미지/파일 프록시 (/uploads/*)
ProxyPass /uploads/ http://localhost:5000/uploads/
ProxyPassReverse /uploads/ http://localhost:5000/uploads/
```

### 2. 완전한 Apache 설정 예시

`/etc/apache2/sites-available/my-project.conf` 파일을 다음과 같이 수정하세요:

```apache
<VirtualHost *:80>
    ServerName 10.1.9.40
    DocumentRoot /home/msw/test-web-project/frontend/build

    # 프록시 설정
    ProxyPreserveHost On
    ProxyRequests Off

    # 백엔드 API 프록시 (/api/*)
    ProxyPass /api/ http://localhost:5000/api/
    ProxyPassReverse /api/ http://localhost:5000/api/

    # ⭐ 중요: 업로드된 이미지/파일 프록시 (/uploads/*)
    ProxyPass /uploads/ http://localhost:5000/uploads/
    ProxyPassReverse /uploads/ http://localhost:5000/uploads/

    # 프론트엔드 React 앱 (정적 파일)
    <Directory /home/msw/test-web-project/frontend/build>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
        
        # SPA 라우팅을 위한 RewriteRule
        RewriteEngine On
        # /api/와 /uploads/는 프록시로 처리되므로 제외
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteCond %{REQUEST_URI} !^/uploads/
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # 로그 파일
    ErrorLog ${APACHE_LOG_DIR}/my-project-error.log
    CustomLog ${APACHE_LOG_DIR}/my-project-access.log combined
</VirtualHost>
```

### 3. Apache 모듈 확인 및 활성화

```bash
# 필요한 모듈 활성화
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Apache 설정 테스트
sudo apache2ctl configtest

# Apache 재시작
sudo systemctl restart apache2
# 또는
sudo systemctl restart httpd
```

### 4. 백엔드 서버 확인

백엔드 서버가 `localhost:5000`에서 실행 중인지 확인:

```bash
# 백엔드 서버 실행 확인
curl http://localhost:5000/api/health

# 업로드 폴더 확인
ls -la /home/msw/test-web-project/backend/uploads/
```

### 5. 파일 권한 설정

```bash
# 업로드 폴더 권한 설정
sudo chown -R www-data:www-data /home/msw/test-web-project/backend/uploads
sudo chmod -R 755 /home/msw/test-web-project/backend/uploads
```

## 동작 원리

1. **프론트엔드 요청**: `/uploads/images/파일명.jpg`
2. **Apache 프록시**: `http://localhost:5000/uploads/images/파일명.jpg`로 전달
3. **백엔드 서버**: 파일을 제공
4. **Apache**: 응답을 프론트엔드로 전달

## 문제 해결

### 이미지가 여전히 안 보이는 경우:

1. **Apache 설정 확인**:
   ```bash
   sudo apache2ctl -S  # 설정된 VirtualHost 확인
   ```

2. **프록시 로그 확인**:
   ```bash
   sudo tail -f /var/log/apache2/my-project-error.log
   ```

3. **백엔드 서버 확인**:
   ```bash
   # 백엔드 서버가 실행 중인지 확인
   ps aux | grep node
   
   # 또는 직접 테스트
   curl http://localhost:5000/uploads/images/파일명.jpg
   ```

4. **브라우저 개발자 도구 확인**:
   - Network 탭에서 이미지 요청 URL 확인
   - `/uploads/...` 경로로 요청이 가는지 확인
   - 응답 상태 코드 확인 (200이어야 함)

### CORS 에러가 발생하는 경우:

백엔드 `.env` 파일에 `FRONTEND_URL` 설정:

```env
FRONTEND_URL=http://10.1.9.40
```

