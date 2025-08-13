import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger/logger';

interface ElementBody {
  boardId: string;
  userId: string;
  userName: string;
  element?: { id: string; type: string; data: Record<string, unknown> };
  elementId?: string;
  action: 'update' | 'delete' | 'add';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body: ElementBody = await request.json();
    const { boardId, userId, userName, element, elementId, action } = body || {} as ElementBody;

    if (!boardId || !userId || !userName || !action) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (session.user.id !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized element event' }, { status: 403 });
    }

    const timestamp = Date.now();

    try {
      if (action === 'add') {
        if (!element) return NextResponse.json({ success: false, error: 'element required for add' }, { status: 400 });
        pubSub.publish('elementAdded', boardId, { id: element.id, type: element.type, data: element.data, userId, timestamp });
      } else if (action === 'update') {
        if (!element) return NextResponse.json({ success: false, error: 'element required for update' }, { status: 400 });
        pubSub.publish('elementUpdated', boardId, { id: element.id, type: element.type, data: element.data, userId, timestamp });
      } else if (action === 'delete') {
        if (!elementId) return NextResponse.json({ success: false, error: 'elementId required for delete' }, { status: 400 });
        pubSub.publish('elementDeleted', boardId, { id: elementId, userId, timestamp, type: 'element' });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to publish element event');
      return NextResponse.json({ success: false, error: 'Failed to broadcast element event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error handling element event');
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// No duplicate handlers below
