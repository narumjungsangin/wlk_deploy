'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('이메일 인증을 처리 중입니다...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('인증 토큰이 없습니다.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage('이메일 인증이 완료되었습니다!');
        } else {
          setStatus('error');
          setMessage(data.error || '인증 처리 중 오류가 발생했습니다.');
        }
      } catch {
        setStatus('error');
        setMessage('서버 연결에 실패했습니다.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">처리 중</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">인증 완료</h1>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">인증 실패</h1>
          </>
        )}
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'success' && (
          <Link
            href="/login"
            className="inline-block w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </Link>
        )}
        
        {status === 'error' && (
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-block w-full py-2.5 bg-gray-600 text-white font-medium text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              로그인 페이지로
            </Link>
            <Link
              href="/signup"
              className="inline-block w-full py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              다시 회원가입
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">로딩 중...</h1>
        </div>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
