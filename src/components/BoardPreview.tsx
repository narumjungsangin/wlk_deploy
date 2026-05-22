'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { Post } from '@/types';

interface BoardPreviewProps {
  title: string;
  href: string;
  posts: Post[];
  subCategories?: { slug: string; label: string }[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function BoardPreview({ title, href, posts, subCategories }: BoardPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleLimit = 4;
  const showDropdown = subCategories && subCategories.length > visibleLimit;
  const visibleSubs = subCategories ? subCategories.slice(0, visibleLimit) : [];
  const dropdownSubs = subCategories ? subCategories.slice(visibleLimit) : [];

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="px-4 py-3 border-b bg-gray-50 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Link
            href={href}
            className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            {title}
          </Link>
          <Link
            href={href}
            className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            + 더보기
          </Link>
        </div>
        {subCategories && subCategories.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5 relative" ref={dropdownRef}>
            {visibleSubs.map((sub) => (
              <Link
                key={sub.slug}
                href={`${href}?sub=${sub.slug}`}
                className="text-[11px] text-gray-500 bg-white border px-2 py-0.5 rounded hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all whitespace-nowrap"
              >
                {sub.label}
              </Link>
            ))}

            {showDropdown && (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-0.5 text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded hover:bg-blue-100 transition-all whitespace-nowrap font-medium"
                >
                  +{dropdownSubs.length}개 더보기
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute left-0 mt-1 z-10 bg-white border rounded-lg shadow-lg py-1 min-w-[120px] max-h-48 overflow-y-auto">
                    {dropdownSubs.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`${href}?sub=${sub.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ul className="divide-y flex-1">
        {posts.length === 0 ? (
          <li className="px-4 py-6 text-sm text-gray-400 text-center">
            등록된 게시글이 없습니다.
          </li>
        ) : (
          posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.id}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                  {post.title}
                  {post.commentCount != null && post.commentCount > 0 && (
                    <span className="ml-1 text-blue-500 text-xs font-medium">
                      ({post.commentCount})
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(post.createdAt)}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
