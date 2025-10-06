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
    const { boardId, userId, presence } = body;

    if (!boardId || !userId || userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Publish user presence update event
    pubSub.publish('userPresenceUpdate', boardId, {
      userId,
      presence,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error broadcasting user presence:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
