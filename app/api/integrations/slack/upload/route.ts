import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, getDefaultSlackChannelForEmail, uploadSlackFile } from '@/lib/integrations/slackService';
import logger from '@/lib/logger/logger';

function inferFiletype(filename: string | null): string | undefined {
  if (!filename) return undefined;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png')) return 'png';
  if (lower.endsWith('.svg')) return 'svg';
  if (lower.endsWith('.json')) return 'json';
  return undefined;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file') as unknown as Blob | null;
    const filename = (form.get('filename') as string) || 'export';
    const channelId = (form.get('channelId') as string) || '';
    if (!file) {
      return NextResponse.json({ error: 'file required' }, { status: 400 });
    }

    const token = await getSlackBotTokenForEmail(session.user.email);
    if (!token) {
      return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
    }

    let finalChannelId = channelId;
    if (!finalChannelId) {
      const defaultChannel = await getDefaultSlackChannelForEmail(session.user.email);
      if (!defaultChannel?.id) {
        return NextResponse.json({ error: 'No Slack channel specified and no default channel configured' }, { status: 400 });
      }
      finalChannelId = defaultChannel.id;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ok = await uploadSlackFile(token, [finalChannelId], buffer, filename, inferFiletype(filename));
    return NextResponse.json({ success: ok });
  } catch (error) {
    logger.error({ error }, 'Slack upload endpoint error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


