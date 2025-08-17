import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'No session found',
        authenticated: false 
      });
    }

    // Try to connect to database
    let dbStatus = 'unknown';
    let userInDb = null;
    
    try {
      const db = await connectToDatabase();
      dbStatus = 'connected';
      
      // Try to find user in database
      userInDb = await db.collection('users').findOne(
        { email: session.user.email },
        { projection: { email: 1, name: 1, createdAt: 1, status: 1 } }
      );
    } catch (dbError) {
      dbStatus = 'error';
      console.error('Database connection error:', dbError);
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        },
        security: (session as any).security || null
      },
      database: {
        status: dbStatus,
        userFound: !!userInDb,
        user: userInDb
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      }
    });

  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ 
      error: 'Debug endpoint error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
