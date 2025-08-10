import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { 
  softDeleteUser, 
  hardDeleteUser, 
  banUser, 
  unbanUser, 
  validateUserExists,
  invalidateUserSessions 
} from '@/lib/auth/session-management';
import { ObjectId } from 'mongodb';

/**
 * Admin endpoint for user management
 * Requires admin privileges
 */

async function isAdmin(session: any): Promise<boolean> {
  // Add your admin check logic here
  // For now, checking if user email is in admin list
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(session?.user?.email);
}

export const runtime = 'nodejs';

export async function DELETE(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = context.params as { userId: string };
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userInfo = await validateUserExists(userId);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let success: boolean;
    
    if (hard) {
      // Hard delete - completely removes user and all data
      success = await hardDeleteUser(userId);
      
      if (success) {
        console.log(`[ADMIN] User ${userInfo.email} hard deleted by ${session.user?.email}`);
        return NextResponse.json({
          message: 'User permanently deleted',
          action: 'hard_delete',
          userId,
          userEmail: userInfo.email
        });
      }
    } else {
      // Soft delete - marks user as deleted but preserves data
      success = await softDeleteUser(userId);
      
      if (success) {
        console.log(`[ADMIN] User ${userInfo.email} soft deleted by ${session.user?.email}`);
        return NextResponse.json({
          message: 'User marked as deleted and sessions invalidated',
          action: 'soft_delete',
          userId,
          userEmail: userInfo.email
        });
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in user deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = context.params as { userId: string };
    const body = await request.json();
    const { action, reason } = body;

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userInfo = await validateUserExists(userId);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let success: boolean;
    let message: string;

    switch (action) {
      case 'ban':
        success = await banUser(userId, reason);
        message = success ? 'User banned successfully' : 'Failed to ban user';
        if (success) {
          console.log(`[ADMIN] User ${userInfo.email} banned by ${session.user?.email}: ${reason}`);
        }
        break;

      case 'unban':
        success = await unbanUser(userId);
        message = success ? 'User unbanned successfully' : 'Failed to unban user';
        if (success) {
          console.log(`[ADMIN] User ${userInfo.email} unbanned by ${session.user?.email}`);
        }
        break;

      case 'invalidate_sessions':
        success = await invalidateUserSessions(userId);
        message = success ? 'User sessions invalidated' : 'Failed to invalidate sessions';
        if (success) {
          console.log(`[ADMIN] Sessions invalidated for ${userInfo.email} by ${session.user?.email}`);
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: ban, unban, invalidate_sessions' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        message,
        action,
        userId,
        userEmail: userInfo.email
      });
    } else {
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in user management:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { userId } = context.params as { userId: string };

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Get user info
    const userInfo = await validateUserExists(userId);
    if (!userInfo) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: userInfo
    });

  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}