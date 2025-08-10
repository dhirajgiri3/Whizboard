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

    const { username } = await request.json();
    
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Validate username format
    if (!/^[a-z0-9_-]{3,20}$/.test(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Username must be 3-20 characters long and contain only letters, numbers, hyphens, and underscores' 
      });
    }

    // Reserved usernames
    const reserved = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'root', 'support', 'help', 'about', 'contact', 'terms', 'privacy', 'settings', 'profile', 'user', 'users', 'account', 'accounts'];
    if (reserved.includes(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        error: 'This username is reserved' 
      });
    }

    const db = await connectToDatabase();
    
    // Check if username is already taken (excluding current user)
    const existingUser = await db.collection('users').findOne({
      username: cleanUsername,
      email: { $ne: session.user.email }
    });

    return NextResponse.json({
      available: !existingUser,
      username: cleanUsername
    });

  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}