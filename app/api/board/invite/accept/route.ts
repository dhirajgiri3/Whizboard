import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/database/mongodb';
import { EmailService } from '@/lib/email/sendgrid';
import { pubSub } from '@/lib/graphql/schema';
import logger from '@/lib/logger';

interface BoardCollaborator {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to accept invitations' },
        { status: 401 }
      );
    }

    // Verify that the logged-in user matches the invitation email
    if (session.user.email !== email) {
      return NextResponse.json(
        { error: 'This invitation is not for your account' },
        { status: 403 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();

    // Find the invitation
    const invitation = await db.collection('board_invitations').findOne({
      invitationToken: token,
      inviteeEmail: email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Get additional invitation data like inviter name
    const inviter = await db.collection('users').findOne(
      { _id: invitation.inviterUserId }
    );
    const inviterName = inviter?.name || 'Team Member';

    // Get the board
    const board = await db.collection('boards').findOne(
      { _id: invitation.boardId }
    );

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = board.collaborators?.some(
      (collab: BoardCollaborator) => collab.email === email
    );

    if (isAlreadyCollaborator) {
      // Update invitation status to accepted even if already a collaborator
      await db.collection('board_invitations').updateOne(
        { _id: invitation._id },
        { 
          $set: { 
            status: 'accepted',
            acceptedAt: new Date()
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: 'You are already a collaborator on this board',
        boardId: invitation.boardId.toString()
      });
    }

    // Add user as collaborator
    const newCollaborator: BoardCollaborator = {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name || 'Unknown User',
      avatar: session.user.image || undefined,
      isOnline: true
    };

    // Start transaction
    const updateResult = await db.collection('boards').updateOne(
      { _id: invitation.boardId },
      { 
        $push: { collaborators: newCollaborator },
        $set: { updatedAt: new Date() }
      }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error('Failed to add collaborator to board');
    }

    // Update invitation status
    await db.collection('board_invitations').updateOne(
      { _id: invitation._id },
      { 
        $set: { 
          status: 'accepted',
          acceptedAt: new Date()
        } 
      }
    );

    // Send welcome email to the new collaborator
    try {
      const emailSent = await EmailService.sendWelcomeEmail({
        userEmail: session.user.email!,
        userName: session.user.name || 'New User',
        inviterName: inviterName,
        boardName: board.name
      });
      
      if (!emailSent) {
        logger.warn(`Failed to send welcome email to ${session.user.email}`);
      }
    } catch (error) {
      logger.error('Error sending welcome email:', error);
    }

    // Send notification email to board owner
    try {
      const ownerUser = await db.collection('users').findOne({ _id: board.createdBy });
      if (ownerUser?.email) {
        await EmailService.sendCollaboratorJoinedNotification({
          boardId: invitation.boardId.toString(),
          boardName: board.name,
          collaboratorName: session.user.name || 'New Collaborator',
          collaboratorEmail: session.user.email!,
          ownerEmail: ownerUser.email,
          ownerName: ownerUser.name || 'Board Owner'
        });
      }
    } catch (error) {
      logger.error('Error sending owner notification:', error);
    }

    // Publish real-time notifications
    try {
      const newCollaborator = {
        id: session.user.id,
        name: session.user.name || 'Unknown User',
        email: session.user.email!,
        avatar: session.user.image || undefined,
        isOnline: true
      };

      // Notify all board users that a new collaborator joined
      pubSub.publish('collaboratorJoined', invitation.boardId.toString(), {
        boardId: invitation.boardId.toString(),
        collaborator: newCollaborator,
        boardName: board.name
      });

      // Update invitation status for real-time UI updates
      pubSub.publish('invitationStatusChanged', invitation.boardId.toString(), {
        invitationId: invitation._id.toString(),
        status: 'accepted',
        email: session.user.email!
      });
    } catch (error) {
      logger.error('Failed to publish real-time notifications:', error);
    }

    logger.info(`User ${session.user.email} accepted invitation for board ${invitation.boardId}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the board!',
      boardId: invitation.boardId.toString(),
      boardName: board.name
    });

  } catch (error) {
    logger.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Decline invitation
export async function DELETE(request: NextRequest) {
  try {
    const { token, email } = await request.json();

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
          declinedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Invalid invitation or already processed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation declined'
    });

  } catch (error) {
    logger.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
