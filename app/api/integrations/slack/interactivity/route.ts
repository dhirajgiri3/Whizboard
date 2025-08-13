import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, uploadSlackFile } from '@/lib/integrations/slackService';
import logger from '@/lib/logger/logger';

async function parsePayload(request: NextRequest) {
  const text = await request.text();
  const params = new URLSearchParams(text);
  const payload = params.get('payload');
  return payload ? JSON.parse(payload) : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({});
    }

    const payload = await parsePayload(request);
    if (!payload) return NextResponse.json({});

    const action = payload.actions?.[0];
    if (!action) return NextResponse.json({});

    // Example: handle export buttons
    if (action.action_id?.startsWith('whiz_export_')) {
      const value = action.value ? JSON.parse(action.value) : {};
      const format: string = value.format || 'png';
      const boardId: string = value.boardId;

      // no heavy lifting here; we trigger an async export flow elsewhere.
      logger.info({ boardId, format }, 'Slack export button clicked');
      return NextResponse.json({});
    }

    return NextResponse.json({});
  } catch (error) {
    logger.error({ error }, 'Slack interactivity handler error');
    return NextResponse.json({});
  }
}


