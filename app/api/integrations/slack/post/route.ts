import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, postSlackMessage } from '@/lib/integrations/slackService';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { channelId, text } = await request.json();
  if (!channelId || !text) {
    return NextResponse.json({ error: 'channelId and text required' }, { status: 400 });
  }
  const token = await getSlackBotTokenForEmail(session.user.email);
  if (!token) {
    return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
  }
  const ok = await postSlackMessage(token, channelId, text);
  return NextResponse.json({ success: ok });
}


