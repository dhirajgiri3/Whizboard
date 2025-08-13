import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';

export async function GET(request: NextRequest) {
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

    const result = await googleDriveService.downloadFile(session.user.email, fileId);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Return the file data with appropriate headers (binary)
    const headers: Record<string, string> = {
      'Content-Type': result.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${result.fileName || 'download'}"`,
    };
    
    if (result.data) {
      headers['Content-Length'] = String(result.data.byteLength);
    }
    
    const response = new NextResponse(result.data, { headers });
    
    return response;
  } catch (error) {
    console.error('Google Drive download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
