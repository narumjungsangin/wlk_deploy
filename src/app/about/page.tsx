import type { Metadata } from 'next';
import Link from 'next/link';
import { User, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us & Credits',
};

// lucide-react 특정 버전에서 LinkedIn 아이콘이 누락되는 빌드 에러를 방지하기 위해 커스텀 SVG로 정의합니다.
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// lucide-react 특정 버전에서 Instagram 아이콘이 누락되는 빌드 에러를 방지하기 위해 커스텀 SVG로 정의합니다.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function AboutPage() {
  const team = [
    {
      name: 'Junsu Yoon',
      role: 'Project Manager',
      description: 'Frontend / Backend Developer',
      image: '/images/team/junsu.png',
      linkedin: 'https://www.linkedin.com/in/junsuyoon/',  // 예: 'https://linkedin.com/in/username'
      instagram: 'https://www.instagram.com/y.junsu17/', // 예: 'https://instagram.com/username'
      email: 'joonst26@gmail.com',     // 예: 'username@example.com'
    },
    {
      name: 'Yewon Choi',
      role: 'Developer',
      description: 'Frontend / Backend Developer',
      image: '/images/team/yewon.png',
      linkedin: 'https://www.linkedin.com/in/choi-amyyyy/',  // 예: 'https://linkedin.com/in/username'
      instagram: 'https://www.instagram.com/__yewonchoi/', // 예: 'https://instagram.com/username'
      email: 'readchoi0316@gmail.com',     // 예: 'username@example.com'
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">About Us & Credits</h1>
      
      <section className="bg-white border rounded-xl p-6 mb-8 space-y-4 text-sm text-gray-700 leading-7 shadow-sm">
        <p>
          <strong>West Lafayette Korea</strong>는 인디애나주 웨스트 라파예트(West Lafayette)에
          거주하는 한인 커뮤니티를 위한 정보 공유 플랫폼입니다.
        </p>
        <p>
          퍼듀 대학교(Purdue University)를 중심으로 한 지역 한인 커뮤니티의 생활 정보,
          구인·구직, 중고 거래, 주거 정보 등을 나눌 수 있는 공간을 제공합니다.
        </p>
        <p>
          문의사항은{' '}
          <Link href="/contact" className="text-blue-600 hover:underline font-semibold">
            문의하기
          </Link>
          를 통해 연락해 주세요.
        </p>
      </section>

      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b">Credits & Team</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {team.map((member) => (
            <div key={member.name} className="p-6 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center text-center">
              {/* 프로필 이미지 칸 */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-4 flex items-center justify-center relative shadow-inner">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={`${member.name} profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              
              <h3 className="text-base font-bold text-gray-900">{member.name}</h3>
              <p className="text-xs font-semibold text-blue-600 mt-1">{member.role}</p>
              <p className="text-sm text-gray-600 mt-3">{member.description}</p>

              {/* 소셜 및 이메일 링크 영역 */}
              <div className="flex items-center gap-3 mt-4">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#0077b5] hover:bg-gray-100 rounded-full transition-colors"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-[#e1306c] hover:bg-gray-100 rounded-full transition-colors"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 text-gray-500 hover:text-[#ea4335] hover:bg-gray-100 rounded-full transition-colors"
                    title="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
