import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { EmailService } from '@/lib/email/sendgrid';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/lib/logger/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role = 'member' } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Find workspace and verify permissions
    const workspace = await db.collection('workspaces').findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 
          'members.userId': new ObjectId(session.user.id),
          'members.role': { $in: ['owner', 'admin'] }
        }
      ]
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or not authorized' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find((member: any) => member.email === email);
    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 });
    }

    // Check for existing pending invitation
    const existingInvitation = await db.collection('workspace_invitations').findOne({
      workspaceId: workspace._id,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Create invitation
    const invitationToken = uuidv4();
    // Set precise 7-day expiration (avoid DST issues)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = {
      workspaceId: workspace._id,
      email,
      role,
      invitedBy: {
        userId: new ObjectId(session.user.id),
        name: session.user.name,
        email: session.user.email
      },
      invitationToken,
      status: 'pending',
      createdAt: new Date(),
      expiresAt
    };

    const result = await db.collection('workspace_invitations').insertOne(invitation);

    // Send invitation email
    try {
      await EmailService.sendWorkspaceInvitationEmail({
        workspaceName: workspace.name,
        inviterName: session.user.name || 'WhizBoard User',
        inviterEmail: session.user.email || '',
        inviteeEmail: email,
        invitationToken,
        role
      });
    } catch (emailError) {
      // Clean up invitation if email fails
      await db.collection('workspace_invitations').deleteOne({ _id: result.insertedId });
      logger.error('Failed to send workspace invitation email:', emailError);
      return NextResponse.json({ error: 'Failed to send invitation email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationId: result.insertedId.toString()
    });

  } catch (error) {
    logger.error('Error sending workspace invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    
    // Find workspace and verify permissions
    const workspace = await db.collection('workspaces').findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 'members.userId': new ObjectId(session.user.id) }
      ]
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get pending invitations
    const invitations = await db.collection('workspace_invitations')
      .find({
        workspaceId: workspace._id,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      invitations: invitations.map((inv: {
        _id: ObjectId;
        email: string;
        role: string;
        invitedBy: { name: string };
        status: string;
        createdAt: Date;
        expiresAt: Date;
      }) => ({
        id: inv._id.toString(),
        email: inv.email,
        role: inv.role,
        invitedBy: inv.invitedBy.name,
        status: inv.status,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt
      }))
    });

  } catch (error) {
    logger.error('Error fetching workspace invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = await request.json();
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Find and verify invitation
    const invitation = await db.collection('workspace_invitations').findOne({
      _id: new ObjectId(invitationId),
      status: 'pending'
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify workspace ownership/admin
    const workspace = await db.collection('workspaces').findOne({
      _id: invitation.workspaceId,
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 
          'members.userId': new ObjectId(session.user.id),
          'members.role': { $in: ['owner', 'admin'] }
        }
      ]
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Not authorized to cancel this invitation' }, { status: 403 });
    }

    // Delete invitation
    const result = await db.collection('workspace_invitations').deleteOne({
      _id: new ObjectId(invitationId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    logger.error('Error cancelling workspace invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}