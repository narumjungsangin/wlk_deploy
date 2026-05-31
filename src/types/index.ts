export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Post {
  id: string;
  category: string;
  subCategory?: string;
  tag?: string;
  title: string;
  content: string;
  authorId: string;
  author?: Pick<User, 'id' | 'displayName'>;
  viewCount: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: Pick<User, 'id' | 'displayName'>;
  createdAt: string;
}

export interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CategorySlug = 'info' | 'market' | 'jobs' | 'housing' | 'faq' | 'tutoring';

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  description: string;
  subCategories?: { slug: string; label: string }[];
  tags?: { slug: string; label: string }[];
  legacySlugs?: string[];
}
