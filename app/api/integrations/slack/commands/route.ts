import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, postSlackMessage } from '@/lib/integrations/slackService';
import logger from '@/lib/logger/logger';

// Slack sends x-www-form-urlencoded
async function parseForm(request: NextRequest): Promise<Record<string, string>> {
  const text = await request.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  for (const [k, v] of params.entries()) result[k] = v;
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('unauthorized', { status: 401 });
    }

    const form = await parseForm(request);
    const command = form.command; // e.g. /whiz
    const text = (form.text || '').trim();
    const channelId = form.channel_id;

    const token = await getSlackBotTokenForEmail(session.user.email);
    if (!token) return new NextResponse('Slack not connected', { status: 200 });

    if (text.startsWith('export')) {
      await postSlackMessage(token, channelId, 'Okay, opening export modal in the app…');
      return NextResponse.json({ response_type: 'ephemeral', text: 'Use the Export button in Whizboard to choose format and channel.' });
    }

    if (text.startsWith('help') || text.length === 0) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Commands: export <board>, invite <@user> <board>, search <query>',
      });
    }

    return NextResponse.json({ response_type: 'ephemeral', text: 'Command received.' });
  } catch (error) {
    logger.error({ error }, 'Slack command handler error');
    return new NextResponse('ok');
  }
}


