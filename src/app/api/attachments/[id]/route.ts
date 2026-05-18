import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStorageDir } from '@/lib/storage';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Fetch application from db to get metadata
    const app = await prisma.application.findUnique({
      where: { id },
    });

    if (!app || !app.attachmentPath) {
      return new NextResponse('Attachment not found', { status: 404 });
    }

    // 2. Resolve absolute file path next to the SQLite database
    const storageDir = getStorageDir();
    const fileName = path.basename(app.attachmentPath);
    const absolutePath = path.join(storageDir, fileName);

    if (!fs.existsSync(absolutePath)) {
      return new NextResponse('Physical file not found on disk', { status: 404 });
    }

    // 3. Determine the correct content-type for high-quality browser display
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
    }

    // 4. Read the physical file buffer
    const fileBuffer = await fs.promises.readFile(absolutePath);

    // 5. Stream the response inline
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(app.attachmentName || fileName)}"`,
      },
    });
  } catch (error: any) {
    console.error('Error serving attachment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
