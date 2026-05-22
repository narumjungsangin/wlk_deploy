'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoImage from '@/components/LogoImage';
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    displayName: '',
    firstName: '',
    lastName: '',
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'displayName') {
      setUsernameAvailable(null);
    }
  }

  function handleAgreementChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAgreements((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  }

  async function checkUsername() {
    if (!form.displayName.trim()) {
      setError('닉네임을 입력해주세요.');
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    setError('');
    setUsernameAvailable(null);

    try {
      const encodedUsername = encodeURIComponent(form.displayName.trim());
      const url = `/api/auth/check-username?username=${encodedUsername}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '닉네임 확인 중 오류가 발생했습니다.');
        setUsernameAvailable(null);
        return;
      }

      setUsernameAvailable(data.available);
      if (!data.available) {
        setError('이미 사용 중인 닉네임입니다.');
      }
    } catch (err) {
      setError('닉네임 확인 중 네트워크 오류가 발생했습니다.');
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('이름과 성을 모두 입력해주세요.');
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!agreements.terms) {
      setError('이용약관에 동의해주세요.');
      return;
    }
    if (!agreements.privacy) {
      setError('개인정보취급방침에 동의해주세요.');
      return;
    }
    if (usernameAvailable === false) {
      setError('닉네임 중복확인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? '회원가입에 실패했습니다.');
      }
      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoImage width={200} height={72} className="h-16 w-auto" priority />
          </div>
          <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
        </div>

        <div className="bg-white border rounded-xl shadow-sm p-6">
          {/* Social Login */}
          <SocialLoginButtons />

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  성 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="성"
                  required
                  maxLength={30}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="이름"
                  required
                  maxLength={30}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                닉네임(아이디) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                  required
                  maxLength={30}
                  className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={checkUsername}
                  disabled={checkingUsername || !form.displayName.trim()}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {checkingUsername ? '확인 중...' : '중복확인'}
                </button>
              </div>
              {usernameAvailable === true && (
                <p className="text-green-600 text-xs mt-1">사용 가능한 닉네임입니다.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="8자 이상 입력하세요"
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
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={agreements.terms}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 이용약관에 동의합니다{' '}
                  <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                    [보기]
                  </Link>
                </label>
              </div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  checked={agreements.privacy}
                  onChange={handleAgreementChange}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 개인정보취급방침에 동의합니다{' '}
                  <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                    [보기]
                  </Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            이미 회원이신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
