import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface TextElementData {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  formatting: {
    fontFamily: string;
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    highlight: boolean;
    highlightColor: string;
    align: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    listType: 'none' | 'bullet' | 'number';
    listStyle: string;
    listLevel: number;
  };
  style: {
    backgroundColor: string;
    backgroundOpacity: number;
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
    };
    shadow?: {
      blur: number;
      color: string;
      offsetX: number;
      offsetY: number;
      opacity: number;
    };
    opacity: number;
  };
  rotation: number;
  isEditing: boolean;
  isSelected: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

interface TextRequestData {
  boardId: string;
  userId: string;
  userName: string;
  textElement: TextElementData;
  action: 'create' | 'update' | 'delete' | 'startEdit' | 'finishEdit';
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

    const body: TextRequestData = await request.json();
    const { boardId, userId, userName, textElement, action } = body;

    // Validate required fields
    if (!boardId || !userId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this text action
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized text action' },
        { status: 403 }
      );
    }

    try {
      // Broadcast the text action to all board subscribers
      const timestamp = Date.now();

      switch (action) {
        case 'create':
          if (!textElement) {
            return NextResponse.json(
              { success: false, error: 'Text element data required for create action' },
              { status: 400 }
            );
          }

          const createEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            textElement,
            timestamp,
          };

          pubSub.publish('textElementCreated', boardId, createEvent);
          logger.debug(`Text element created by user ${userId} on board ${boardId}`);
          break;

        case 'update':
          if (!textElement) {
            return NextResponse.json(
              { success: false, error: 'Text element data required for update action' },
              { status: 400 }
            );
          }

          const updateEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            textElement,
            timestamp,
          };

          pubSub.publish('textElementUpdated', boardId, updateEvent);
          logger.debug(`Text element updated by user ${userId} on board ${boardId}`);
          break;

        case 'delete':
          if (!textElement?.id) {
            return NextResponse.json(
              { success: false, error: 'Text element ID required for delete action' },
              { status: 400 }
            );
          }

          const deleteEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            textElementId: textElement.id,
            timestamp,
          };

          pubSub.publish('textElementDeleted', boardId, deleteEvent);
          logger.debug(`Text element deleted by user ${userId} on board ${boardId}`);
          break;

        case 'startEdit':
          if (!textElement?.id) {
            return NextResponse.json(
              { success: false, error: 'Text element ID required for startEdit action' },
              { status: 400 }
            );
          }

          const startEditEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            textElementId: textElement.id,
            timestamp,
          };

          pubSub.publish('textElementEditingStarted', boardId, startEditEvent);
          logger.debug(`Text element editing started by user ${userId} on board ${boardId}`);
          break;

        case 'finishEdit':
          if (!textElement?.id) {
            return NextResponse.json(
              { success: false, error: 'Text element ID required for finishEdit action' },
              { status: 400 }
            );
          }

          const finishEditEvent = {
            boardId,
            userId,
            userName: userName || session.user.name || 'Unknown User',
            textElementId: textElement.id,
            timestamp,
          };

          pubSub.publish('textElementEditingFinished', boardId, finishEditEvent);
          logger.debug(`Text element editing finished by user ${userId} on board ${boardId}`);
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (error) {
      logger.error('Error publishing text element update:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast text element update' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Text element ${action} broadcasted`,
    });

  } catch (error) {
    logger.error('Error handling text element update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 