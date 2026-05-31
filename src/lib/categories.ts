import type { CategoryMeta } from '@/types';

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'info',
    label: '정보나눔터',
    description: '지역 생활 정보를 자유롭게 나눠요',
    legacySlugs: ['정보나눔터'],
    subCategories: [
      { slug: 'general', label: '일반' },
      { slug: 'living', label: '생활정보' },
      { slug: 'parenting', label: '육아/교육' },
      { slug: 'events', label: '이벤트' },
      { slug: 'medical', label: '의학' },
    ],
  },
  {
    slug: 'market',
    label: '직거래마당',
    description: '중고 거래 & 무료 나눔',
    subCategories: [
      { slug: 'electronics', label: '전자기기' },
      { slug: 'living-kitchen', label: '생활/주방' },
      { slug: 'baby', label: '유아용품' },
      { slug: 'textbooks', label: '대학서적' },
      { slug: 'clothing', label: '의류/잡화' },
      { slug: 'food', label: '식품' },
      { slug: 'beauty', label: '뷰티/미용' },
      { slug: 'sports', label: '스포츠/레저' },
      { slug: 'hobby', label: '취미/게임/음반' },
      { slug: 'furniture', label: '가구/인테리어' },
    ],
    tags: [
      { slug: 'free', label: '무료' },
      { slug: 'urgent', label: '긴급' },
    ],
  },
  {
    slug: 'jobs',
    label: 'Job & Work',
    description: '구인·구직 정보',
    legacySlugs: ['구인구직'],
  },
  {
    slug: 'housing',
    label: 'Housing',
    description: '렌트 & 서브리스 정보',
    subCategories: [
      { slug: 'rent', label: '렌트' },
      { slug: 'sublease', label: '서브리스' },
      { slug: 'sale', label: '집매매' },
      { slug: 'etc', label: '기타' },
    ],
  },
  {
    slug: 'faq',
    label: 'FAQ',
    description: '자주 묻는 질문 & 지역 정보',
  },
  {
    slug: 'tutoring',
    label: '과외 / 튜터링',
    description: '과외 구합니다 · 과외 선생님 구합니다 · 학원 정보',
    legacySlugs: ['과외'],
    subCategories: [
      { slug: 'find-tutor', label: '튜터 구합니다' },
      { slug: 'offer-tutor', label: '튜터 해드립니다' },
      { slug: 'academy', label: '학원 정보' },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
