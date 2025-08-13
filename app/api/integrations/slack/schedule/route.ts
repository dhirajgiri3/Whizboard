import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, scheduleSlackMessage } from '@/lib/integrations/slackService';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { channelId, text, postAt } = await request.json();
  if (!channelId || !text || !postAt) {
    return NextResponse.json({ error: 'channelId, text and postAt required' }, { status: 400 });
  }

  // Ensure postAt is a number of epoch seconds, not ms
  const postAtSeconds = typeof postAt === 'number' ? Math.floor(postAt) : parseInt(postAt, 10);
  if (!Number.isFinite(postAtSeconds) || postAtSeconds <= Math.floor(Date.now() / 1000)) {
    return NextResponse.json({ error: 'postAt must be a future epoch seconds timestamp' }, { status: 400 });
  }

  const token = await getSlackBotTokenForEmail(session.user.email);
  if (!token) {
    return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
  }

  const result = await scheduleSlackMessage(token, channelId, text, postAtSeconds);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error || 'failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, scheduledMessageId: result.scheduledMessageId, postAt: result.postAt });
}


