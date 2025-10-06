import { NextRequest, NextResponse } from 'next/server';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';
import { getOptimizedSession } from '@/lib/auth/session-cache';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Use optimized session without database hit
    const session = await getOptimizedSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { boardId, userId, userName, textElement, action } = body;

    if (!boardId || !userId || !action || userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Publish text element event based on action type
    const payload = {
      boardId,
      userId,
      userName: userName || session.user.name,
      textElement,
      timestamp: Date.now(),
    };

    switch (action) {
      case 'create':
        pubSub.publish('textElementAdded', boardId, payload);
        break;
      case 'update':
        pubSub.publish('textElementUpdated', boardId, payload);
        break;
      case 'delete':
        pubSub.publish('textElementDeleted', boardId, { 
          boardId,
          userId,
          userName: userName || session.user.name,
          textElementId: textElement?.id,
          timestamp: Date.now(),
        });
        break;
      case 'startEdit':
        pubSub.publish('textElementEditingStarted', boardId, { 
          boardId,
          userId,
          userName: userName || session.user.name,
          textElementId: textElement?.id,
          timestamp: Date.now(),
        });
        break;
      case 'finishEdit':
        pubSub.publish('textElementEditingFinished', boardId, { 
          boardId,
          userId,
          userName: userName || session.user.name,
          textElementId: textElement?.id,
          timestamp: Date.now(),
        });
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error broadcasting text element:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
