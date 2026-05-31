# Vercel 500 에러 해결 가이드

## 문제 원인
Vercel은 서버리스 환경이라 데이터베이스 연결에 특별한 설정이 필요합니다. 500 에러는 보통 환경 변수 설정 문제입니다.

## 해결 방법

### 1. Vercel 환경 변수 설정
1. **Vercel Dashboard 접속**
2. **프로젝트 선택 → Settings → Environment Variables**
3. **다음 환경 변수 추가**:

```
DATABASE_URL=mysql://u102210330_wlk:your_password@srv1627.hstgr.io:3306/u102210330_wlk

AUTH_SECRET=your_auth_secret_here
NEXTAUTH_URL=https://wlk-deploy-gyd3wpr50-junsus-projects-f2597ce7.vercel.app

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

RESEND_API_KEY=your_resend_api_key
RESEND_FROM=noreply@yourdomain.com
```

### 2. AUTH_SECRET 생성
```bash
npx auth secret
# 또는
openssl rand -base64 32
```

### 3. Vercel 재배포
환경 변수 설정 후 자동으로 재배포되거나 수동으로 재배포:
```bash
vercel --prod
```

### 4. 데이터베이스 연결 테스트
아래 코드로 데이터베이스 연결 확인:

```typescript
// src/app/api/test-db/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.post.count();
    return NextResponse.json({ 
      message: 'Database connected', 
      postCount: count 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error.message 
    }, { status: 500 });
  }
}
```

### 5. 테스트
`https://your-domain.vercel.app/api/test-db` 접속하여 확인

## 일반적인 문제들

### 1. 데이터베이스 호스트 접근 문제
- Hostinger 데이터베이스가 외부 접근을 허용하는지 확인
- 필요시 Vercel IP 허용 목록에 추가

### 2. Prisma Client 생성 문제
Vercel에서 Prisma Client가 제대로 생성되지 않을 수 있습니다:

```bash
# 로컬에서 Prisma Client 재생성
npx prisma generate
```

### 3. 빌드 오류
```bash
# 빌드 테스트
npm run build
```

## 긴급 해결책

### 임시 방법: 로컬 데이터베이스 사용
테스트를 위해 임시로 로컬 데이터베이스 사용:

1. **Vercel 환경 변수 변경**:
```
DATABASE_URL=mysql://root:password@localhost:3306/wlk_db
```

2. **로컬에서 테스트 후 실제 데이터베이스로 변경**

## 확인 단계

1. **Vercel Functions 로그 확인**
2. **환경 변수 모두 설정되었는지 확인**
3. **데이터베이스 외부 접속 가능 여부 확인**
4. **Prisma Client 정상 생성 확인**

가장 흔한 원인은 **DATABASE_URL 환경 변수가 Vercel에 설정되지 않은 경우**입니다.
