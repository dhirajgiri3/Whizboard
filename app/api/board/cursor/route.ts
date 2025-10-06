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
    const { boardId, userId, x, y, name, currentTool, isDrawing, isSelecting, activeElementId, pressure } = body;

    if (!boardId || userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Publish cursor movement event via SSE
    pubSub.publish('cursorMovement', boardId, {
      userId,
      name: name || session.user.name,
      x,
      y,
      currentTool,
      isDrawing,
      isSelecting,
      activeElementId,
      pressure,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error broadcasting cursor:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
