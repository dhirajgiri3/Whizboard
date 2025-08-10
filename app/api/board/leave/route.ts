import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface LeaveBoardData {
  boardId: string;
  userId: string;
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

    const body: LeaveBoardData = await request.json();
    const { boardId, userId } = body;

    // Validate required fields
    if (!boardId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this leave action
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized leave action' },
        { status: 403 }
      );
    }

    try {
      // Publish user left event
      pubSub.publish('userLeft', boardId, {
        id: userId,
      });

      logger.debug(`User ${userId} left board ${boardId}`);
    } catch (error) {
      logger.error('Error publishing user left event:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to announce user leave' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User leave announced',
    });

  } catch (error) {
    logger.error('Error handling user leave:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
