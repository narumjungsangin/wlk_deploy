'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoImageProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** 흰색 반전 여부 (어두운 배경용) */
  invert?: boolean;
}

export default function LogoImage({
  className = '',
  width = 180,
  height = 60,
  priority = false,
  invert = false,
}: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span
        className={`inline-flex items-center font-extrabold tracking-tight select-none ${
          invert ? 'text-white' : 'text-[#1a3a6b]'
        } ${className}`}
        style={{ fontSize: Math.round(height * 0.55) }}
      >
        <span className={invert ? 'text-white' : 'text-[#1a3a6b]'}>L</span>
        <span className={invert ? 'text-white' : 'text-[#1a3a6b]'}>K</span>
        <span className={invert ? 'text-red-400' : 'text-[#c0392b]'}>C</span>
        <span
          className={`ml-1.5 text-xs font-medium ${invert ? 'text-gray-300' : 'text-gray-500'}`}
          style={{ fontSize: Math.round(height * 0.22) }}
        >
          한인 커뮤니티
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="West Lafayette Korea 로고"
      width={width}
      height={height}
      className={`object-contain${invert ? ' brightness-0 invert' : ''} ${className}`}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
