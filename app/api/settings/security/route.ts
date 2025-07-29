import { NextRequest, NextResponse } from 'next/server';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

// In-memory data store for demonstration
let securitySettings: SecuritySettings = {
  twoFactorEnabled: false,
  lastPasswordChange: '2023-01-15T10:00:00Z',
  activeSessions: [
    { id: '1', device: 'Chrome on Mac', location: 'New York, USA', lastActive: new Date().toISOString(), current: true },
    { id: '2', device: 'Firefox on Windows', location: 'London, UK', lastActive: '2024-07-20T14:30:00Z', current: false },
  ],
};

export async function GET() {
  return NextResponse.json(securitySettings);
}

export async function PUT(req: NextRequest) {
  const updates: Partial<SecuritySettings> = await req.json();
  securitySettings = { ...securitySettings, ...updates };
  return NextResponse.json(securitySettings);
}

export async function POST(req: NextRequest) {
  const { action } = await req.json();
  if (action === 'revokeAllSessions') {
    securitySettings.activeSessions = [securitySettings.activeSessions.find(s => s.current)!];
    return NextResponse.json({ message: 'All other sessions revoked' });
  }
  return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.pathname.split('/').pop();
  if (sessionId) {
    securitySettings.activeSessions = securitySettings.activeSessions.filter(s => s.id !== sessionId);
    return NextResponse.json({ message: `Session ${sessionId} revoked` });
  }
  return NextResponse.json({ message: 'Session ID required' }, { status: 400 });
} 