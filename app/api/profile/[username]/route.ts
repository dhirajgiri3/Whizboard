import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const username = context?.params?.username as string;
    const db = await connectToDatabase();

    // Get user profile data
    const user = await db.collection('users').findOne(
      { username: username },
      { projection: { 
        name: 1, 
        email: 1, 
        image: 1, 
        bio: 1, 
        createdAt: 1, 
        username: 1, 
        isPublicProfile: 1,
        lastLoginAt: 1 
      } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if profile is public
    if (user.isPublicProfile === false) {
      return NextResponse.json({ error: 'Profile is private' }, { status: 403 });
    }

    // Track profile view
    await trackProfileView(db, username, request);

    // Get user statistics
    const stats = await getUserStats(db, user.email);

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
        username: user.username,
        lastLoginAt: user.lastLoginAt
      },
      stats
    });

  } catch (error) {
    console.error('Public profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

async function trackProfileView(db: any, username: string, request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const viewData = {
      username,
      timestamp: new Date(),
      userAgent: userAgent.substring(0, 200), // Limit length
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      referer: request.headers.get('referer') || '',
      country: 'unknown', // Could be enhanced with IP geolocation
    };

    await db.collection('profile_views').insertOne(viewData);
  } catch (error) {
    console.error('Failed to track profile view:', error);
    // Don't fail the request if tracking fails
  }
}

async function getUserStats(db: any, userEmail: string) {
  try {
    // Get public board statistics
    const boardStats = await db.collection('boards').aggregate([
      { $match: { createdBy: userEmail } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          public: { $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] } },
          private: { $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get collaboration statistics
    const collaborationStats = await db.collection('board_invitations').aggregate([
      { $match: { invitedUserEmail: userEmail, status: 'accepted' } },
      {
        $group: {
          _id: null,
          totalCollaborations: { $sum: 1 }
        }
      }
    ]).toArray();

    // Get element creation statistics
    const elementStats = await db.collection('board_elements').aggregate([
      { $match: { createdBy: userEmail } },
      {
        $group: {
          _id: null,
          totalElements: { $sum: 1 },
          textElements: { $sum: { $cond: [{ $eq: ['$type', 'text'] }, 1, 0] } },
          drawingElements: { $sum: { $cond: [{ $eq: ['$type', 'drawing'] }, 1, 0] } },
          shapeElements: { $sum: { $cond: [{ $eq: ['$type', 'shape'] }, 1, 0] } }
        }
      }
    ]).toArray();

    // Get profile view statistics
    const viewStats = await db.collection('profile_views').aggregate([
      { $match: { username: userEmail.split('@')[0] } }, // Simple username extraction
      {
        $group: {
          _id: null,
          totalViews: { $sum: 1 },
          uniqueViews: { $addToSet: '$ip' }
        }
      }
    ]).toArray();

    return {
      boards: {
        total: boardStats[0]?.total || 0,
        public: boardStats[0]?.public || 0,
        private: boardStats[0]?.private || 0
      },
      collaboration: {
        totalCollaborations: collaborationStats[0]?.totalCollaborations || 0
      },
      elements: {
        total: elementStats[0]?.totalElements || 0,
        text: elementStats[0]?.textElements || 0,
        drawing: elementStats[0]?.drawingElements || 0,
        shapes: elementStats[0]?.shapeElements || 0
      },
      profile: {
        totalViews: viewStats[0]?.totalViews || 0,
        uniqueViews: viewStats[0]?.uniqueViews?.length || 0
      }
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return {
      boards: { total: 0, public: 0, private: 0 },
      collaboration: { totalCollaborations: 0 },
      elements: { total: 0, text: 0, drawing: 0, shapes: 0 },
      profile: { totalViews: 0, uniqueViews: 0 }
    };
  }
}