import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';
import { checkRateLimit, uploadLimiter } from '@/lib/rate-limiter';

// 허용된 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

// 허용된 파일 확장자
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv'];

// 차단된 위험 확장자
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.php', '.jsp', '.asp', '.aspx', '.dll', '.scr', '.msi', '.com', '.vbs', '.js', '.html', '.htm'];

// 파일 타입 검증
function isValidFileType(mimeType: string, extension: string): boolean {
  // 위험한 확장자 차단
  if (BLOCKED_EXTENSIONS.includes(extension.toLowerCase())) {
    return false;
  }
  // 허용된 MIME 타입 또는 확장자 확인
  return ALLOWED_MIME_TYPES.includes(mimeType) || ALLOWED_EXTENSIONS.includes(extension.toLowerCase());
}

// 파일명 정제
function sanitizeFilename(filename: string): string {
  // 경로 traversal 방지 및 특수문자 제거
  const basename = path.basename(filename);
  // 알파벳, 숫자, 한글, 공백, 일부 특수문자만 허용
  return basename.replace(/[^\w\s가-힣.-]/g, '_');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimitResult = await checkRateLimit(uploadLimiter, req);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response!;
    }

    // 2. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    // 파일 개수 제한
    if (files.length > 10) {
      return NextResponse.json({ error: '최대 10개의 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure the uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!(file instanceof File)) continue;

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다: ${file.name}` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = sanitizeFilename(file.name);
      const extension = path.extname(originalName).toLowerCase();

      // 파일 타입 검증
      if (!isValidFileType(file.type, extension)) {
        return NextResponse.json(
          { error: `허용되지 않는 파일 형식입니다: ${extension}` },
          { status: 400 }
        );
      }

      // Generate a unique filename using timestamp and random number
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${extension}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);

      uploadedFiles.push({
        name: originalName,
        url: `/api/uploads/${uniqueFilename}`,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 200 });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: '파일 업로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
