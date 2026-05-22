import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '업로드할 파일이 없습니다.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Ensure the uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name;
      const extension = path.extname(originalName);
      
      // Generate a unique filename using timestamp and random number
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${extension}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);

      uploadedFiles.push({
        name: originalName,
        url: `/uploads/${uniqueFilename}`,
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
