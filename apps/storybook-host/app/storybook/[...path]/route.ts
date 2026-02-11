import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const requestedPath = segments.join('/');

  // Resolve: public/storybook/<segments...>
  const publicDir = path.join(process.cwd(), 'public', 'storybook');
  let filePath = path.join(publicDir, requestedPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(publicDir)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    // Try the exact path first
    let content: Buffer;
    try {
      content = await readFile(filePath);
    } catch {
      // If no extension, try index.html (e.g., /storybook/form → /storybook/form/index.html)
      if (!path.extname(filePath)) {
        filePath = path.join(filePath, 'index.html');
        content = await readFile(filePath);
      } else {
        throw new Error('Not found');
      }
    }

    const mimeType = getMimeType(filePath);
    const cacheControl = filePath.endsWith('.html')
      ? 'public, max-age=0, must-revalidate'
      : 'public, max-age=31536000, immutable';

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': cacheControl,
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
