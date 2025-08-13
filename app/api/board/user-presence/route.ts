import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';
import { UserPresenceData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: { boardId: string; userId: string; presence: UserPresenceData } = await request.json();
    const { boardId, userId, presence } = body;

    // Validate required fields
    if (!boardId || !userId || !presence) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user owns this presence update
    if (session.user.id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized presence update' },
        { status: 403 }
      );
    }

    try {
      // Publish user presence update to all board subscribers
      pubSub.publish('userPresenceUpdate', boardId, {
        userId,
        presence,
      });

      logger.debug(`User presence updated for user ${userId} on board ${boardId}`);
    } catch (error) {
      logger.error('Error publishing user presence update:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to broadcast user presence update' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User presence update broadcasted',
    });

  } catch (error) {
    logger.error('Error handling user presence update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
