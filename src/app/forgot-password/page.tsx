'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">이메일 발송 완료</h1>
          <p className="text-gray-600 mb-6 text-sm">
            {email}로 비밀번호 재설정 링크를 발송했습니다.<br />
            이메일을 확인해주세요. (1시간 이내에 만료됩니다)
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          로그인으로 돌아가기
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500">가입한 이메일 주소를 입력하세요</p>
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
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '발송 중...' : '비밀번호 재설정 링크 받기'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
