import HeroBanner from '@/components/HeroBanner';
import WelcomeBanner from '@/components/WelcomeBanner';
import BoardPreview from '@/components/BoardPreview';
import AdSidebar from '@/components/AdSidebar';
import { SEED_POSTS } from '@/lib/seed-data';
import { CATEGORIES } from '@/lib/categories';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'West Lafayette Korea - 웨스트 라파예트 한인 커뮤니티',
  description: '인디애나주 웨스트 라파예트 한인 커뮤니티 사이트입니다. 정보나눔터, 직거래마당, 구인구직, Housing 정보를 나눠요.',
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* 2-column layout: main content left, sidebar right */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left: Banner + Board grid ── */}
        <div className="flex-1 min-w-0 space-y-6">
          <WelcomeBanner />
          <HeroBanner />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORIES.map((cat) => (
              <BoardPreview
                key={cat.slug}
                title={cat.label}
                href={`/${cat.slug}`}
                subCategories={cat.subCategories}
                posts={SEED_POSTS.filter((p) => p.category === cat.slug).slice(0, 5)}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Search + Ads ── */}
        <div className="lg:w-[300px] shrink-0">
          <div className="lg:sticky lg:top-24">
            <AdSidebar />
          </div>
        </div>

      </div>
    </main>
  );
}
