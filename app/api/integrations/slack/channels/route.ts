import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, listSlackChannels, inviteBotToChannel } from '@/lib/integrations/slackService';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to get Slack channels');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  logger.info({ userEmail: session.user.email }, 'Getting Slack channels for user');

  try {
    const token = await getSlackBotTokenForEmail(session.user.email);
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'No Slack token found for user');
      return NextResponse.json({ channels: [] });
    }

    logger.info({ userEmail: session.user.email, hasToken: true }, 'Retrieved Slack token, fetching channels');
    const channels = await listSlackChannels(token);
    
    logger.info({ userEmail: session.user.email, channelCount: channels.length }, 'Successfully retrieved Slack channels');
    return NextResponse.json({ channels });
  } catch (error) {
    logger.error({ userEmail: session.user.email, error }, 'Failed to get Slack channels');
    return NextResponse.json({ channels: [] });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to invite bot to Slack channel');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channelId } = await request.json();
    
    if (!channelId) {
      logger.warn({ userEmail: session.user.email }, 'Missing channelId in request');
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    logger.info({ userEmail: session.user.email, channelId }, 'Attempting to invite bot to Slack channel');

    const token = await getSlackBotTokenForEmail(session.user.email);
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'No Slack token found for user');
      return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
    }

    const success = await inviteBotToChannel(token, channelId);
    
    if (success) {
      logger.info({ userEmail: session.user.email, channelId }, 'Successfully invited bot to Slack channel');
      return NextResponse.json({ success: true, message: 'Bot invited to channel successfully' });
    } else {
      logger.warn({ userEmail: session.user.email, channelId }, 'Failed to invite bot to Slack channel');
      return NextResponse.json({ success: false, message: 'Failed to invite bot to channel' }, { status: 500 });
    }
  } catch (error) {
    logger.error({ userEmail: session.user.email, error }, 'Failed to invite bot to Slack channel');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


