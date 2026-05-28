'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Author {
  id: string;
  displayName: string | null;
}

interface CommentData {
  id: string;
  content: string;
  authorId: string;
  author: Author | null;
  createdAt: string;
}

interface PostData {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  content: string | null;
  authorId: string;
  author: Author | null;
  viewCount: number;
  createdAt: string;
  comments: CommentData[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function PostDetail({ post }: { post: PostData }) {
  const router = useRouter();
  const { data: session } = useSession();

  const currentUserId = session?.user?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';

  const canEditPost = !!currentUserId && (post.authorId === currentUserId || isAdmin);

  // Post edit state
  const [editingPost, setEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState(post.title);
  const [postContent, setPostContent] = useState(post.content ?? '');
  const [postSaving, setPostSaving] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentData[]>(post.comments);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  async function handleDeletePost() {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push(`/${post.category}`);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? '삭제 중 오류가 발생했습니다.');
    }
  }

  async function handleSavePost() {
    if (!postTitle.trim()) return;
    setPostSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: postTitle, content: postContent }),
    });
    setPostSaving(false);
    if (res.ok) {
      setEditingPost(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? '수정 중 오류가 발생했습니다.');
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim()) return;
    setCommentSubmitting(true);
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    });
    setCommentSubmitting(false);
    if (res.ok) {
      const created: CommentData = await res.json();
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } else {
      const data = await res.json();
      alert(data.error ?? '댓글 등록 중 오류가 발생했습니다.');
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      const data = await res.json();
      alert(data.error ?? '삭제 중 오류가 발생했습니다.');
    }
  }

  function startEditComment(comment: CommentData) {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  }

  async function handleSaveComment(commentId: string) {
    if (!editingCommentContent.trim()) return;
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editingCommentContent }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: updated.content } : c
        )
      );
      setEditingCommentId(null);
    } else {
      const data = await res.json();
      alert(data.error ?? '수정 중 오류가 발생했습니다.');
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">홈</Link>
        <span>/</span>
        <Link href={`/${post.category}`} className="hover:text-blue-600">
          {post.categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{post.title}</span>
      </nav>

      {/* Post */}
      <article className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b">
          {editingPost ? (
            <input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full text-xl font-bold text-gray-900 border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{post.author?.displayName ?? '알 수 없음'}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
          </div>
        </div>

        <div className="px-6 py-6 min-h-48">
          {editingPost ? (
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={12}
              className="w-full text-sm leading-7 text-gray-700 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          ) : (
            <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
              {post.content || <span className="text-gray-400 italic">내용이 없습니다.</span>}
            </p>
          )}
        </div>

        {canEditPost && (
          <div className="px-6 pb-5 flex gap-2 justify-end border-t pt-4">
            {editingPost ? (
              <>
                <button
                  onClick={() => setEditingPost(false)}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={postSaving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {postSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditingPost(true)}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        )}
      </article>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          댓글 {comments.length > 0 ? `(${comments.length})` : ''}
        </h2>

        {comments.length > 0 && (
          <div className="bg-white border rounded-xl divide-y mb-4">
            {comments.map((c) => {
              const canEditComment =
                !!currentUserId && (c.authorId === currentUserId || isAdmin);
              const isEditingThis = editingCommentId === c.id;

              return (
                <div key={c.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {c.author?.displayName ?? '익명'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    {canEditComment && !isEditingThis && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEditComment(c)}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors px-2 py-0.5 border rounded hover:border-blue-400"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-0.5 border rounded hover:border-red-400"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingThis ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        rows={3}
                        className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="text-xs px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveComment(c.id)}
                          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-6">{c.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Comment input */}
        <div className="bg-white border rounded-xl p-4">
          {!currentUserId ? (
            <>
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
            </>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="댓글을 입력하세요"
                className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSubmitComment}
                disabled={commentSubmitting || !newComment.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentSubmitting ? '...' : '등록'}
              </button>
            </div>
          )}
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
