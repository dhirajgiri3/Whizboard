import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/?error=invalid-decline-link', request.url));
    }

    // Connect to database
    const db = await connectToDatabase();

    // Find and update the invitation
    const result = await db.collection('board_invitations').updateOne(
      {
        invitationToken: token,
        inviteeEmail: email,
        status: 'pending'
      },
      {
        $set: {
          status: 'declined',
          declinedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      logger.warn(`Invalid decline attempt for token: ${token}, email: ${email}`);
      return NextResponse.redirect(new URL('/?error=invalid-invitation', request.url));
    }

    // Get the invitation to find the board ID for real-time notification
    const invitation = await db.collection('board_invitations').findOne({
      invitationToken: token,
      inviteeEmail: email,
      status: 'declined'
    });

    // Publish real-time notification for status change
    if (invitation) {
      try {
        const { pubSub } = await import('@/lib/graphql/schema');
        pubSub.publish('invitationStatusChanged', invitation.boardId.toString(), {
          invitationId: invitation._id.toString(),
          status: 'declined',
          email: email
        });
      } catch (error) {
        logger.error('Failed to publish invitation declined event:', error);
      }
    }

    logger.info(`Invitation declined via email link: ${email}`);
    
    // Redirect to a decline confirmation page
    return NextResponse.redirect(new URL('/invitation-declined', request.url));

  } catch (error) {
    logger.error('Error declining invitation via email:', error);
    return NextResponse.redirect(new URL('/?error=server-error', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, email, reason } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();

    // Find and update the invitation
    const result = await db.collection('board_invitations').updateOne(
      {
        invitationToken: token,
        inviteeEmail: email,
        status: 'pending'
      },
      {
        $set: {
          status: 'declined',
          declinedAt: new Date(),
          declineReason: reason || null
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Invalid invitation or already processed' },
        { status: 404 }
      );
    }

    // Get the invitation to find the board ID for real-time notification
    const invitation = await db.collection('board_invitations').findOne({
      invitationToken: token,
      inviteeEmail: email,
      status: 'declined'
    });

    // Publish real-time notification for status change
    if (invitation) {
      try {
        const { pubSub } = await import('@/lib/graphql/schema');
        pubSub.publish('invitationStatusChanged', invitation.boardId.toString(), {
          invitationId: invitation._id.toString(),
          status: 'declined',
          email: email
        });
      } catch (error) {
        logger.error('Failed to publish invitation declined event:', error);
      }
    }

    logger.info(`Invitation declined: ${email}, reason: ${reason || 'No reason provided'}`);

    return NextResponse.json({
      success: true,
      message: 'Invitation declined successfully'
    });

  } catch (error) {
    logger.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
