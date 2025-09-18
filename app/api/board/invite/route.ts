import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email/sendgrid';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/lib/logger/logger';
import { pubSub } from '@/lib/graphql/schema';
import { postSlackForUser } from '@/lib/integrations/slackService';
import { connectToDatabase as _connect } from '@/lib/database/mongodb';

interface BoardCollaborator {
  id: string;
  email: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const { boardId, inviteeEmail, message } = await request.json();

    if (!boardId || !inviteeEmail) {
      return NextResponse.json(
        { error: 'Board ID and invitee email are required' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();

    // Find the board and verify ownership
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(boardId) },
      { projection: { name: 1, createdBy: 1, collaborators: 1, adminUsers: 1, blockedUsers: 1 } }
    );

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Check if user is owner, admin, or collaborator
    const isOwner = board.createdBy.toString() === session.user.id;
    const isAdmin = board.adminUsers?.includes(session.user.id) || false;
    const isCollaborator = board.collaborators?.some(
      (collab: BoardCollaborator) => collab.id === session.user.id
    );

    if (!isOwner && !isAdmin && !isCollaborator) {
      return NextResponse.json(
        { error: 'Not authorized to invite collaborators to this board' },
        { status: 403 }
      );
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = board.collaborators?.some(
      (collab: BoardCollaborator) => collab.email === inviteeEmail
    );

    if (isAlreadyCollaborator) {
      return NextResponse.json(
        { error: 'User is already a collaborator on this board' },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.collection('board_invitations').findOne({
      boardId: new ObjectId(boardId),
      inviteeEmail,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const invitationToken = uuidv4();
    // Set precise 7-day expiration (avoid DST issues)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create invitation record
    const invitation = {
      boardId: new ObjectId(boardId),
      inviterUserId: new ObjectId(session.user.id),
      inviteeEmail,
      invitationToken,
      status: 'pending',
      message: message || '',
      createdAt: new Date(),
      expiresAt,
    };

    const result = await db.collection('board_invitations').insertOne(invitation);

    if (!result.insertedId) {
      throw new Error('Failed to create invitation record');
    }

    // Load inviter's email notification preferences
    let sendInvitationEmail = true;
    try {
      const prefsDb = await _connect();
      const prefsDoc = await prefsDb.collection('userSettings').findOne(
        { userEmail: session.user.email },
        { projection: { 'notifications.email.boardInvitations': 1 } }
      );
      sendInvitationEmail = prefsDoc?.notifications?.email?.boardInvitations !== false;
    } catch {
      // Ignore errors and default to sending email
    }

    // Send invitation email if enabled
    const emailSent = sendInvitationEmail
      ? await EmailService.sendInvitationEmail({
          boardId,
          boardName: board.name,
          inviterName: session.user.name || 'WhizBoard User',
          inviterEmail: session.user.email || '',
          inviteeEmail,
          invitationToken,
          message,
        })
      : true; // treat as success if disabled

    if (!emailSent) {
      // If email fails, we should clean up the invitation record
      await db.collection('board_invitations').deleteOne({ _id: result.insertedId });
      logger.error(`Failed to send invitation email for board ${boardId} to ${inviteeEmail}`);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to send invitation email. Please check the email address and try again.',
        emailSent: false,
      }, { status: 500 });
    }

    // Publish real-time notification to board collaborators
    try {
      pubSub.publish('collaboratorInvited', boardId, {
        boardId,
        inviteeEmail,
        inviterName: session.user.name || 'Unknown User'
      });
    } catch (error) {
      logger.error('Failed to publish collaborator invited event:', error);
    }

    // Post Slack notification to inviter's default channel if connected and enabled
    try {
      // Check Slack preference
      let slackEnabled = true;
      try {
        const prefsDb = await _connect();
        const prefsDoc = await prefsDb.collection('userSettings').findOne(
          { userEmail: session.user.email },
          { projection: { 'notifications.slack.boardEvents': 1 } }
        );
        slackEnabled = prefsDoc?.notifications?.slack?.boardEvents !== false;
      } catch {
        // Ignore errors and default to sending notification
      }

      if (!slackEnabled) {
        logger.info({ userEmail: session.user.email }, 'Slack boardEvents notifications disabled; skipping');
      } else {
      logger.info({ 
        userEmail: session.user.email, 
        boardName: board.name, 
        inviteeEmail 
      }, 'Attempting to send Slack notification for board invitation');
      
      const slackResult = await postSlackForUser(session.user.email!, `Invited ${inviteeEmail} to board "${board.name}".`);
      
      if (slackResult) {
        logger.info({ 
          userEmail: session.user.email, 
          boardName: board.name, 
          inviteeEmail 
        }, 'Slack notification sent successfully for board invitation');
      } else {
        logger.warn({ 
          userEmail: session.user.email, 
          boardName: board.name, 
          inviteeEmail 
        }, 'Failed to send Slack notification for board invitation');
      }
      }
    } catch (error) {
      logger.error({ 
        userEmail: session.user.email, 
        boardName: board.name, 
        inviteeEmail, 
        error 
      }, 'Exception occurred while sending Slack notification for board invitation');
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: result.insertedId.toString(),
      emailSent,
    });

  } catch (error) {
    logger.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get pending invitations for a board
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();

    // Verify user has access to this board
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(boardId) },
      { projection: { createdBy: 1, collaborators: 1 } }
    );

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    const isOwner = board.createdBy.toString() === session.user.id;
    const isCollaborator = board.collaborators?.some(
      (collab: BoardCollaborator) => collab.id === session.user.id
    );

    if (!isOwner && !isCollaborator) {
      return NextResponse.json(
        { error: 'Not authorized to view invitations for this board' },
        { status: 403 }
      );
    }

    // Get pending invitations
    const invitations = await db.collection('board_invitations')
      .find({ 
        boardId: new ObjectId(boardId),
        status: 'pending',
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB _id to string for frontend compatibility
    const serializedInvitations = invitations.map(invitation => ({
      ...invitation,
      id: invitation._id.toString(),
      boardId: invitation.boardId.toString(),
      inviterUserId: invitation.inviterUserId.toString(),
      createdAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
      invitationToken: invitation.invitationToken // Ensure token is included
    }));

    return NextResponse.json({ invitations: serializedInvitations });

  } catch (error) {
    logger.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Revoke/delete invitation (by board owner)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { invitationId, boardId } = body;
    
    // Enhanced validation with detailed logging
    if (!invitationId || !boardId) {
      logger.warn('DELETE invitation request missing required fields:', {
        hasInvitationId: !!invitationId,
        hasBoardId: !!boardId,
        body
      });
      return NextResponse.json(
        { error: 'Invitation ID and Board ID are required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(invitationId) || !ObjectId.isValid(boardId)) {
      logger.warn('DELETE invitation request with invalid ObjectId format:', {
        invitationId,
        boardId,
        invitationIdValid: ObjectId.isValid(invitationId),
        boardIdValid: ObjectId.isValid(boardId)
      });
      return NextResponse.json(
        { error: 'Invalid invitation ID or board ID format' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();

    // First, get the invitation to verify it exists and belongs to the board
    const invitation = await db.collection('board_invitations').findOne({
      _id: new ObjectId(invitationId),
      boardId: new ObjectId(boardId),
      status: 'pending',
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already processed' },
        { status: 404 }
      );
    }

    // Verify board ownership
    const board = await db.collection('boards').findOne({ _id: new ObjectId(boardId) });
    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }
    
    if (board.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the board owner can revoke invitations' },
        { status: 403 }
      );
    }

    // Delete the invitation
    const result = await db.collection('board_invitations').deleteOne({
      _id: new ObjectId(invitationId),
      boardId: new ObjectId(boardId),
      status: 'pending',
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to revoke invitation' },
        { status: 500 }
      );
    }

    // Publish real-time notification
    try {
      pubSub.publish('invitationStatusChanged', boardId, {
        invitationId,
        status: 'revoked',
        email: invitation.inviteeEmail,
      });
    } catch (error) {
      logger.error('Failed to publish invitation revoked event:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
      invitationId,
    });
  } catch (error) {
    logger.error('Error revoking invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
