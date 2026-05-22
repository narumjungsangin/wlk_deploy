'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href: string;
}

/* ── 슬라이드 아이콘 SVG (이미지 없을 때 폴백) ── */
function HousingIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      <polygon points="40,18 62,36 18,36" fill="#1a3a6b" />
      <rect x="25" y="36" width="30" height="22" fill="#c8cdd6" />
      <rect x="35" y="46" width="10" height="12" fill="#1a3a6b" />
      <rect x="48" y="40" width="6" height="6" fill="#1a3a6b" />
      <polygon points="38,22 38,18 42,18 42,22" fill="#1a3a6b" />
      <text x="57" y="46" fontSize="10" fill="#f5c842">✦</text>
    </svg>
  );
}
function FaqIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      <text x="28" y="44" fontSize="24" fontWeight="bold" fill="#1a3a6b">?</text>
      <rect x="46" y="22" width="18" height="13" rx="3" fill="#c8cdd6" />
      <line x1="49" y1="26" x2="61" y2="26" stroke="white" strokeWidth="2" />
      <line x1="49" y1="30" x2="57" y2="30" stroke="white" strokeWidth="2" />
      <circle cx="40" cy="55" r="10" fill="#1a3a6b" />
      <text x="44" y="49" fontSize="8" fill="#f5c842">✦</text>
    </svg>
  );
}
function TutoringIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      <rect x="20" y="38" width="40" height="20" rx="1" fill="#1a3a6b" />
      <rect x="22" y="40" width="16" height="16" fill="#c8cdd6" />
      <rect x="42" y="40" width="16" height="16" fill="#c8cdd6" />
      <path d="M20 38 Q40 28 60 38" fill="#1a3a6b" />
      <ellipse cx="40" cy="27" rx="9" ry="6" fill="#c8cdd6" />
      <rect x="36" y="21" width="2" height="6" fill="#c8cdd6" />
      <line x1="50" y1="32" x2="60" y2="22" stroke="#1a3a6b" strokeWidth="2" />
      <text x="57" y="30" fontSize="8" fill="#f5c842">✦</text>
      <text x="50" y="42" fontSize="8" fill="#f5c842">✦</text>
    </svg>
  );
}
function JobsIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-24 h-24">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      <rect x="18" y="30" width="26" height="24" rx="2" fill="#1a3a6b" />
      <rect x="26" y="25" width="10" height="6" rx="1" fill="#1a3a6b" />
      <rect x="46" y="34" width="16" height="20" rx="2" fill="#e8eaf0" />
      <line x1="48" y1="39" x2="60" y2="39" stroke="#c8cdd6" strokeWidth="1.5" />
      <polyline points="49,50 54,44 58,47 62,40" fill="none" stroke="#1a3a6b" strokeWidth="1.5" />
      <circle cx="58" cy="28" r="7" fill="none" stroke="#1a3a6b" strokeWidth="2" />
      <line x1="58" y1="24" x2="58" y2="32" stroke="#1a3a6b" strokeWidth="1.5" />
      <line x1="54" y1="28" x2="62" y2="28" stroke="#1a3a6b" strokeWidth="1.5" />
      <text x="21" y="28" fontSize="8" fill="#f5c842">✦</text>
      <text x="42" y="48" fontSize="8" fill="#f5c842">✦</text>
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-28 h-28">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      <circle cx="32" cy="38" r="12" fill="#1a3a6b" />
      <circle cx="44" cy="44" r="10" fill="#c8cdd6" />
      <rect x="52" y="20" width="14" height="18" rx="2" fill="#c8cdd6" />
      <line x1="54" y1="24" x2="64" y2="24" stroke="white" strokeWidth="1.5" />
      <line x1="54" y1="28" x2="64" y2="28" stroke="white" strokeWidth="1.5" />
      <line x1="54" y1="32" x2="60" y2="32" stroke="white" strokeWidth="1.5" />
      <text x="37" y="50" fontSize="8" fill="#f5c842">✦</text>
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg viewBox="0 0 80 80" className="w-28 h-28">
      <circle cx="40" cy="40" r="38" fill="white" stroke="#1a3a6b" strokeWidth="2.5" />
      {/* box */}
      <rect x="18" y="28" width="22" height="18" rx="1" fill="#1a3a6b" />
      <line x1="29" y1="28" x2="29" y2="46" stroke="white" strokeWidth="1.5" />
      <rect x="24" y="24" width="10" height="5" rx="1" fill="#c8cdd6" />
      {/* bag */}
      <rect x="42" y="33" width="18" height="18" rx="2" fill="#c8cdd6" />
      <path d="M47 33 Q47 27 51 27 Q55 27 55 33" fill="none" stroke="#1a3a6b" strokeWidth="2" />
      {/* arrows */}
      <path d="M38 25 Q52 18 58 28" fill="none" stroke="#1a3a6b" strokeWidth="2" markerEnd="url(#arr1)" />
      <path d="M42 55 Q28 62 22 52" fill="none" stroke="#c8cdd6" strokeWidth="2" />
      <text x="54" y="35" fontSize="8" fill="#f5c842">✦</text>
    </svg>
  );
}

const SLIDES: Slide[] = [
  {
    id: 1,
    icon: <InfoIcon />,
    title: '정보나눔터',
    subtitle: '지역 생활 정보를 이웃과 함께 나눠요',
    href: '/info',
  },
  {
    id: 2,
    icon: <MarketIcon />,
    title: '직거래마당',
    subtitle: '중고 거래 & 무료 나눔',
    href: '/market',
  },
  {
    id: 3,
    icon: <JobsIcon />,
    title: 'Job & Work',
    subtitle: '퍼듀 지역 구인·구직 정보',
    href: '/jobs',
  },
  {
    id: 4,
    icon: <FaqIcon />,
    title: '자주 묻는 질문',
    subtitle: '지역 생활 FAQ를 확인하세요',
    href: '/faq',
  },
  {
    id: 5,
    icon: <HousingIcon />,
    title: '하우징',
    subtitle: '렌트 · 서브리스 정보를 확인하세요',
    href: '/housing',
  },
  {
    id: 6,
    icon: <TutoringIcon />,
    title: '과외 / 튜터링',
    subtitle: '튜터를 구하거나 튜터로 등록하세요',
    href: '/tutoring',
  },
];

export default function HeroBanner() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = SLIDES[current];

  const handlePrev = () => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
    startTimer();
  };

  const handleNext = () => {
    setCurrent((c) => (c + 1) % SLIDES.length);
    startTimer();
  };

  return (
    <div
      className="relative w-full rounded-xl bg-[#f0f4fa] border border-gray-200 overflow-hidden"
      style={{ height: '360px' }}
    >
      {/* ── 콘텐츠 ── */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4 pb-8 pointer-events-none">
        <div className="scale-150">{slide.icon}</div>
        <div className="text-center mt-6">
          <p className="text-2xl font-bold text-[#1a3a6b]">{slide.title}</p>
          <p className="text-sm text-gray-500 mt-1">{slide.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(slide.href)}
          className="px-5 py-2 bg-[#1a3a6b] text-white text-sm font-semibold rounded-lg hover:bg-[#12295a] transition-colors pointer-events-auto"
        >
          바로가기 →
        </button>
      </div>

      {/* ── 이전 버튼 ── */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md hover:bg-gray-50 flex items-center justify-center"
        aria-label="이전"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* ── 다음 버튼 ── */}
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-300 shadow-md hover:bg-gray-50 flex items-center justify-center"
        aria-label="다음"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* ── 점 ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => { setCurrent(i); startTimer(); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'bg-[#1a3a6b] w-6' : 'bg-gray-300 w-2'
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
