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
    
    const workspace = await db.collection('workspaces').findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 'members.userId': new ObjectId(session.user.id) }
      ]
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      members: workspace.members.map((member: any) => ({
        id: member.userId.toString(),
        userId: member.userId.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        joinedAt: member.joinedAt,
        avatar: member.avatar || null
      }))
    });

  } catch (error) {
    logger.error('Error fetching workspace members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Find workspace and verify ownership
    const workspace = await db.collection('workspaces').findOne({
      ownerId: new ObjectId(session.user.id)
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found or not authorized' }, { status: 404 });
    }

    // Don't allow removing the owner
    if (memberId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove workspace owner' }, { status: 400 });
    }

    const result = await db.collection('workspaces').updateOne(
      { _id: workspace._id },
      { 
        $pull: { members: { userId: new ObjectId(memberId) } },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Member not found or already removed' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    logger.error('Error removing workspace member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}