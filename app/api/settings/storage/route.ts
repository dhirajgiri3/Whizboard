import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const userEmail = session.user.email;

    const [boardsCount, filesCount] = await Promise.all([
      db.collection('boards').countDocuments({ $or: [ { ownerEmail: userEmail }, { collaborators: { $elemMatch: { email: userEmail } } } ] }),
      db.collection('boardFiles').countDocuments({ createdBy: userEmail }),
    ]);

    // Estimate storage: approximate sizes if not tracked
    const filesAgg = await db.collection('boardFiles').aggregate([
      { $match: { createdBy: userEmail } },
      { $group: { _id: null, total: { $sum: { $strLenBytes: '$data' } } } },
    ]).toArray();

    const approxFilesBytes = (filesAgg[0]?.total || 0) * 0.75; // base64 -> bytes approx
    const boardsBytes = Math.max(boardsCount * 8 * 1024, 0); // approx metadata
    const settingsBytes = 32 * 1024; // small
    const used = approxFilesBytes + boardsBytes + settingsBytes;

    const storageInfo = {
      used,
      total: 10 * 1024 * 1024 * 1024,
      boards: boardsCount,
      files: filesCount,
      lastBackup: null,
      breakdown: {
        boards: boardsBytes,
        files: approxFilesBytes,
        settings: settingsBytes,
        cache: 0,
      }
    };

    return NextResponse.json(storageInfo);
  } catch (error) {
    console.error('Storage info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage information' },
      { status: 500 }
    );
  }
}
