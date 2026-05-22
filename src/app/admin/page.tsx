'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  postCount: number;
  commentCount: number;
  socialLogin: boolean;
  isProtectedAdmin: boolean;
}

interface Post {
  id: string;
  title: string;
  category: string;
  author: { id: string; email: string; displayName: string };
  commentCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; email: string; displayName: string };
  post: { id: string; title: string };
  createdAt: string;
}

type TabType = 'users' | 'posts' | 'comments';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());

  const adminEmails = ['joonst26@gmail.com', 'purepsy@gmail.com'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      if (!adminEmails.includes(session.user?.email || '')) {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [status, session, router]);

  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) {
      fetchPosts();
    }
    if (activeTab === 'comments' && comments.length === 0) {
      fetchComments();
    }
  }, [activeTab]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchPosts() {
    setPostsLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      setError('게시물 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setPostsLoading(false);
    }
  }

  async function fetchComments() {
    setCommentsLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data.comments);
    } catch (err) {
      setError('댓글 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  }

  async function deletePost(postId: string) {
    if (!confirm('정말로 이 게시물을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete post');
      }
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete comment');
      }
      fetchComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  }

  async function deleteSelectedComments() {
    if (selectedComments.size === 0) return;
    if (!confirm(`선택한 ${selectedComments.size}개의 댓글을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedComments) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete comments');
      }
      setSelectedComments(new Set());
      fetchComments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  }

  function toggleSelect(userId: string) {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  }

  function toggleSelectComment(commentId: string) {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId);
    } else {
      newSelected.add(commentId);
    }
    setSelectedComments(newSelected);
  }

  function toggleSelectAllUsers() {
    const selectableUsers = users.filter(u => !u.isProtectedAdmin);
    if (selectedUsers.size === selectableUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(selectableUsers.map(u => u.id)));
    }
  }

  function toggleSelectAllComments() {
    if (selectedComments.size === comments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(comments.map(c => c.id)));
    }
  }

  function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }

  if (status === 'loading' || usersLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">로딩 중...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">회원 관리 및 콘텐츠 관리</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-6">
          {[
            { id: 'users', label: `사용자 (${users.length})` },
            { id: 'posts', label: '게시물' },
            { id: 'comments', label: '댓글' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-3 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">사용자 관리</h2>
            <div className="text-sm text-gray-500">
              * 관리자 이메일은 수정/삭제할 수 없습니다
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size > 0 && selectedUsers.size === users.filter(u => !u.isProtectedAdmin).length}
                      onChange={toggleSelectAllUsers}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">프로필</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">사용자명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">이름</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">이메일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">역할</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">글/댓글</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">가입일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Social</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">동작</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        disabled={user.isProtectedAdmin}
                        className="w-4 h-4 rounded border-gray-300 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                        {user.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{user.displayName}</div>
                        <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{user.lastName} {user.firstName}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'ADMIN' ? '관리자' : '회원'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{user.postCount} / {user.commentCount}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className="px-4 py-3">{user.socialLogin ? <span className="text-blue-600 text-xs">✓</span> : <span className="text-gray-400 text-xs">-</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!user.isProtectedAdmin ? (
                          <>
                            <button
                              onClick={() => updateUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                              className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              {user.role === 'ADMIN' ? '강등' : '위임'}
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              삭제
                            </button>
                          </>
                        ) : <span className="text-xs text-gray-400">보호됨</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">게시물 관리</h2>
          </div>
          {postsLoading ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">제목</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">카테고리</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">작성자</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">댓글</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">작성일</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">동작</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline font-medium">
                          {truncateText(post.title, 50)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{post.category}</td>
                      <td className="px-4 py-3 text-gray-700">{post.author.displayName}</td>
                      <td className="px-4 py-3 text-gray-700">{post.commentCount}</td>
                      <td className="px-4 py-3 text-gray-700">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/posts/${post.id}/edit`} className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            수정
                          </Link>
                          <button onClick={() => deletePost(post.id)} className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">댓글 관리</h2>
            {selectedComments.size > 0 && (
              <button
                onClick={deleteSelectedComments}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                선택 삭제 ({selectedComments.size})
              </button>
            )}
          </div>
          {commentsLoading ? (
            <div className="text-center py-12">로딩 중...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedComments.size === comments.length && comments.length > 0}
                        onChange={toggleSelectAllComments}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">내용</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">작성자</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">게시물</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">작성일</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">동작</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedComments.has(comment.id)}
                          onChange={() => toggleSelectComment(comment.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{truncateText(comment.content, 60)}</td>
                      <td className="px-4 py-3 text-gray-700">{comment.author.displayName}</td>
                      <td className="px-4 py-3">
                        <Link href={`/posts/${comment.post.id}`} className="text-blue-600 hover:underline text-xs">
                          {truncateText(comment.post.title, 30)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteComment(comment.id)} className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
