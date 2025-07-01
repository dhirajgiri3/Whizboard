import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
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
    
    // Find the board first to check permissions
    const board = await db.collection('boards').findOne(
      { _id: new ObjectId(id) },
      { projection: { createdBy: 1, isPublic: 1 } }
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

    // Update the board's updatedAt timestamp
    const result = await db.collection('boards').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update board timestamp' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      updatedAt: new Date().toISOString() 
    });

  } catch (error) {
    console.error('Error updating board timestamp:', error);
    return NextResponse.json(
      { error: 'Failed to update board timestamp' },
      { status: 500 }
    );
  }
}
