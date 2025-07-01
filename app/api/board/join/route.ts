import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger';

interface JoinBoardData {
  boardId: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: JoinBoardData = await request.json();
    const { boardId, user } = body;

    // Validate required fields
    if (!boardId || !user?.id || !user?.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this join action
    if (session.user.id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized join action' },
        { status: 403 }
      );
    }

    try {
      // Publish user joined event
      pubSub.publish('userJoined', boardId, {
        id: user.id,
        name: user.name,
        email: user.email || session.user.email || '',
        avatar: user.avatar || session.user.image || '',
        isOnline: true,
      });

      logger.debug(`User ${user.id} joined board ${boardId}`);
    } catch (error) {
      logger.error('Error publishing user joined event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to announce user join' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User join announced',
    });

  } catch (error) {
    logger.error('Error handling user join:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
