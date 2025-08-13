import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';
import logger from '@/lib/logger/logger';

// Ensure Node.js runtime for Buffer support
export const runtime = 'nodejs';

// GET: List files from Google Drive
export async function GET(request: NextRequest) {
  logger.info({ url: request.url }, 'Google Drive files GET request received');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn({ url: request.url }, 'Unauthorized Google Drive files request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info({ userEmail: session.user.email }, 'Processing Google Drive files request');

    // Check if user has Google Drive connected
    const token = await getToken(session.user.email, 'googleDrive');
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'Google Drive not connected for user');
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const query = searchParams.get('query');

    logger.info({ userEmail: session.user.email, folderId, query }, 'Google Drive files request parameters');

    let files;
    if (query) {
      logger.debug({ userEmail: session.user.email, query }, 'Searching Google Drive files');
      files = await googleDriveService.searchFiles(session.user.email, query);
    } else {
      logger.debug({ userEmail: session.user.email, folderId }, 'Listing Google Drive files');
      files = await googleDriveService.listFiles(session.user.email, folderId || undefined);
    }

    logger.info({ userEmail: session.user.email, fileCount: files.length }, 'Successfully retrieved Google Drive files');
    return NextResponse.json({ files });
  } catch (error) {
    logger.error({ url: request.url, error }, 'Google Drive files GET error');
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

// POST: Upload file to Google Drive
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Google Drive connected
    const token = await getToken(session.user.email, 'googleDrive');
    if (!token) {
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const mimeType = formData.get('mimeType') as string;
    const parentFolderId = formData.get('parentFolderId') as string;

    if (!file && !fileName) {
      return NextResponse.json({ error: 'File or fileName required' }, { status: 400 });
    }

    let fileData: string | Buffer;
    let finalFileName: string;
    let finalMimeType: string;

    if (file) {
      const ab = await file.arrayBuffer();
      // Convert ArrayBuffer to Node Buffer to avoid corruption in multipart upload
      fileData = Buffer.from(ab);
      finalFileName = fileName || file.name;
      finalMimeType = mimeType || file.type || 'application/octet-stream';
    } else {
      // Handle case where we have fileName but no file (e.g., JSON data)
      const data = formData.get('data') as string;
      if (!data) {
        return NextResponse.json({ error: 'File data required' }, { status: 400 });
      }
      // Support base64 or data URLs (commonly used for images)
      const dataUrlMatch = /^data:[^;]+;base64,(.*)$/i.exec(data);
      if (dataUrlMatch) {
        fileData = Buffer.from(dataUrlMatch[1], 'base64');
      } else {
        fileData = data;
      }
      finalFileName = fileName;
      finalMimeType = mimeType || 'application/json';
    }

    const result = await googleDriveService.uploadFile(
      session.user.email,
      finalFileName,
      fileData,
      finalMimeType,
      parentFolderId || undefined
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      fileId: result.fileId,
      file: result.file 
    });
  } catch (error) {
    console.error('Google Drive files POST error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// DELETE: Delete file from Google Drive
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Google Drive connected
    const token = await getToken(session.user.email, 'googleDrive');
    if (!token) {
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const success = await googleDriveService.deleteFile(session.user.email, fileId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Drive files DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
