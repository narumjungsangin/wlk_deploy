import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextRequest, NextResponse } from 'next/server';

// 로그인 시도 제한 (5분에 5회)
export const loginLimiter = new RateLimiterMemory({
  keyPrefix: 'login',
  points: 5,
  duration: 5 * 60,
});

// 회원가입 제한 (1시간에 3회)
export const registerLimiter = new RateLimiterMemory({
  keyPrefix: 'register',
  points: 3,
  duration: 60 * 60,
});

// 파일 업로드 제한 (1분에 10개)
export const uploadLimiter = new RateLimiterMemory({
  keyPrefix: 'upload',
  points: 10,
  duration: 60,
});

// 일반 API 요청 제한 (1분에 60회)
export const apiLimiter = new RateLimiterMemory({
  keyPrefix: 'api',
  points: 60,
  duration: 60,
});

// IP 주소 추출
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  
  // 개발 환경에서는 더미 IP 반환
  return '127.0.0.1';
}

// Rate limiter 래퍼 함수
export async function checkRateLimit(
  limiter: RateLimiterMemory,
  req: NextRequest,
  customKey?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const key = customKey || getClientIp(req);
  
  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        ),
      };
    }
    // 에러 발생 시 허용 (graceful degradation)
    return { allowed: true };
  }
}

// 미들웨어 스타일 rate limiter
export function createRateLimitMiddleware(limiter: RateLimiterMemory) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const result = await checkRateLimit(limiter, req);
    return result.response || null;
  };
}
