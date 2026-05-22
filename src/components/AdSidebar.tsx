'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdItem {
  id: number;
  src: string;
  alt: string;
  href?: string;
}

const ADS: AdItem[] = [
  { id: 1, src: '/ads/ad-1.png', alt: '광고 1', href: 'http://krentalcar.com/' },
  { id: 2, src: '/ads/ad-2.png', alt: '광고 2', href: 'https://johnnyauto.com/' },
  { id: 3, src: '/ads/ad-3.png', alt: '광고 3', href: 'https://www.instagram.com/silversnowyoga/' },
  { id: 4, src: '/ads/ad-4.png', alt: '광고 4', href: 'https://www.truebloodre.com/' },
];

function AdImage({ ad }: { ad: AdItem }) {
  const [error, setError] = useState(false);

  const inner = error ? (
    <div className="w-full aspect-[3/1] bg-gradient-to-r from-gray-100 to-gray-50 border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center gap-0.5">
      <span className="text-[10px] text-gray-400 font-medium">광고 {ad.id}</span>
      <span className="text-[9px] text-gray-300">/ads/ad-{ad.id}.png</span>
    </div>
  ) : (
    <div className="relative w-full aspect-[3/1] rounded-md overflow-hidden">
      <Image
        src={ad.src}
        alt={ad.alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );

  if (ad.href && ad.href !== '#') {
    return (
      <a href={ad.href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}

export default function AdSidebar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <aside className="w-full space-y-4">
      {/* 검색창 */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">검색</h2>
        <form onSubmit={handleSearch} className="flex flex-col gap-1.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="w-full border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            SEARCH
          </button>
        </form>
      </div>

      {/* 광고 */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">광고</h2>
        <div className="space-y-2">
          {ADS.map((ad) => (
            <AdImage key={ad.id} ad={ad} />
          ))}
        </div>
        <p className="text-[9px] text-gray-400 mt-2 text-center">
          광고 문의: contact@wlafayettekorea.org
        </p>
      </div>
    </aside>
  );
}
