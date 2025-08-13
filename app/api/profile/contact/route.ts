import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUsername, subject, message } = await request.json();
    
    if (!targetUsername || !subject || !message) {
      return NextResponse.json({ error: 'Target username, subject, and message are required' }, { status: 400 });
    }

    // Basic validation
    if (subject.length > 100) {
      return NextResponse.json({ error: 'Subject too long (max 100 characters)' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Get current user
    const currentUser = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { username: 1, name: 1, email: 1 } }
    );

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get target user
    const targetUser = await db.collection('users').findOne(
      { username: targetUsername },
      { projection: { username: 1, name: 1, email: 1, isPublicProfile: 1 } }
    );

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // Check if target profile is public
    if (targetUser.isPublicProfile === false) {
      return NextResponse.json({ error: 'Cannot contact private profile' }, { status: 403 });
    }

    // Prevent self-messaging
    if (currentUser.username === targetUsername) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Rate limiting: max 5 messages per day to the same user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentMessages = await db.collection('profile_messages').countDocuments({
      fromEmail: currentUser.email,
      toUsername: targetUsername,
      createdAt: { $gte: today }
    });

    if (recentMessages >= 5) {
      return NextResponse.json({ error: 'Rate limit exceeded. You can only send 5 messages per day to the same user.' }, { status: 429 });
    }

    const messageData = {
      fromUsername: currentUser.username,
      fromEmail: currentUser.email,
      fromName: currentUser.name,
      toUsername: targetUsername,
      toEmail: targetUser.email,
      toName: targetUser.name,
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date(),
      read: false
    };

    await db.collection('profile_messages').insertOne(messageData);
    
    return NextResponse.json({ 
      success: true, 
      message: `Message sent to ${targetUser.name}`,
      remainingMessages: 4 - recentMessages
    });

  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'sent' or 'received'

    if (!type || !['sent', 'received'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (sent/received) is required' }, { status: 400 });
    }

    const db = await connectToDatabase();

    let query;
    if (type === 'sent') {
      query = { fromEmail: session.user.email };
    } else {
      query = { toEmail: session.user.email };
    }

    const messages = await db.collection('profile_messages')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}
