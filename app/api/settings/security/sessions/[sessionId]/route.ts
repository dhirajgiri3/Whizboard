import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.pathname.split('/').pop();

  if (!sessionId) {
    return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
  }

  // In a real application, you would revoke the specific session for the authenticated user.
  console.log(`Attempting to revoke session: ${sessionId}`);

  // Simulate successful session revocation
  return NextResponse.json({ message: `Session ${sessionId} revoked successfully` });
} 