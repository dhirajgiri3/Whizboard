import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';
import logger from '@/lib/logger/logger';

// GET: Get or create Whizboard folder
export async function GET(request: NextRequest) {
  logger.info({ url: request.url }, 'Google Drive Whizboard folder GET request received');
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      logger.warn({ url: request.url }, 'Unauthorized Google Drive Whizboard folder request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info({ userEmail: session.user.email }, 'Processing Google Drive Whizboard folder request');

    // Check if user has Google Drive connected
    const token = await getToken(session.user.email, 'googleDrive');
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'Google Drive not connected for user');
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 403 });
    }

    // Get or create Whizboard folder
    const whizboardFolder = await googleDriveService.getOrCreateWhizboardFolder(session.user.email);
    
    if (!whizboardFolder) {
      logger.error({ userEmail: session.user.email }, 'Failed to get or create Whizboard folder');
      return NextResponse.json({ error: 'Failed to get or create Whizboard folder' }, { status: 500 });
    }

    logger.info({ userEmail: session.user.email, folderId: whizboardFolder.id }, 'Successfully retrieved Whizboard folder');
    
    return NextResponse.json({
      success: true,
      folderId: whizboardFolder.id,
      folderName: whizboardFolder.name,
      folder: whizboardFolder
    });

  } catch (error) {
    logger.error({ url: request.url, error }, 'Google Drive Whizboard folder GET error');
    return NextResponse.json({ error: 'Failed to get Whizboard folder' }, { status: 500 });
  }
}
