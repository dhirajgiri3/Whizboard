import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger/logger';
import { createAuditLog } from '../audit/route';

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json();
    
    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the email matches the session
    if (session.user.email !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    const db = await connectToDatabase();
    
    // Find the invitation
    const invitation = await db.collection('workspace_invitations').findOne({
      invitationToken: token,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Get the workspace
    const workspace = await db.collection('workspaces').findOne({
      _id: invitation.workspaceId
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find((member: any) => member.email === email);
    if (existingMember) {
      // Mark invitation as accepted and return success
      await db.collection('workspace_invitations').updateOne(
        { _id: invitation._id },
        { $set: { status: 'accepted', acceptedAt: new Date() } }
      );
      
      return NextResponse.json({
        success: true,
        message: 'You are already a member of this workspace',
        workspace: {
          id: workspace._id.toString(),
          name: workspace.name
        }
      });
    }

    // Add user to workspace
    const newMember = {
      userId: new ObjectId(session.user.id),
      email: session.user.email,
      name: session.user.name,
      role: invitation.role,
      joinedAt: new Date(),
      avatar: session.user.image || null
    };

    await db.collection('workspaces').updateOne(
      { _id: workspace._id },
      { 
        $push: { members: newMember },
        $set: { updatedAt: new Date() }
      }
    );

    // Mark invitation as accepted
    await db.collection('workspace_invitations').updateOne(
      { _id: invitation._id },
      { $set: { status: 'accepted', acceptedAt: new Date() } }
    );

    // Create audit log
    await createAuditLog(
      workspace._id,
      'member_joined',
      `${session.user.name} joined the workspace`,
      {
        userId: new ObjectId(session.user.id),
        name: session.user.name || '',
        email: session.user.email || ''
      },
      {
        userId: new ObjectId(session.user.id),
        name: session.user.name || '',
        email: session.user.email || ''
      },
      { role: invitation.role, invitedBy: invitation.invitedBy.name }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully joined workspace',
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        role: invitation.role
      }
    });

  } catch (error) {
    logger.error('Error accepting workspace invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Find the invitation
    const invitation = await db.collection('workspace_invitations').findOne({
      invitationToken: token,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Get workspace details
    const workspace = await db.collection('workspaces').findOne(
      { _id: invitation.workspaceId },
      { projection: { name: 1, ownerId: 1 } }
    );

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      invitation: {
        workspaceName: workspace.name,
        role: invitation.role,
        inviterName: invitation.invitedBy.name,
        expiresAt: invitation.expiresAt
      }
    });

  } catch (error) {
    logger.error('Error fetching workspace invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}