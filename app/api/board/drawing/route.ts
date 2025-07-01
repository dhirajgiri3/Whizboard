import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger';

interface DrawingData {
  boardId: string;
  userId: string;
  userName: string;
  line: {
    id: string;
    points: number[];
    tool: string;
    color: string;
    strokeWidth: number;
  };
  action: 'start' | 'update' | 'complete';
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

    const body: DrawingData = await request.json();
    const { boardId, userId, userName, line, action } = body;

    // Validate required fields
    if (!boardId || !userId || !line || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this drawing action
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized drawing action' },
        { status: 403 }
      );
    }

    try {
      // Broadcast the drawing action to all board subscribers
      const drawingEvent = {
        boardId,
        userId,
        userName: userName || session.user.name || 'Unknown User',
        line,
        action,
        timestamp: Date.now(),
      };

      switch (action) {
        case 'start':
          pubSub.publish('drawingStarted', boardId, drawingEvent);
          logger.debug(`Drawing started by user ${userId} on board ${boardId}`);
          break;

        case 'update':
          pubSub.publish('drawingUpdated', boardId, drawingEvent);
          break;

        case 'complete':
          pubSub.publish('drawingCompleted', boardId, drawingEvent);
          logger.debug(`Drawing completed by user ${userId} on board ${boardId}`);
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (error) {
      logger.error('Error publishing drawing update:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast drawing update' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Drawing ${action} broadcasted`,
    });

  } catch (error) {
    logger.error('Error handling drawing update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
