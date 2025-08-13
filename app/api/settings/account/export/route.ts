import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function GET() {
  return NextResponse.json({ error: 'Use POST with options to export your data.' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exportOptions = await request.json();

    const db = await connectToDatabase();

    // Build export from real collections
    const userEmail = session.user.email;
    const user = await db.collection('users').findOne({ email: userEmail }, { projection: { _id: 1, email: 1, name: 1 } });
    const boards = exportOptions.includeBoards
      ? await db.collection('boards').find({ $or: [ { ownerEmail: userEmail }, { collaborators: { $elemMatch: { email: userEmail } } } ] }).toArray()
      : [];
    const settings = exportOptions.includeSettings
      ? await db.collection('userSettings').findOne({ userEmail })
      : null;
    const integrations = exportOptions.includeIntegrations
      ? await db.collection('integrationTokens').find({ userEmail }).toArray()
      : [];
    const history = exportOptions.includeHistory
      ? await db.collection('securityLogs').find({ userEmail }).sort({ timestamp: -1 }).limit(200).toArray()
      : [];

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: {
        email: user?.email,
        id: user?._id?.toString(),
        name: user?.name,
      },
      ...(exportOptions.includeBoards && { boards }),
      ...(exportOptions.includeSettings && { settings }),
      ...(exportOptions.includeIntegrations && { integrations }),
      ...(exportOptions.includeHistory && { history }),
    };

    const dataString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataString], { type: 'application/json' });
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="whizboard-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
} 