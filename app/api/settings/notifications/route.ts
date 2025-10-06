import { NextRequest, NextResponse } from 'next/server';
import { getCachedSession } from '@/lib/auth/session-cache';
import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

// Simple in-memory cache for notification settings
const notificationCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds cache (increased from 30s)

type EmailPrefs = {
  boardInvitations: boolean;
  activityUpdates: boolean;
  weeklyDigest: boolean;
};

type SlackPrefs = {
  boardEvents: boolean;
};

export type NotificationPreferences = {
  email: EmailPrefs;
  slack: SlackPrefs;
};

const DEFAULT_PREFS: NotificationPreferences = {
  email: {
    boardInvitations: true,
    activityUpdates: true,
    weeklyDigest: false,
  },
  slack: {
    boardEvents: true,
  },
};

export async function GET() {
  const session = await getCachedSession();
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to get notification preferences');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userEmail = session.user.email;
  const cacheKey = `notifications:${userEmail}`;

  // Check cache first
  const cached = notificationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'private, max-age=30' }
    });
  }

  try {
    const db = await connectToDatabase();
    const settingsDoc = await db
      .collection('userSettings')
      .findOne({ userEmail }, { projection: { notifications: 1 } });

    const merged: NotificationPreferences = {
      email: {
        ...DEFAULT_PREFS.email,
        ...(settingsDoc?.notifications?.email ?? {}),
      },
      slack: {
        ...DEFAULT_PREFS.slack,
        ...(settingsDoc?.notifications?.slack ?? {}),
      },
    };

    // Cache the result
    notificationCache.set(cacheKey, { data: merged, timestamp: Date.now() });

    return NextResponse.json(merged, {
      headers: { 'Cache-Control': 'private, max-age=30' }
    });
  } catch (error) {
    logger.error({ error }, 'Failed to get notification preferences');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getCachedSession();
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to update notification preferences');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const incoming = (await request.json()) as Partial<NotificationPreferences>;

    // Basic shape normalization and merging with existing
    const db = await connectToDatabase();
    const existing = await db
      .collection('userSettings')
      .findOne({ userEmail: session.user.email }, { projection: { notifications: 1 } });

    const nextPrefs: NotificationPreferences = {
      email: {
        ...DEFAULT_PREFS.email,
        ...(existing?.notifications?.email ?? {}),
        ...(incoming.email ?? {}),
      },
      slack: {
        ...DEFAULT_PREFS.slack,
        ...(existing?.notifications?.slack ?? {}),
        ...(incoming.slack ?? {}),
      },
    };

    const result = await db.collection('userSettings').updateOne(
      { userEmail: session.user.email },
      { $set: { notifications: nextPrefs } },
      { upsert: true }
    );

    // Invalidate cache
    const cacheKey = `notifications:${session.user.email}`;
    notificationCache.delete(cacheKey);

    logger.info({ userEmail: session.user.email, modifiedCount: result.modifiedCount }, 'Saved notification preferences');

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Failed to update notification preferences');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


