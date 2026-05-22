'use client';

import { Sparkles, MapPin, Users, HelpCircle } from 'lucide-react';

export default function WelcomeBanner() {
  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#f4f7fc] text-slate-800 shadow-sm border border-[#e2e8f0]">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1a3a6b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-100/20 to-transparent pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 px-6 py-5 md:px-8 md:py-6 flex flex-col gap-3">
        
        {/* Left Side: Text and Badges */}
        <div className="space-y-2.5 max-w-2xl">
          {/* Badge & Titles in one flex container or stacked compactly */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] text-[10px] font-semibold border border-[#1a3a6b]/20 shrink-0">
              <Sparkles className="w-3 h-3 text-[#cfb991]" />
              <span>Welcome to WLK</span>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#1a3a6b]">
              West Lafayette Korea
            </h1>
            <span className="hidden sm:inline text-slate-300">|</span>
            <p className="text-xs md:text-sm font-medium text-slate-500">
              인디애나 웨스트 라파예트 한인 커뮤니티
            </p>
          </div>

          {/* Description */}
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            퍼듀 대학교 학생, 대학원생, 연구원 및 지역 한인 여러분을 환영합니다! 정보나눔, 직거래, 하우징, 구인구직 등 생활에 필요한 유용한 정보와 이웃 간의 따뜻한 소통을 나누어 보세요.
          </p>

          {/* Quick Stats / Info Badges */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1a3a6b] shrink-0" />
              <span>West Lafayette, IN</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#1a3a6b] shrink-0" />
              <span>퍼듀 & 한인 커뮤니티</span>
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-[#1a3a6b] shrink-0" />
              <span>생활/정착 정보 가이드</span>
            </div>
          </div>
        </div>

       
        
      </div>
    </div>
  );
}
