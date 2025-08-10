import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger/logger';
import { getAppBaseUrl } from '@/lib/config/integrations';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

// GET: return current integration connection booleans based on stored tokens
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    const userEmail = session.user.email;
    const tokens = await db
      .collection('integrationTokens')
      .find({ userEmail })
      .project({ provider: 1 })
      .toArray();

    const has = (provider: string) => tokens.some((t: any) => t.provider === provider);

    const payload = {
      googleDrive: has('googleDrive'),
      slack: has('slack'),
    };
    logger.info({ userEmail, ...payload }, 'Integrations status fetched');
    return NextResponse.json(payload);
  } catch (error) {
    logger.error({ error }, 'Integrations GET error');
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 500 });
  }
}

// PUT: enable=false -> disconnect (delete tokens). enable=true -> return redirectUrl to start OAuth.
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const entries = Object.entries(body) as Array<[
      'googleDrive' | 'slack',
      boolean
    ]>;
    if (entries.length !== 1) {
      return NextResponse.json({ error: 'Send exactly one service toggle at a time' }, { status: 400 });
    }

    const [service, enable] = entries[0];
    logger.info({ userEmail: session.user.email, service, enable }, 'Integrations PUT');
    const providerToStartPath: Record<typeof service, string> = {
      slack: '/api/integrations/slack/auth/start',
      googleDrive: '/api/integrations/google-drive/auth/start',
    } as const;

    if (enable) {
      // Frontend should redirect to this URL to start OAuth
      const path = providerToStartPath[service];
      const absoluteRedirect = new URL(path, getAppBaseUrl()).toString();
      logger.info({ userEmail: session.user.email, absoluteRedirect }, 'Integrations OAuth start URL generated');
      return NextResponse.json({ redirectUrl: absoluteRedirect });
    }

    // Disconnect: delete tokens
    const db = await connectToDatabase();
    await db.collection('integrationTokens').deleteMany({
      userEmail: session.user.email,
      provider: service,
    });

    logger.info({ userEmail: session.user.email, service }, 'Integration disconnected');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Integrations PUT error');
    return NextResponse.json({ error: 'Failed to update integrations' }, { status: 500 });
  }
}

// end