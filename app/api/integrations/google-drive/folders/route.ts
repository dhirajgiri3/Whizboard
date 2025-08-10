import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';

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

    const body = await request.json();
    const { name, parentFolderId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
    }

    const folder = await googleDriveService.createFolder(
      session.user.email,
      name,
      parentFolderId || undefined
    );

    if (!folder) {
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }

    return NextResponse.json({ success: true, folder });
  } catch (error) {
    console.error('Google Drive folders POST error:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
