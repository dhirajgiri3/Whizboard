import { NextRequest, NextResponse } from 'next/server';
import { getAppBaseUrl } from '@/lib/config/integrations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import logger from '@/lib/logger/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // URL verification challenge during Slack event subscription setup
    if (body && body.type === 'url_verification' && body.challenge) {
      return NextResponse.json({ challenge: body.challenge });
    }

    // Handle link shared unfurl events
    if (body && body.type === 'event_callback' && body.event?.type === 'link_shared') {
      // For now, acknowledge. Full unfurl requires a response via chat.unfurl using bot token.
      logger.info({ links: body.event.links?.length || 0 }, 'Received link_shared event');
      return NextResponse.json({ ok: true });
    }

    // Generic ack for other events
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ error }, 'Slack events handler error');
    return NextResponse.json({ ok: true });
  }
}


