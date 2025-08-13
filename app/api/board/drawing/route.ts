import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface DrawingLineData {
  id: string;
  points: number[];
  tool: string;
  color: string;
  strokeWidth: number;
}

interface DrawingBody {
  boardId: string;
  userId: string;
  userName: string;
  line: DrawingLineData;
  action: 'start' | 'update' | 'complete';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body: DrawingBody = await request.json();
    const { boardId, userId, userName, line, action } = body || {} as DrawingBody;

    if (!boardId || !userId || !userName || !line || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (session.user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized drawing event' }, { status: 403 });
    }

    const payload = { boardId, userId, userName, line, timestamp: Date.now() };

    try {
      if (action === 'start') {
        pubSub.publish('drawingStarted', boardId, payload);
      } else if (action === 'update') {
        pubSub.publish('drawingUpdated', boardId, payload);
      } else if (action === 'complete') {
        pubSub.publish('drawingCompleted', boardId, payload);
      }
      logger.debug({ boardId, userId, action }, 'Drawing event published');
    } catch (error) {
      logger.error({ error }, 'Failed to publish drawing event');
      return NextResponse.json({ success: false, error: 'Failed to broadcast drawing event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error handling drawing event');
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
