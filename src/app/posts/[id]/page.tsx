import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SEED_POSTS, SEED_COMMENTS } from '@/lib/seed-data';
import { getCategoryBySlug } from '@/lib/categories';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = SEED_POSTS.find((p) => p.id === id);
  if (!post) return {};
  return { title: post.title };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = SEED_POSTS.find((p) => p.id === id);
  if (!post) notFound();

  const cat = getCategoryBySlug(post.category);
  const comments = SEED_COMMENTS.filter((c) => c.postId === id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          홈
        </Link>
        <span>/</span>
        <Link href={`/${post.category}`} className="hover:text-blue-600">
          {cat?.label ?? post.category}
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{post.title}</span>
      </nav>

      {/* Post */}
      <article className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.author?.displayName ?? '알 수 없음'}</span>
            <span>
              {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        <div className="px-6 py-6 min-h-48 text-sm leading-7 text-gray-700 whitespace-pre-wrap">
          {post.content || (
            <span className="text-gray-400 italic">내용이 없습니다.</span>
          )}
        </div>
      </article>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          댓글 {comments.length > 0 ? `(${comments.length})` : ''}
        </h2>

        {comments.length > 0 && (
          <div className="bg-white border rounded-xl divide-y mb-4">
            {comments.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    {c.author?.displayName ?? '익명'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-400 text-center py-2">
            댓글 기능은 로그인 후 이용할 수 있습니다.
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              disabled
              className="flex-1 border rounded-lg px-3 py-2.5 text-sm bg-gray-50 cursor-not-allowed"
            />
            <button
              disabled
              className="px-4 py-2.5 bg-gray-200 text-gray-500 text-sm rounded-lg cursor-not-allowed"
            >
              등록
            </button>
          </div>
        </div>
      </section>

      {/* Back button */}
      <div className="mt-6">
        <Link
          href={`/${post.category}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          ← 목록으로
        </Link>
      </div>
    </main>
  );
}
