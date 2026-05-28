'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Trash2, Check, X, AlertTriangle, FileText, MessageSquare, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity' | 'delete'>('profile');

  // 내 활동 상태
  const [activitySubTab, setActivitySubTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<Array<{
    id: string;
    title: string;
    category: string;
    subCategory?: string;
    viewCount: number;
    commentCount: number;
    createdAt: string;
  }>>([]);
  const [comments, setComments] = useState<Array<{
    id: string;
    content: string;
    postId: string;
    postTitle: string;
    postCategory: string;
    createdAt: string;
  }>>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user) {
      setDisplayName(session.user.name || '');
      setEmail(session.user.email || '');
      setOriginalDisplayName(session.user.name || '');
      setOriginalEmail(session.user.email || '');
    }
  }, [session, status, router]);

  // 내 활동 데이터 로드
  useEffect(() => {
    if (activeTab === 'activity') {
      if (activitySubTab === 'posts') {
        loadPosts();
      } else {
        loadComments();
      }
    }
  }, [activeTab, activitySubTab, postsPage, commentsPage]);

  // 닉네임 중복 확인
  const checkUsername = async (username: string) => {
    if (!username || username === originalDisplayName) {
      setUsernameAvailable(null);
      return;
    }
    
    setIsCheckingUsername(true);
    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 디바운스된 닉네임 확인
  useEffect(() => {
    const timer = setTimeout(() => {
      if (displayName !== originalDisplayName) {
        checkUsername(displayName);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [displayName, originalDisplayName]);

  // 프로필 업데이트
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (displayName !== originalDisplayName && usernameAvailable === false) {
      setMessage({ type: 'error', text: '이미 사용 중인 닉네임입니다.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '계정 정보가 업데이트되었습니다.' });
        setOriginalDisplayName(displayName);
        setOriginalEmail(email);
        setUsernameAvailable(null);
        // 세션 업데이트
        await update({ name: displayName, email });
      } else {
        setMessage({ type: 'error', text: data.error || '업데이트에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || '비밀번호 변경에 실패했습니다.' });
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  // 계정 삭제
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: '계정이 삭제되었습니다.' });
        // 로그아웃 및 리다이렉트
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || '계정 삭제에 실패했습니다.' });
        setLoading(false);
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
      setLoading(false);
    }
  };

  // 내 게시물 로드
  const loadPosts = async () => {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/account/posts?page=${postsPage}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
        setPostsTotal(data.pagination.total);
      }
    } catch {
      // silently fail
    } finally {
      setActivityLoading(false);
    }
  };

  // 내 댓글 로드
  const loadComments = async () => {
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/account/comments?page=${commentsPage}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments);
        setCommentsTotal(data.pagination.total);
      }
    } catch {
      // silently fail
    } finally {
      setActivityLoading(false);
    }
  };

  // 카테고리 한글 이름 변환
  const getCategoryLabel = (slug: string) => {
    const labels: Record<string, string> = {
      info: '정보나눔터',
      marketplace: '직거래마당',
      jobs: '구인구직',
      housing: 'Housing',
      free: '자유게시판',
      qa: 'Q&A',
    };
    return labels[slug] || slug;
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 페이지네이션 컴포넌트
  const Pagination = ({
    page,
    total,
    onPageChange,
  }: {
    page: number;
    total: number;
    onPageChange: (p: number) => void;
  }) => {
    const totalPages = Math.ceil(total / 10);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-600">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (status === 'loading') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">계정 관리</h1>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-1" />
          프로필 수정
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-1" />
          비밀번호 변경
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          내 활동
        </button>
        <button
          onClick={() => setActiveTab('delete')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'delete'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-red-600'
          }`}
        >
          <Trash2 className="w-4 h-4 inline mr-1" />
          계정 삭제
        </button>
      </div>

      {/* 알림 메시지 */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 프로필 수정 탭 */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">프로필 정보</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              닉네임
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingUsername ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : usernameAvailable === true ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : usernameAvailable === false ? (
                  <X className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
            {usernameAvailable === false && (
              <p className="text-xs text-red-500 mt-1">이미 사용 중인 닉네임입니다.</p>
            )}
            {usernameAvailable === true && (
              <p className="text-xs text-green-500 mt-1">사용 가능한 닉네임입니다.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4 inline mr-1" />
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '저장 중...' : '프로필 저장'}
          </button>
        </form>
      )}

      {/* 비밀번호 변경 탭 */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">비밀번호 변경</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">최소 6자 이상</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newPassword !== confirmPassword}
            className="w-full py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}

      {/* 내 활동 탭 */}
      {activeTab === 'activity' && (
        <div className="bg-white border rounded-xl shadow-sm">
          {/* 서브 탭 */}
          <div className="flex border-b">
            <button
              onClick={() => setActivitySubTab('posts')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activitySubTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1.5" />
              내 게시물
              <span className="ml-1.5 text-xs text-gray-500">({postsTotal})</span>
            </button>
            <button
              onClick={() => setActivitySubTab('comments')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activitySubTab === 'comments'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5" />
              내 댓글
              <span className="ml-1.5 text-xs text-gray-500">({commentsTotal})</span>
            </button>
          </div>

          <div className="p-4">
            {activityLoading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">로딩 중...</p>
              </div>
            ) : activitySubTab === 'posts' ? (
              <div className="space-y-2">
                {posts.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">작성한 게시물이 없습니다.</p>
                ) : (
                  posts.map((post) => (
                    <a
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {getCategoryLabel(post.category)}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.commentCount}
                        </span>
                      </div>
                    </a>
                  ))
                )}
                <Pagination page={postsPage} total={postsTotal} onPageChange={setPostsPage} />
              </div>
            ) : (
              <div className="space-y-2">
                {comments.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-8">작성한 댓글이 없습니다.</p>
                ) : (
                  comments.map((comment) => (
                    <a
                      key={comment.id}
                      href={`/posts/${comment.postId}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          댓글
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{comment.content}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        원문: <span className="text-blue-600">{comment.postTitle}</span>
                        <span className="ml-2 text-gray-400">[{getCategoryLabel(comment.postCategory)}]</span>
                      </p>
                    </a>
                  ))
                )}
                <Pagination page={commentsPage} total={commentsTotal} onPageChange={setCommentsPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 계정 삭제 탭 */}
      {activeTab === 'delete' && (
        <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            계정 삭제
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              계정 삭제하기
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium mb-2">
                  정말로 계정을 삭제하시겠습니까?
                </p>
                <p className="text-xs text-red-600">
                  계정을 삭제하려면 현재 비밀번호를 입력하세요.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? '삭제 중...' : '영구 삭제'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
