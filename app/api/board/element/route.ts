import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger';

interface ElementData {
  boardId: string;
  action: 'add' | 'update' | 'delete';
  element?: {
    id: string;
    type: 'line' | 'shape' | 'frame' | 'text';
    data: Record<string, unknown>;
    userId: string;
    timestamp: number;
  };
  elementId?: string;
  userId: string;
  timestamp: number;
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

    const body: ElementData = await request.json();
    const { boardId, action, element, elementId, userId } = body;

    // Validate required fields
    if (!boardId || !action || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this action
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized action' },
        { status: 403 }
      );
    }

    try {
      switch (action) {
        case 'add':
          if (!element) {
            return NextResponse.json(
              { success: false, error: 'Element data required for add action' },
              { status: 400 }
            );
          }
          
          pubSub.publish('elementAdded', boardId, element);
          logger.debug(`Element added by user ${userId} on board ${boardId}`);
          break;

        case 'update':
          if (!element) {
            return NextResponse.json(
              { success: false, error: 'Element data required for update action' },
              { status: 400 }
            );
          }
          
          pubSub.publish('elementUpdated', boardId, element);
          logger.debug(`Element updated by user ${userId} on board ${boardId}`);
          break;

        case 'delete':
          if (!elementId) {
            return NextResponse.json(
              { success: false, error: 'Element ID required for delete action' },
              { status: 400 }
            );
          }
          
          pubSub.publish('elementDeleted', boardId, {
            elementId,
            userId,
            timestamp: Date.now(),
          });
          logger.debug(`Element deleted by user ${userId} on board ${boardId}`);
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (error) {
      logger.error('Error publishing element change:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast element change' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Element ${action} broadcasted`,
    });

  } catch (error) {
    logger.error('Error handling element change:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
