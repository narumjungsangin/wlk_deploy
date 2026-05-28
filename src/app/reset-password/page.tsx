'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('유효하지 않은 접근입니다.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        setTokenValid(res.ok);
        if (!res.ok) {
          setError('만료되거나 유효하지 않은 링크입니다. 비밀번호 찾기를 다시 진행해주세요.');
        }
      } catch {
        setTokenValid(false);
        setError('토큰 확인에 실패했습니다.');
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || '비밀번호 변경에 실패했습니다.');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">링크 확인 중...</p>
        </div>
      </main>
    );
  }

  if (tokenValid === false) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">링크 오류</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/forgot-password"
            className="inline-block w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            비밀번호 찾기 다시하기
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">비밀번호 변경 완료</h1>
          <p className="text-gray-600 mb-6">
            새 비밀번호로 로그인해주세요.<br />
            3초 후 로그인 페이지로 이동합니다.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">새 비밀번호 설정</h1>
          <p className="text-sm text-gray-500">새로운 비밀번호를 입력하세요</p>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Lock className="w-4 h-4 inline mr-1" />
                새 비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력"
                required
                minLength={8}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 8}
              className="w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
