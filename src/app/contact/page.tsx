'use client';

import { useState } from 'react';
import { Mail, Copy, Check, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const contactEmails = [
    { label: '기본 문의 사항 ', email: 'contact@wlafayettekorea.org' },
    { label: '운영진 이메일 ', email: 'purepsy@gmail.com' },
  ];

  const handleCopy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const mailtoString = `mailto:${contactEmails.map(c => c.email).join(',')}?subject=${encodeURIComponent('[West Lafayette Korea] 문의사항')}`;

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">문의하기</h1>
        <p className="text-gray-500">
          사이트 이용 중 문의사항, 건의사항, 오류 제보 등이 있으시면 아래 운영진 이메일로 연락 주시기 바랍니다.
        </p>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          {contactEmails.map((item) => (
            <div
              key={item.email}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-100 transition-colors gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-gray-800 break-all select-all">
                    {item.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCopy(item.email)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors self-end sm:self-auto min-w-[90px]"
              >
                {copiedEmail === item.email ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>주소 복사</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <a
            href={mailtoString}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-100"
          >
            <ExternalLink className="w-4 h-4" />
            <span>이메일 보내기 (메일 앱 실행)</span>
          </a>
          <p className="text-center text-xs text-gray-400 mt-3">
            클릭하시면 기본 이메일 클라이언트(Mail, Outlook 등)가 실행됩니다.
          </p>
        </div>
      </div>
    </main>
  );
}
