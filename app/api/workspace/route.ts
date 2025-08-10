import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectToDatabase();
    
    // Find or create workspace for user
    let workspace = await db.collection('workspaces').findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 'members.userId': new ObjectId(session.user.id) }
      ]
    });

    if (!workspace) {
      // Create default workspace for user
      const newWorkspace = {
        name: `${session.user.name}'s Workspace`,
        ownerId: new ObjectId(session.user.id),
        members: [{
          userId: new ObjectId(session.user.id),
          email: session.user.email,
          name: session.user.name,
          role: 'owner',
          joinedAt: new Date()
        }],
        settings: {
          allowMemberInvites: true,
          requireApproval: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('workspaces').insertOne(newWorkspace);
      workspace = { ...newWorkspace, _id: result.insertedId };
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        ownerId: workspace.ownerId.toString(),
        members: workspace.members.map((member: any) => ({
          ...member,
          userId: member.userId.toString(),
          id: member.userId.toString()
        })),
        settings: workspace.settings,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt
      }
    });

  } catch (error) {
    logger.error('Error fetching workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, settings } = await request.json();
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    const result = await db.collection('workspaces').updateOne(
      { ownerId: new ObjectId(session.user.id) },
      { 
        $set: { 
          name: name.trim(),
          ...(settings && { settings }),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Workspace updated successfully'
    });

  } catch (error) {
    logger.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}