# West Lafayette Korea (웨스트 라파예트 한인 커뮤니티 플랫폼)

인디애나주 웨스트 라파예트(West Lafayette) 및 퍼듀 대학교(Purdue University) 한인 사회를 위한 커뮤니티 정보 공유 플랫폼입니다. 이 프로젝트는 다음 개발자 혹은 관리자가 손쉽게 프로젝트를 이해하고 유지보수할 수 있도록 설계 및 인프라가 정리되어 있습니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend & Web Framework
- **Next.js 16 (App Router)**: 최신 리액트 서버 컴포넌트(RSC) 패턴을 채용한 모던 프레임워크
- **React 19**: 최신 버전 리액트 라이브러리
- **TailwindCSS v4**: 유틸리티 퍼스트 CSS 프레임워크로 빠르고 일관된 디자인 시스템 적용

### Database & ORM
- **Prisma v7**: 타입 안정성이 보장된 ORM
- **MariaDB / MySQL**: 데이터 영속성 레이어
- **@prisma/adapter-mariadb**: Prisma 7과 MariaDB 커넥션 풀링을 원활하게 연결해 주는 전용 드라이버 어댑터

### Authentication
- **NextAuth.js v5 (Beta)**: 구글, 카카오 소셜 로그인 및 이메일/비밀번호 기반의 일반 자격증명(Credentials) 로그인 제공

---

## 📂 프로젝트 구조 (Project Structure)

```text
├── prisma/
│   ├── schema.prisma       # Prisma 데이터베이스 스키마 정의
│   └── migrations/         # DB 마이그레이션 히스토리
├── public/                 # 이미지, 로고, 광고 배너 등 정적 자산
├── scripts/
│   ├── crawled_data/       # 크롤링된 JSON 데이터 파일 보관소
│   ├── crawl_faq.py        # FAQ 크롤러 파이썬 스크립트
│   ├── crawl_legacy.py     # 기존 레거시 게시판 크롤러
│   └── generate_seed.py    # 크롤링된 데이터를 기반으로 seed-data.ts 변환 생성 스크립트
├── src/
│   ├── app/                # Next.js App Router (페이지 및 API 엔드포인트)
│   ├── components/         # 공통 UI 컴포넌트 (배너, 헤더, 푸터, 게시판 미리보기 등)
│   ├── generated/          # Prisma Client가 자동 생성되는 빌드 아웃풋 폴더
│   ├── lib/
│   │   ├── admin.ts        # 관리자 권한 확인 헬퍼 함수
│   │   ├── auth.ts         # NextAuth.js 설정 및 소셜/일반 로그인 콜백 비즈니스 로직
│   │   ├── categories.ts   # 사이트 전체 카테고리 정의 메타데이터
│   │   ├── prisma.ts       # 데이터베이스 어댑터 설정 및 Prisma Client 싱글톤 초기화
│   │   └── seed-data.ts    # 크롤링된 레거시 게시글 백업 데이터 (fallback static data)
│   └── types/              # 글로벌 타입 정의
├── prisma.config.ts        # Prisma 7 DB 연결 세부 구성 설정 파일
└── next.config.ts          # Next.js 프레임워크 빌드 및 환경 구성 파일
```

---

## 🔑 환경 변수 설정 (.env)

로컬 개발 환경 혹은 프로덕션 배포 시, 루트 경로에 `.env` 파일을 생성하고 아래 양식에 맞추어 변수를 설정해야 합니다. 자세한 내용은 `.env.example`을 참고하세요.

```env
# 데이터베이스 연결 주소 (MySQL / MariaDB 프로토콜 지원)
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth.js 시크릿 키 (보안용 난수 생성)
# 생성 커맨드: npx auth secret
AUTH_SECRET="your-random-secret-here"

# 앱 도메인 주소 (배포 주소 또는 로컬 개발 시 http://localhost:3000)
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth API 자격증명
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 카카오 OAuth API 자격증명
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

---

## 💾 데이터베이스 & Prisma 7 주요 유의사항

Prisma 7 버전 사용에 따른 아키텍처 상의 중요한 특징이 있습니다. 개발 시 반드시 숙지해 주세요.

1. **Prisma Schema 제약**: Prisma 7에서는 `schema.prisma` 파일 내부에 `url`을 직접 명시하지 않습니다.
2. **연결 설정**: 데이터베이스 연결 스트링 주소(`DATABASE_URL`) 및 커넥션 풀링 구성은 루트의 `prisma.config.ts` 파일에서 담당합니다.
3. **런타임 어댑터**: 런타임에 Prisma Client를 초기화할 때, `@prisma/adapter-mariadb` 드라이버 어댑터를 사용하여 `mariadb` 풀(Pool) 인스턴스를 동적으로 생성 및 주입합니다. 이 구현체는 `src/lib/prisma.ts`에 싱글톤 패턴으로 정의되어 있습니다.

### 마이그레이션 및 클라이언트 생성 명령어
```bash
# DB 스키마가 변경되었을 때 Prisma Client 재빌드
npx prisma generate

# 스키마 변경 사항을 로컬/원격 DB에 반영하고 마이그레이션 생성
npx prisma migrate dev --name <마이그레이션_이름>

# 프로덕션 서버 배포 시 마이그레이션 적용
npx prisma migrate deploy
```

---

## 🚀 개발 및 실행 가이드

### 의존성 패키지 설치
```bash
npm install
```

### 로컬 개발 서버 구동
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 로컬 사이트를 확인할 수 있습니다.

### 프로덕션 빌드 및 시작
```bash
# 코드 빌드 (정적 최적화 및 컴파일)
npm run build

# 빌드된 배포 프로덕션 서버 실행
npm run start
```

### 코드 스타일 및 린트 검사
```bash
npm run lint
```

---

## 👥 관리자 권한 및 계정 설정

커뮤니티 관리 기능 및 게시글 삭제 등 어드민 관련 접근은 `src/lib/auth.ts` 파일 내에 상수로 정의된 `ADMIN_EMAILS` 배열을 기준으로 판단합니다.

- **관리자 이메일 목록**: `ADMIN_EMAILS` 상수에 관리자의 이메일을 등록해 두면, 해당 이메일로 로그인(일반 또는 소셜 OAuth) 시 DB 상에서 자동으로 `Role`이 `ADMIN`으로 생성 및 업데이트됩니다.
- 관리자 등급 계정은 `/admin` 경로의 관리자 전용 대시보드에 접근할 수 있습니다.

---

## 🐍 크롤러 및 데이터 마이그레이션 스크립트

과거에 운영되던 레거시 게시판 데이터 및 FAQ 데이터를 파싱하여 백업/시드 데이터로 활용하는 파이썬 스크립트 모음입니다. `scripts` 폴더 내에 위치합니다.

1. **FAQ 크롤링**: `python scripts/crawl_faq.py`
2. **레거시 게시판 크롤링**: `python scripts/crawl_legacy.py`
3. **시드 데이터 변환**: `python scripts/generate_seed.py`
   - 크롤러를 통해 얻은 `scripts/crawled_data/` 폴더 내의 JSON 형식 데이터를 바탕으로, Next.js 앱에서 static fallback으로 직접 사용할 수 있도록 `src/lib/seed-data.ts` 파일을 자동 생성해 주는 역할을 합니다.

