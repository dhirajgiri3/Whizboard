import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getDefaultSlackChannelForEmail, getSlackBotTokenForEmail, postSlackMessage } from '@/lib/integrations/slackService';

function getAppOrigin(request: NextRequest): string {
  // Prefer explicit public URL if configured
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;
  if (envOrigin) return envOrigin.replace(/\/$/, '');
  // Fallback to request origin
  try {
    return request.nextUrl.origin.replace(/\/$/, '');
  } catch {
    return '';
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { boardId, boardName, boardUrl, channelId, message } = await request.json();
  if (!boardId) {
    return NextResponse.json({ error: 'boardId required' }, { status: 400 });
  }

  const token = await getSlackBotTokenForEmail(session.user.email);
  if (!token) {
    return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
  }

  let targetChannelId: string | undefined = channelId;
  if (!targetChannelId) {
    const defaultChannel = await getDefaultSlackChannelForEmail(session.user.email);
    if (!defaultChannel?.id) {
      return NextResponse.json({ error: 'No default Slack channel configured' }, { status: 400 });
    }
    targetChannelId = defaultChannel.id;
  }

  const origin = getAppOrigin(request);
  const computedBoardUrl = boardUrl || (origin ? `${origin}/board/${boardId}` : `/board/${boardId}`);
  const text = (message && String(message).trim().length > 0)
    ? String(message)
    : `Check out this board${boardName ? `: ${boardName}` : ''}\n\nView it here: ${computedBoardUrl}`;

  const ok = await postSlackMessage(token, targetChannelId, text);
  return NextResponse.json({ success: ok });
}


