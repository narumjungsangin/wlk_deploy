# 웹사이트 재배포 가이드

데이터베이스 마이그레이션 후 웹사이트에 변경사항을 반영하려면 재배포가 필요합니다.

## Hostinger 재배포 방법

### 방법 1: Hostinger cPanel에서 재배포
1. **Hostinger cPanel에 로그인**
2. **호스팅 → 관리** 클릭
3. **고급 → Node.js 선택** 또는 **파일 관리자**
4. **프로젝트 폴더에서 다시 배포** 또는 **재시작** 버튼 클릭

### 방법 2: Git 기반 배포 (Git 연동된 경우)
```bash
git add .
git commit -m "Add migrated legacy data"
git push origin main
```

### 방법 3: 수동 재배포
1. **Hostinger 파일 관리자 접속**
2. **프로젝트 파일 업로드**
3. **package.json 설치**: `npm install`
4. **빌드 실행**: `npm run build`
5. **서버 재시작**

### 방법 4: Docker 사용 시
```bash
# 호스팅 서버에서 Docker 컨테이너 재시작
docker-compose down
docker-compose up -d --build
```

## 재배포 후 확인

1. **웹사이트 접속**
2. **관리자 계정 로그인**:
   - 이메일: admin@wlafayettekorea.org
   - 비밀번호: admin123
3. **게시판 확인**:
   - 정보나눔터: 1개 게시물
   - 구인구직: 2개 게시물
   - 과외: 9개 게시물
   - Housing: 2개 게시물
   - FAQ: 2개 게시물

## 문제 해결

### 데이터가 보이지 않을 경우
1. **데이터베이스 연결 확인**: .env 파일의 DATABASE_URL 확인
2. **서버 로그 확인**: Hostinger cPanel → 오류 로그
3. **캐시 삭제**: 브라우저 캐시 및 CDN 캐시 삭제

### 로그인이 안될 경우
1. **이메일 확인**: admin@wlafayettekorea.org
2. **비밀번호 확인**: admin123
3. **데이터베이스에 사용자 확인**: 
   ```sql
   SELECT * FROM User WHERE email = 'admin@wlafayettekorea.org';
   ```

## 가장 간단한 방법
**Hostinger cPanel → 호스팅 관리 → Node.js → 재시작** 버튼 클릭

재배포가 완료되면 웹사이트에서 마이그레이션된 데이터를 바로 확인할 수 있습니다.
