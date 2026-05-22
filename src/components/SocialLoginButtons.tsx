'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SocialLoginButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  async function handleSocial(provider: 'google' | 'kakao') {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl: '/' });
  }

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">또는 소셜 계정으로 계속</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google */}
      <button
        onClick={() => handleSocial('google')}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 py-2.5 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
      >
        {loadingProvider === 'google' ? (
          <span className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Google로 계속하기
      </button>

      {/* Kakao */}
      <button
        onClick={() => handleSocial('kakao')}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg text-sm font-medium text-[#3C1E1E] bg-[#FEE500] hover:bg-[#F5DC00] disabled:opacity-50 transition-colors"
      >
        {loadingProvider === 'kakao' ? (
          <span className="w-5 h-5 border-2 border-yellow-400 border-t-yellow-800 rounded-full animate-spin" />
        ) : (
          <KakaoIcon />
        )}
        카카오로 계속하기
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0C4.029 0 0 3.134 0 7c0 2.493 1.611 4.678 4.032 5.916L3.1 16.5a.375.375 0 0 0 .543.415L8.25 13.97c.247.018.497.03.75.03 4.971 0 9-3.134 9-7S13.971 0 9 0z"
        fill="#3C1E1E"
      />
    </svg>
  );
}
