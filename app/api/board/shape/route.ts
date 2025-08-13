import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface ShapeElementPayload {
  id: string;
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shapeType: string;
  shapeData: Record<string, unknown>;
  style: Record<string, unknown>;
  draggable: boolean;
  resizable: boolean;
  rotatable: boolean;
  selectable: boolean;
  locked: boolean;
  zIndex: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

interface ShapeBody {
  boardId: string;
  userId: string;
  userName: string;
  shapeElement: Partial<ShapeElementPayload> & { id?: string };
  action: 'create' | 'update' | 'delete' | 'transform';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body: ShapeBody = await request.json();
    const { boardId, userId, userName, shapeElement, action } = body || {} as ShapeBody;

    if (!boardId || !userId || !userName || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (session.user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized shape event' }, { status: 403 });
    }

    const timestamp = Date.now();

    try {
      if (action === 'create') {
        pubSub.publish('shapeElementCreated', boardId, { boardId, userId, userName, shapeElement: shapeElement as any, timestamp });
      } else if (action === 'update') {
        pubSub.publish('shapeElementUpdated', boardId, { boardId, userId, userName, shapeElement: shapeElement as any, timestamp });
      } else if (action === 'delete') {
        if (!shapeElement?.id) {
          return NextResponse.json({ success: false, error: 'shapeElement.id required for delete' }, { status: 400 });
        }
        pubSub.publish('shapeElementDeleted', boardId, { boardId, userId, userName, shapeElementId: shapeElement.id, timestamp });
      } else if (action === 'transform') {
        pubSub.publish('shapeElementTransformed', boardId, { boardId, userId, userName, shapeElement: shapeElement as any, timestamp });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to publish shape event');
      return NextResponse.json({ success: false, error: 'Failed to broadcast shape event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error handling shape event');
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// No GET handler for this route