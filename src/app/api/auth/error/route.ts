import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl');
  
  console.log('Auth error page accessed:', {
    error,
    callbackUrl,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    timestamp: new Date().toISOString()
  });

  // 모든 환경 변수 확인
  const envVars = {
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'NOT_SET',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID ? 'SET' : 'NOT_SET',
    KAKAO_CLIENT_SECRET: process.env.KAKAO_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
  };

  console.log('Environment variables:', envVars);

  // 에러 메시지 생성
  let errorMessage = '알 수 없는 오류가 발생했습니다.';
  
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      break;
    case 'OAuthSignin':
      errorMessage = 'OAuth 로그인 중 오류가 발생했습니다.';
      break;
    case 'OAuthCallback':
      errorMessage = 'OAuth 콜백 처리 중 오류가 발생했습니다.';
      break;
    case 'OAuthCreateAccount':
      errorMessage = '계정 생성 중 오류가 발생했습니다.';
      break;
    case 'EmailCreateAccount':
      errorMessage = '이메일 계정 생성 중 오류가 발생했습니다.';
      break;
    case 'Callback':
      errorMessage = '콜백 처리 중 오류가 발생했습니다.';
      break;
    case 'OAuthAccountNotLinked':
      errorMessage = '이미 다른 제공업체에 연결된 계정입니다.';
      break;
    case 'SessionRequired':
      errorMessage = '로그인이 필요합니다.';
      break;
    case 'Default':
      errorMessage = '로그인 중 오류가 발생했습니다.';
      break;
  }

  // 디버깅 정보를 포함한 HTML 응답
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>로그인 오류</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .error { color: red; }
        .debug { background: #f5f5f5; padding: 20px; margin: 20px 0; }
        pre { white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1 class="error">로그인 오류</h1>
      <p><strong>오류:</strong> ${errorMessage}</p>
      <p><strong>오류 코드:</strong> ${error}</p>
      <p><strong>콜백 URL:</strong> ${callbackUrl || '없음'}</p>
      
      <div class="debug">
        <h3>디버깅 정보:</h3>
        <pre>환경 변수: ${JSON.stringify(envVars, null, 2)}</pre>
        <pre>현재 시간: ${new Date().toISOString()}</pre>
        <pre>요청 URL: ${request.url}</pre>
      </div>
      
      <p><a href="/login">로그인 페이지로 돌아가기</a></p>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html' }
  });
}
