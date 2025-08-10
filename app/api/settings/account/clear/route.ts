import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const userEmail = session.user.email;

    const [boardsResult, filesResult, settingsResult, integrationsResult] = await Promise.all([
      db.collection('boards').deleteMany({ $or: [ { ownerEmail: userEmail }, { collaborators: { $elemMatch: { email: userEmail } } } ] }),
      db.collection('boardFiles').deleteMany({ createdBy: userEmail }),
      db.collection('userSettings').deleteMany({ userEmail }),
      db.collection('integrationTokens').deleteMany({ userEmail }),
    ]);

    await db.collection('securityLogs').insertOne({
      action: 'ACCOUNT_DATA_CLEARED',
      userEmail,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      clearedBoards: boardsResult.deletedCount || 0,
      clearedFiles: filesResult.deletedCount || 0,
      clearedSettings: (settingsResult.deletedCount || 0) > 0,
      clearedIntegrations: integrationsResult.deletedCount || 0,
      message: 'All data has been cleared successfully'
    });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
