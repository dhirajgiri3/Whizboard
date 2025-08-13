import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface CursorData {
  boardId: string;
  userId: string;
  name: string;
  x: number;
  y: number;
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

    const body: CursorData = await request.json();
    const { boardId, userId, name, x, y } = body;

    // Validate required fields
    if (!boardId || !userId || typeof x !== 'number' || typeof y !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this cursor movement
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cursor movement' },
        { status: 403 }
      );
    }

    // Publish cursor movement to all board subscribers
    try {
      pubSub.publish('cursorMovement', boardId, {
        x,
        y,
        userId,
        name: name || session.user.name || 'Unknown User',
      });

      logger.debug(`Cursor movement broadcasted for user ${userId} on board ${boardId}`);
    } catch (error) {
      logger.error('Error publishing cursor movement:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast cursor movement' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cursor movement broadcasted',
    });

  } catch (error) {
    logger.error('Error handling cursor movement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
