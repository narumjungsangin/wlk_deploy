'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { getCategoryBySlug } from '@/lib/categories';
import RichEditor from '@/components/RichEditor';

interface Props {
  params: Promise<{ category: string }>;
}

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
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

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const f of selected) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errors.push(`${f.name}: 지원하지 않는 파일 형식입니다.`);
      } else if (f.size > MAX_FILE_SIZE) {
        errors.push(`${f.name}: 파일 크기는 10MB 이하여야 합니다.`);
      } else {
        valid.push(f);
      }
    }

    if (errors.length > 0) setError(errors.join('\n'));
    else setError('');

    setPendingFiles((prev) => [...prev, ...valid]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePending(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeUploaded(index: number) {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPendingFiles(): Promise<UploadedFile[]> {
    if (pendingFiles.length === 0) return [];
    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of pendingFiles) formData.append('files', f);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? '파일 업로드에 실패했습니다.');
      }
      const data = await res.json();
      return data.files as UploadedFile[];
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const newlyUploaded = await uploadPendingFiles();
      const allAttachments = [...uploadedFiles, ...newlyUploaded];
      setPendingFiles([]);
      setUploadedFiles(allAttachments);

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subCategory: subCategory || undefined,
          tag: tag || undefined,
          title,
          content,
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
        }),
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

  const isImage = (type: string) => type.startsWith('image/');

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
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 whitespace-pre-wrap">
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
          <RichEditor
            content={content}
            onChange={setContent}
            minHeight="288px"
          />
        </div>

        {/* File attachment section - non-image only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            파일 첨부 <span className="text-xs text-gray-400 font-normal">(PDF, Word, Excel)</span>
          </label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-5 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <p className="text-sm text-gray-500">
              클릭하여 파일 선택
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, Word, Excel · 최대 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ].join(',')}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Pending (not yet uploaded) files */}
          {pendingFiles.length > 0 && (
            <ul className="mt-3 space-y-2">
              {pendingFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2">
                  {isImage(f.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded border text-blue-600 text-xs font-bold uppercase">
                      {f.name.split('.').pop()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(f.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Already-uploaded files (if any edge case) */}
          {uploadedFiles.length > 0 && (
            <ul className="mt-3 space-y-2">
              {uploadedFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  {isImage(f.type) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.url} alt={f.name} className="w-12 h-12 object-cover rounded border" />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded border text-blue-600 text-xs font-bold uppercase">
                      {f.name.split('.').pop()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{f.name}</p>
                    <p className="text-xs text-green-600">업로드 완료</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploaded(i)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            disabled={submitting || uploading}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? '업로드 중...' : submitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </form>
    </main>
  );
}
