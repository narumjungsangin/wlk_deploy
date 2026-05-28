import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategoryBySlug } from '@/lib/categories';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sub?: string; tag?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return { title: cat.label, description: cat.description };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { sub, tag, page } = await searchParams;

  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const currentSub = cat.subCategories?.find((s) => s.slug === sub);
  const currentTag = cat.tags?.find((t) => t.slug === tag);

  const currentPage = parseInt(page ?? '1', 10);
  const pageSize = 15;

  const where = {
    category,
    ...(sub ? { subCategory: sub } : {}),
    ...(tag ? { tag } : {}),
  };

  const [total, dbPosts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, displayName: true } },
        _count: { select: { comments: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = dbPosts.map((p) => ({
    id: p.id,
    category: p.category,
    subCategory: p.subCategory ?? undefined,
    tag: p.tag ?? undefined,
    title: p.title,
    authorId: p.authorId,
    author: p.author,
    viewCount: p.viewCount,
    commentCount: p._count.comments,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">홈</Link>
          <span>&gt;</span>
          <Link href={`/${category}`} className={`hover:text-blue-600 transition-colors ${!currentSub && !currentTag ? 'font-medium text-gray-800' : ''}`}>{cat.label}</Link>
          {currentSub && (
            <>
              <span>&gt;</span>
              <span className="font-medium text-gray-800">{currentSub.label}</span>
            </>
          )}
          {currentTag && (
            <>
              <span>&gt;</span>
              <span className="font-medium text-gray-800">#{currentTag.label}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>{cat.label}</span>
          {currentSub && (
            <span className="text-lg font-normal text-blue-600 border-l pl-2 border-gray-300">
              {currentSub.label}
            </span>
          )}
          {currentTag && (
            <span className="text-lg font-normal text-blue-600 border-l pl-2 border-gray-300">
              #{currentTag.label}
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
      </div>

      {/* Sub-category tabs */}
      {cat.subCategories && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <Link
            href={`/${category}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !sub
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            전체
          </Link>
          {cat.subCategories.map((s) => (
            <Link
              key={s.slug}
              href={`/${category}?sub=${s.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                sub === s.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}

      {/* Tag filter tabs */}
      {cat.tags && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <Link
            href={`/${category}${sub ? `?sub=${sub}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !tag
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            전체
          </Link>
          {cat.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/${category}?${sub ? `sub=${sub}&` : ''}tag=${t.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tag === t.slug
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {/* Write button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-gray-800">{total}</span>개의 게시글
        </p>
        <Link
          href={`/${category}/write`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          글쓰기
        </Link>
      </div>

      {/* Post list */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            등록된 게시글이 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-xs">
                <th className="py-2.5 px-4 text-left font-medium">제목</th>
                <th className="py-2.5 px-4 text-center font-medium hidden sm:table-cell w-24">
                  작성자
                </th>
                <th className="py-2.5 px-4 text-center font-medium w-24">날짜</th>
                <th className="py-2.5 px-4 text-center font-medium hidden md:table-cell w-16">
                  조회
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="py-3 px-4">
                    <Link
                      href={`/posts/${post.id}`}
                      className="text-gray-800 hover:text-blue-600 font-medium"
                    >
                      {post.title}
                      {(post.commentCount ?? 0) > 0 && (
                        <span className="ml-1.5 text-blue-500 font-normal">
                          [{post.commentCount}]
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500 hidden sm:table-cell">
                    <Link href={`/posts/${post.id}`} className="block">
                      {post.author?.displayName ?? '-'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">
                    <Link href={`/posts/${post.id}`} className="block">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400 hidden md:table-cell">
                    <Link href={`/posts/${post.id}`} className="block">
                      {post.viewCount}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${category}?page=${p}${sub ? `&sub=${sub}` : ''}${tag ? `&tag=${tag}` : ''}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                p === currentPage
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-white border text-gray-600 hover:border-blue-400'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
