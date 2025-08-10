import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';
import logger from '@/lib/logger/logger';
import { createCanvas } from 'canvas';

// POST: Test file upload with a simple PNG
export async function POST(request: NextRequest) {
  logger.info({ url: request.url }, 'Google Drive test upload request received');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn({ url: request.url }, 'Unauthorized Google Drive test upload request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info({ userEmail: session.user.email }, 'Processing Google Drive test upload request');

    // Check if user has Google Drive connected
    const token = await getToken(session.user.email, 'googleDrive');
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'Google Drive not connected for user');
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 403 });
    }

    // Create a simple test PNG
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test image
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 300);
    
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Image', 200, 150);
    
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(50, 50, 100, 100);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(250, 50, 100, 100);
    
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(150, 200, 100, 50);

    // Convert to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    
    logger.info({ userEmail: session.user.email, bufferSize: pngBuffer.length }, 'Test PNG buffer created');

    // Get or create Whizboard folder
    const whizboardFolder = await googleDriveService.getOrCreateWhizboardFolder(session.user.email);
    if (!whizboardFolder) {
      logger.error({ userEmail: session.user.email }, 'Failed to get or create Whizboard folder for test');
      return NextResponse.json({ error: 'Failed to get Whizboard folder' }, { status: 500 });
    }

    // Upload test file
    const result = await googleDriveService.uploadFile(
      session.user.email,
      'test-image.png',
      pngBuffer,
      'image/png',
      whizboardFolder.id
    );

    if (!result.success) {
      logger.error({ userEmail: session.user.email, error: result.error }, 'Test upload failed');
      return NextResponse.json({ error: result.error || 'Failed to upload test file' }, { status: 500 });
    }

    logger.info({ userEmail: session.user.email, fileId: result.fileId, fileSize: result.file?.size }, 'Test upload successful');
    
    return NextResponse.json({
      success: true,
      message: 'Test file uploaded successfully',
      fileId: result.fileId,
      fileName: 'test-image.png',
      file: result.file,
      googleDriveUrl: result.file?.webViewLink,
      bufferSize: pngBuffer.length,
      fileSize: result.file?.size
    });

  } catch (error) {
    logger.error({ url: request.url, error }, 'Google Drive test upload error');
    return NextResponse.json({ error: 'Failed to upload test file' }, { status: 500 });
  }
}
