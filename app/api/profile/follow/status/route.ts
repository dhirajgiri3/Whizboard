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

    const { searchParams } = new URL(request.url);
    const targetUsername = searchParams.get('targetUsername');

    if (!targetUsername) {
      return NextResponse.json({ error: 'Target username is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Get current user
    const currentUser = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { username: 1 } }
    );

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if following
    const followRecord = await db.collection('user_follows').findOne({
      followerUsername: currentUser.username,
      followingUsername: targetUsername
    });

    return NextResponse.json({
      success: true,
      isFollowing: !!followRecord
    });

  } catch (error) {
    console.error('Follow status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
