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
    const { boardId, userId, element, elementId, action } = body;

    if (!boardId || !userId || !action || userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Publish element event based on action type
    switch (action) {
      case 'update':
        // elementUpdated expects: { id, type, data, userId, timestamp }
        pubSub.publish('elementUpdated', boardId, {
          id: element?.id || elementId,
          type: element?.type || 'unknown',
          data: element || {},
          userId,
          timestamp: Date.now(),
        });
        break;
      case 'delete':
        // elementDeleted expects: { id, userId, timestamp, type }
        pubSub.publish('elementDeleted', boardId, {
          id: elementId || element?.id,
          userId,
          timestamp: Date.now(),
          type: element?.type || 'unknown',
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
    logger.error('Error broadcasting element:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
