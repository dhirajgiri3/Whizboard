import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Find and update the invitation
    const result = await db.collection('workspace_invitations').updateOne(
      {
        invitationToken: token,
        email,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          status: 'declined',
          declinedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Redirect to a decline confirmation page
    return NextResponse.redirect(new URL('/invitation-declined', request.url));

  } catch (error) {
    logger.error('Error declining workspace invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}