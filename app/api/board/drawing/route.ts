import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { boardId, userId, userName, line, action } = body;

    if (!boardId || !userId || !line || !action || userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Publish drawing event based on action type
    const eventMap: Record<string, string> = {
      start: 'drawingStarted',
      update: 'drawingUpdated',
      complete: 'drawingCompleted',
    };

    const eventType = eventMap[action];
    if (!eventType) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    pubSub.publish(eventType, boardId, {
      userId,
      userName: userName || session.user.name,
      line,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error broadcasting drawing:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
