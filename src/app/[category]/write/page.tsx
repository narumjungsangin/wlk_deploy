'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { getCategoryBySlug } from '@/lib/categories';

interface Props {
  params: Promise<{ category: string }>;
}

export default function WritePage({ params }: Props) {
  const { category } = use(params);
  const router = useRouter();
  const cat = getCategoryBySlug(category);
  const [subCategory, setSubCategory] = useState('');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subCategory: subCategory || undefined, tag: tag || undefined, title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '게시글 작성에 실패했습니다.');
      }
      const post = await res.json();
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link
          href={`/${category}`}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          ← 목록으로
        </Link>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-6">게시글 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {cat?.subCategories && cat.subCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              분류 <span className="text-red-500">*</span>
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              required
            >
              <option value="">분류를 선택하세요</option>
              {cat.subCategories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {cat?.tags && cat.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              태그
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">없음</option>
              {cat.tags.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={255}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Link
            href={`/${category}`}
            className="px-4 py-2.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </main>
  );
}
