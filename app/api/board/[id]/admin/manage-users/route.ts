import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger/logger';

interface BoardUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  role: 'owner' | 'admin' | 'collaborator' | 'blocked';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: boardId } = await params;
    const db = await connectToDatabase();

    // Get board with admin and blocked users
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(boardId) },
      {
        projection: {
          createdBy: 1,
          collaborators: 1,
          adminUsers: 1,
          blockedUsers: 1,
          name: 1
        }
      }
    );

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwner = board.createdBy.toString() === session.user.id;
    const isAdmin = board.adminUsers?.includes(session.user.id) || false;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all users with their roles
    const allUsers: BoardUser[] = [];
    
    // Add owner
    const ownerUser = await db.collection('users').findOne(
      { _id: new ObjectId(board.createdBy) },
      { projection: { name: 1, email: 1, image: 1 } }
    );
    
    if (ownerUser) {
      allUsers.push({
        id: ownerUser._id.toString(),
        email: ownerUser.email,
        name: ownerUser.name,
        avatar: ownerUser.image,
        isOnline: false, // Will be updated by real-time data
        role: 'owner'
      });
    }

    // Add collaborators with their roles
    if (board.collaborators) {
      for (const collaborator of board.collaborators) {
        const isAdminUser = board.adminUsers?.includes(collaborator.id) || false;
        const isBlockedUser = board.blockedUsers?.includes(collaborator.id) || false;
        
        allUsers.push({
          ...collaborator,
          role: isBlockedUser ? 'blocked' : (isAdminUser ? 'admin' : 'collaborator')
        });
      }
    }

    return NextResponse.json({
      users: allUsers,
      currentUserRole: isOwner ? 'owner' : 'admin',
      canManageUsers: true
    });

  } catch (error) {
    logger.error('Error fetching board users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board users' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: boardId } = await params;
    const { action, userId, targetUserId } = await request.json();

    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: 'Action and target user ID are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Get board
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(boardId) },
      {
        projection: {
          createdBy: 1,
          collaborators: 1,
          adminUsers: 1,
          blockedUsers: 1,
          name: 1
        }
      }
    );

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // Check if user is owner or admin
    const isOwner = board.createdBy.toString() === session.user.id;
    const isAdmin = board.adminUsers?.includes(session.user.id) || false;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Prevent owners from being modified by admins
    if (!isOwner && board.createdBy.toString() === targetUserId) {
      return NextResponse.json(
        { error: 'Only the owner can modify owner permissions' },
        { status: 403 }
      );
    }

    // Prevent self-modification
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot modify your own permissions' },
        { status: 400 }
      );
    }

    let updateResult;
    const updateData: any = { updatedAt: new Date() };

    switch (action) {
      case 'promote_to_admin':
        // Add user to admin list
        updateData.$addToSet = { adminUsers: targetUserId };
        updateData.$pull = { blockedUsers: targetUserId };
        break;

      case 'demote_from_admin':
        // Remove user from admin list
        updateData.$pull = { adminUsers: targetUserId };
        break;

      case 'remove_user':
        // Remove user from collaborators and admin list
        updateData.$pull = {
          collaborators: { id: targetUserId },
          adminUsers: targetUserId,
          blockedUsers: targetUserId
        };
        break;

      case 'block_user':
        // Add user to blocked list and remove from admin list
        updateData.$addToSet = { blockedUsers: targetUserId };
        updateData.$pull = { adminUsers: targetUserId };
        break;

      case 'unblock_user':
        // Remove user from blocked list
        updateData.$pull = { blockedUsers: targetUserId };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    updateResult = await db.collection('boards').updateOne(
      { _id: new ObjectId(boardId) },
      updateData
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update user permissions' },
        { status: 500 }
      );
    }

    // Log the action
    await db.collection('board_audit_logs').insertOne({
      boardId: new ObjectId(boardId),
      userId: session.user.id,
      action: action,
      targetUserId: targetUserId,
      timestamp: new Date(),
      details: {
        boardName: board.name,
        userEmail: session.user.email
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${action.replace('_', ' ')} successfully`
    });

  } catch (error) {
    logger.error('Error managing board users:', error);
    return NextResponse.json(
      { error: 'Failed to manage board users' },
      { status: 500 }
    );
  }
}
