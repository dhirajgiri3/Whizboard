import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';
import { getCachedSession } from '@/lib/auth/session-cache';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCachedSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const markAsRead = searchParams.get('markAsRead') === 'true';

    const db = await connectToDatabase();

    // Get total count for pagination
    const totalCount = await db.collection('notifications').countDocuments({
      recipientEmail: session.user.email
    });

    const notifications = await db.collection('notifications')
      .find(
        { recipientEmail: session.user.email },
        { 
          sort: { createdAt: -1 },
          limit: limit,
          skip: offset
        }
      )
      .toArray();

    // Mark notifications as read if requested
    if (markAsRead && notifications.length > 0) {
      // Convert notification IDs to ObjectId instances if needed
      const notificationIds = notifications.map((n: { _id: string | ObjectId }) => 
        typeof n._id === 'string' ? new ObjectId(n._id) : n._id
      );
      await db.collection('notifications').updateMany(
        { 
          _id: { $in: notificationIds },
          read: false 
        },
        { $set: { read: true, readAt: new Date() } }
      );

      // Update the notifications array to reflect read status
      interface NotificationDocument {
        read: boolean;
        readAt: Date;
        [key: string]: unknown; // For other properties
      }
      
      notifications.forEach((notification) => {
        // Use a double cast to bypass TypeScript's safety checks - we know these fields exist
        ((notification as unknown) as NotificationDocument).read = true;
        ((notification as unknown) as NotificationDocument).readAt = new Date();
      });
    }

    // Get unread count
    const unreadCount = await db.collection('notifications').countDocuments({
      recipientEmail: session.user.email,
      read: false
    });

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
      totalCount,
      unreadCount,
      hasMore: offset + limit < totalCount,
      pagination: {
        limit,
        offset,
        totalCount,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, recipientEmail, data } = await request.json();

    if (!type || !recipientEmail) {
      return NextResponse.json({ error: 'Type and recipient email are required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    const notification = {
      type,
      recipientEmail,
      senderEmail: session.user.email,
      data,
      read: false,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// Mark specific notifications as read
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, markAllAsRead } = await request.json();

    const db = await connectToDatabase();

    if (markAllAsRead) {
      // Mark all notifications as read
      const result = await db.collection('notifications').updateMany(
        { 
          recipientEmail: session.user.email,
          read: false 
        },
        { $set: { read: true, readAt: new Date() } }
      );

      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      // Convert IDs to ObjectId instances
      const objectIds = notificationIds.map((id: string) => new ObjectId(id));
      const result = await db.collection('notifications').updateMany(
        { 
          _id: { $in: objectIds },
          recipientEmail: session.user.email,
          read: false 
        },
        { $set: { read: true, readAt: new Date() } }
      );

      return NextResponse.json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`
      });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    );
  }
}
