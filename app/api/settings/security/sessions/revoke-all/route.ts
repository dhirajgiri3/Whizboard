import { NextRequest, NextResponse } from 'next/server';

// In-memory data store - simplified for demonstration
let activeSessions = [
  { id: '1', device: 'Chrome on Mac', location: 'New York, USA', lastActive: new Date().toISOString(), current: true },
  { id: '2', device: 'Firefox on Windows', location: 'London, UK', lastActive: '2024-07-20T14:30:00Z', current: false },
];

export async function POST() {
  // In a real application, you would invalidate all sessions for the authenticated user
  // For this mock, we'll keep only the current session (if marked as current)
  activeSessions = activeSessions.filter(session => session.current);

  return NextResponse.json({ message: 'All other sessions revoked successfully' });
} 