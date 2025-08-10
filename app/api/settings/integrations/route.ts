import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json({
      googleDrive: has('googleDrive'),
      slack: has('slack'),
      figma: has('figma'),
    });
  } catch (error) {
    console.error('Integrations GET error:', error);
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
      'googleDrive' | 'slack' | 'figma',
      boolean
    ]>;
    if (entries.length !== 1) {
      return NextResponse.json({ error: 'Send exactly one service toggle at a time' }, { status: 400 });
    }

    const [service, enable] = entries[0];
    const providerToStartPath: Record<typeof service, string> = {
      slack: '/api/integrations/slack/auth/start',
      googleDrive: '/api/integrations/google-drive/auth/start',
      figma: '/api/integrations/figma/auth/start',
    } as const;

    if (enable) {
      // Frontend should redirect to this URL to start OAuth
      const redirectUrl = providerToStartPath[service];
      return NextResponse.json({ redirectUrl });
    }

    // Disconnect: delete tokens
    const db = await connectToDatabase();
    await db.collection('integrationTokens').deleteMany({
      userEmail: session.user.email,
      provider: service,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Integrations PUT error:', error);
    return NextResponse.json({ error: 'Failed to update integrations' }, { status: 500 });
  }
}

// end