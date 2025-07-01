import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      );
    }

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database
    const db = await connectToDatabase();
    
    // Find the board with only metadata fields
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1,
          isPublic: 1
        }
      }
    );

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this board
    const isOwner = board.createdBy.toString() === session.user.id;
    const isPublic = board.isPublic;
    
    if (!isOwner && !isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get owner information - handle case where users collection might not exist yet
    let owner = null;
    try {
      const ownerData = await db.collection('users').findOne(
        { _id: board.createdBy },
        { projection: { name: 1, email: 1, image: 1 } }
      );
      
      if (ownerData) {
        owner = {
          id: ownerData._id.toString(),
          name: ownerData.name,
          email: ownerData.email,
          avatar: ownerData.image
        };
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Users collection might not exist yet, try to get from session if it's the same user
      if (board.createdBy.toString() === session.user.id) {
        owner = {
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || '',
          avatar: session.user.image || null
        };
      }
    }

    // Return board metadata
    const metadata = {
      id: board._id.toString(),
      name: board.name,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
      createdBy: board.createdBy.toString(),
      owner
    };

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('Error fetching board metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board metadata' },
      { status: 500 }
    );
  }
}
