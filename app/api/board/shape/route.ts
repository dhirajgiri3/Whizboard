import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';
import { ShapeElement } from '@/types';

interface ShapeRequestData {
  boardId: string;
  userId: string;
  userName: string;
  shapeElement: ShapeElement;
  action: 'create' | 'update' | 'delete' | 'transform';
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

    const body: ShapeRequestData = await request.json();
    const { boardId, userId, userName, shapeElement, action } = body;

    // Validate required fields
    if (!boardId || !userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this shape action
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized shape action' },
        { status: 403 }
      );
    }

    try {
      // Broadcast the shape action to all board subscribers
      const timestamp = Date.now();

      switch (action) {
        case 'create':
          if (!shapeElement) {
            return NextResponse.json(
              { success: false, error: 'Shape element data required for create action' },
              { status: 400 }
            );
          }

          const createEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            shapeElement,
            timestamp,
          };

          pubSub.publish('shapeElementCreated', boardId, createEvent);
          logger.debug(`Shape element created by user ${userId} on board ${boardId}`);
          break;

        case 'update':
          if (!shapeElement) {
            return NextResponse.json(
              { success: false, error: 'Shape element data required for update action' },
              { status: 400 }
            );
          }

          const updateEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            shapeElement,
            timestamp,
          };

          pubSub.publish('shapeElementUpdated', boardId, updateEvent);
          logger.debug(`Shape element updated by user ${userId} on board ${boardId}`);
          break;

        case 'delete':
          if (!shapeElement?.id) {
            return NextResponse.json(
              { success: false, error: 'Shape element ID required for delete action' },
              { status: 400 }
            );
          }

          const deleteEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            shapeElementId: shapeElement.id,
            timestamp,
          };

          pubSub.publish('shapeElementDeleted', boardId, deleteEvent);
          logger.debug(`Shape element deleted by user ${userId} on board ${boardId}`);
          break;

        case 'transform':
          if (!shapeElement) {
            return NextResponse.json(
              { success: false, error: 'Shape element data required for transform action' },
              { status: 400 }
            );
          }

          const transformEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            shapeElement,
            timestamp,
          };

          pubSub.publish('shapeElementTransformed', boardId, transformEvent);
          logger.debug(`Shape element transformed by user ${userId} on board ${boardId}`);
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action type' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        message: `Shape ${action} broadcasted successfully`,
        timestamp,
      });

    } catch (pubSubError) {
      logger.error('PubSub error:', pubSubError);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast shape action' },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Shape API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 