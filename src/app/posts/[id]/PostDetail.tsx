'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DOMPurify from 'dompurify';
import RichEditor from '@/components/RichEditor';

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

interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface PostData {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  content: string | null;
  attachments?: Attachment[];
  authorId: string;
  author: Author | null;
  viewCount: number;
  createdAt: string;
  comments: CommentData[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // Attachment edit state
  const [editAttachments, setEditAttachments] = useState<Attachment[]>(post.attachments ?? []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    for (const f of selected) {
      if (ALLOWED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE) valid.push(f);
    }
    setPendingFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeEditAttachment(index: number) {
    setEditAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPendingFiles(): Promise<Attachment[]> {
    if (pendingFiles.length === 0) return [];
    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of pendingFiles) formData.append('files', f);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('파일 업로드에 실패했습니다.');
      const data = await res.json();
      return data.files as Attachment[];
    } finally {
      setUploading(false);
    }
  }

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
    try {
      const newlyUploaded = await uploadPendingFiles();
      const allAttachments = [...editAttachments, ...newlyUploaded];
      setPendingFiles([]);
      setEditAttachments(allAttachments);

      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent, attachments: allAttachments }),
      });
      if (res.ok) {
        setEditingPost(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error ?? '수정 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setPostSaving(false);
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
            <RichEditor
              content={postContent}
              onChange={setPostContent}
              minHeight="288px"
            />
          ) : (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content ?? '', {
                  ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'del',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li',
                    'blockquote', 'code', 'pre',
                    'a', 'img', 'span',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'div', 'hr'
                  ],
                  ALLOWED_ATTR: [
                    'href', 'target', 'rel', 'src', 'alt', 'title',
                    'class', 'style', 'width', 'height'
                  ],
                })
              }}
            />
          )}
        </div>

        {/* Attachments — view mode */}
        {!editingPost && post.attachments && post.attachments.length > 0 && (
          <div className="px-6 pb-6 border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">첨부파일</p>
            <div className="space-y-2">
              {post.attachments.map((att, i) => {
                const isImage = att.type.startsWith('image/');
                return isImage ? (
                  <div key={i} className="border rounded-lg overflow-hidden inline-block mr-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <a href={att.url} target="_blank" rel="noopener noreferrer">
                      <img src={att.url} alt={att.name} className="max-h-64 max-w-full object-contain" />
                    </a>
                    <p className="text-xs text-gray-500 px-2 py-1 truncate">{att.name}</p>
                  </div>
                ) : (
                  <a key={i} href={att.url} download={att.name}
                    className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded text-blue-700 text-xs font-bold uppercase shrink-0">
                      {att.name.split('.').pop()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate group-hover:text-blue-700">{att.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(att.size)}</p>
                    </div>
                    <span className="text-xs text-blue-600 shrink-0">다운로드</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Attachments — edit mode */}
        {editingPost && (
          <div className="px-6 pb-4 border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">첨부파일</p>

            {/* Existing attachments with delete button */}
            {editAttachments.length > 0 && (
              <ul className="space-y-2 mb-3">
                {editAttachments.map((att, i) => {
                  const isImage = att.type.startsWith('image/');
                  return (
                    <li key={i} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={att.url} alt={att.name} className="w-12 h-12 object-cover rounded border" />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded border text-blue-600 text-xs font-bold uppercase">
                          {att.name.split('.').pop()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{att.name}</p>
                        <p className="text-xs text-gray-400">{formatBytes(att.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEditAttachment(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none px-1"
                        title="삭제"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* New pending files */}
            {pendingFiles.length > 0 && (
              <ul className="space-y-2 mb-3">
                {pendingFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    {f.type.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-12 h-12 object-cover rounded border" />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded border text-blue-600 text-xs font-bold uppercase">
                        {f.name.split('.').pop()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{f.name}</p>
                      <p className="text-xs text-blue-500">추가 예정</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePendingFile(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none px-1"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add file button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              + 파일 추가 (이미지, PDF, Word, Excel · 최대 10MB)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleEditFileChange}
              className="hidden"
            />
          </div>
        )}

        {canEditPost && (
          <div className="px-6 pb-5 flex gap-2 justify-end border-t pt-4">
            {editingPost ? (
              <>
                <button
                  onClick={() => { setEditingPost(false); setPendingFiles([]); }}
                  className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePost}
                  disabled={postSaving || uploading}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : postSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setPostTitle(post.title);
                    setPostContent(post.content ?? '');
                    setEditAttachments(post.attachments ?? []);
                    setPendingFiles([]);
                    setEditingPost(true);
                  }}
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
