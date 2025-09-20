import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import api from '@/lib/http/axios';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUsername, action } = await request.json();
    
    if (!targetUsername || !action) {
      return NextResponse.json({ error: 'Target username and action are required' }, { status: 400 });
    }

    if (!['follow', 'unfollow'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Get current user
    const currentUser = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { username: 1, name: 1 } }
    );

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get target user
    const targetUser = await db.collection('users').findOne(
      { username: targetUsername },
      { projection: { username: 1, name: 1, email: 1, isPublicProfile: 1 } }
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if target profile is public
    if (targetUser.isPublicProfile === false) {
      return NextResponse.json({ error: 'Cannot follow private profile' }, { status: 403 });
    }

    // Prevent self-following
    if (currentUser.username === targetUsername) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const followData = {
      followerUsername: currentUser.username,
      followerEmail: session.user.email,
      followingUsername: targetUsername,
      followingEmail: targetUser.email,
      createdAt: new Date()
    };

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await db.collection('user_follows').findOne({
        followerUsername: currentUser.username,
        followingUsername: targetUsername
      });

      if (existingFollow) {
        return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
      }

      await db.collection('user_follows').insertOne(followData);
      
      // Create notification for the followed user
      try {
        await api.post('/api/notifications', {
          type: 'follow',
          recipientEmail: targetUser.email,
          data: {
            followerUsername: currentUser.username,
            followerName: currentUser.name,
            message: `${currentUser.name} started following you`
          }
        });
      } catch (error) {
        console.error('Failed to create follow notification:', error);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `You are now following ${targetUser.name}`,
        action: 'followed'
      });
    } else {
      // Unfollow
      const result = await db.collection('user_follows').deleteOne({
        followerUsername: currentUser.username,
        followingUsername: targetUsername
      });

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `You unfollowed ${targetUser.name}`,
        action: 'unfollowed'
      });
    }

  } catch (error) {
    console.error('Follow action error:', error);
    return NextResponse.json(
      { error: 'Failed to process follow action' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const type = searchParams.get('type'); // 'followers' or 'following'

    if (!username || !type) {
      return NextResponse.json({ error: 'Username and type are required' }, { status: 400 });
    }

    if (!['followers', 'following'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const db = await connectToDatabase();

    let query;
    if (type === 'followers') {
      query = { followingUsername: username };
    } else {
      query = { followerUsername: username };
    }

    const follows = await db.collection('user_follows')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Get user details for the follows
    const usernames = follows.map((follow: { followerUsername: string; followingUsername: string }) => 
      type === 'followers' ? follow.followerUsername : follow.followingUsername
    );

    const users = await db.collection('users')
      .find(
        { username: { $in: usernames } },
        { projection: { username: 1, name: 1, image: 1, bio: 1 } }
      )
      .toArray();

    interface UserRecord {
      username: string;
      name: string;
      image?: string;
      bio?: string;
    }

    const userMap = users.reduce((acc: Record<string, UserRecord>, user: UserRecord) => {
      acc[user.username] = user;
      return acc;
    }, {} as Record<string, UserRecord>);

    const result = follows.map((follow: { followerUsername: string; followingUsername: string }) => {
      const username = type === 'followers' ? follow.followerUsername : follow.followingUsername;
      return {
        ...follow,
        user: userMap[username] || null
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });

  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json(
      { error: 'Failed to get follows' },
      { status: 500 }
    );
  }
}
