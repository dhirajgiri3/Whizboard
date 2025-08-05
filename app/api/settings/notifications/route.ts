import { NextRequest, NextResponse } from 'next/server';

interface NotificationSettings {
  email: {
    announcements: boolean;
    updates: boolean;
    security: boolean;
    mentions: boolean;
    boardInvites: boolean;
  };
  inApp: {
    mentions: boolean;
    comments: boolean;
    boardChanges: boolean;
    teamEvents: boolean;
    systemAlerts: boolean;
  };
}

let notificationSettings: NotificationSettings = {
  email: {
    announcements: true,
    updates: true,
    security: true,
    mentions: true,
    boardInvites: true,
  },
  inApp: {
    mentions: true,
    comments: true,
    boardChanges: true,
    teamEvents: true,
    systemAlerts: true,
  },
};

export async function GET() {
  return NextResponse.json(notificationSettings);
}

export async function PUT(req: NextRequest) {
  const updates: Partial<NotificationSettings> = await req.json();
  notificationSettings = { 
    ...notificationSettings, 
    email: { ...notificationSettings.email, ...updates.email },
    inApp: { ...notificationSettings.inApp, ...updates.inApp },
  };
  return NextResponse.json(notificationSettings);
} 