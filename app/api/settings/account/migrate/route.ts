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

    const db = await connectToDatabase();
    
    // Check if user already has timestamps
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { createdAt: 1, lastLoginAt: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    const now = new Date();

    // Set createdAt if missing (use current time as fallback)
    if (!(user as any).createdAt) {
      updates.createdAt = now;
    }

    // Set lastLoginAt if missing (use current time as fallback)
    if (!(user as any).lastLoginAt) {
      updates.lastLoginAt = now;
    }

    // Only update if there are missing fields
    if (Object.keys(updates).length > 0) {
      updates.updatedAt = now;
      
      await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: updates }
      );

      return NextResponse.json({ 
        success: true, 
        message: 'User timestamps migrated successfully',
        updated: Object.keys(updates)
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User timestamps already exist' 
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate user timestamps' },
      { status: 500 }
    );
  }
}