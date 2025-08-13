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

    // Find the invitation by token + email and ensure it hasn't expired
    const invitation = await db.collection('board_invitations').findOne({
      invitationToken: token,
      inviteeEmail: email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Load board for display info
    const board = await db.collection('boards').findOne(
      { _id: invitation.boardId },
      { projection: { name: 1 } }
    );

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Load inviter user details
    const inviter = await db.collection('users').findOne(
      { _id: invitation.inviterUserId },
      { projection: { name: 1, email: 1 } }
    );

    const inviterName = inviter?.name || 'Team Member';
    const inviterEmail = inviter?.email || '';

    return NextResponse.json({
      invitation: {
        boardId: invitation.boardId.toString(),
        boardName: board.name as string,
        inviterName,
        inviterEmail,
        message: invitation.message || '',
        expiresAt: invitation.expiresAt.toISOString(),
      }
    });
  } catch (error) {
    logger.error('Error validating invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
