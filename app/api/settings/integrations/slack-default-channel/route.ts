import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to get Slack default channel');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await connectToDatabase();
    const settings = await db.collection('userSettings').findOne(
      { userEmail: session.user.email },
      { projection: { slackDefaultChannel: 1 } }
    );

    const defaultChannel = settings?.slackDefaultChannel || null;
    logger.info({ userEmail: session.user.email, defaultChannel }, 'Retrieved Slack default channel');
    
    return NextResponse.json({ defaultChannel });
  } catch (error) {
    logger.error({ userEmail: session.user.email, error }, 'Failed to retrieve Slack default channel');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to set Slack default channel');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { channelId, channelName } = await request.json();
    logger.info({ userEmail: session.user.email, channelId, channelName }, 'Setting Slack default channel');
    
    if (!channelId) {
      logger.warn({ userEmail: session.user.email }, 'Missing channelId in request');
      return NextResponse.json({ error: 'channelId required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection('userSettings').updateOne(
      { userEmail: session.user.email },
      { $set: { slackDefaultChannel: { id: channelId, name: channelName || null } } },
      { upsert: true }
    );

    logger.info({ 
      userEmail: session.user.email, 
      channelId, 
      channelName, 
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId 
    }, 'Successfully saved Slack default channel');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ userEmail: session.user.email, error }, 'Failed to save Slack default channel');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


