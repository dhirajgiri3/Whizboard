import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/database/mongodb';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Handle description-only update
      const body = await request.json();
      const { description } = body;

      const db = await connectToDatabase();
      
      const result = await db.collection('users').updateOne(
        { email: session.user.email },
        {
          $set: {
            imageDescription: description || '',
            updatedAt: new Date(),
          }
        }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Image description updated successfully',
        description: description || ''
      });
    } else {
      // Handle image upload with description
      const formData = await request.formData();
      const image = formData.get('image') as File;
      const description = formData.get('description') as string;

      if (!image) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      return NextResponse.json({ error: 'Image size too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageData = `data:${image.type};base64,${base64}`;

    // Connect to database
    const db = await connectToDatabase();
    
    // Update user profile with new image and description
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          image: imageData,
          imageDescription: description || '',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully',
      image: imageData,
      description: description || ''
    });
    }
  } catch (error: any) {
    console.error('Profile image update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile image' },
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

    // Connect to database
    const db = await connectToDatabase();
    
    // Get user profile data
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { image: 1, imageDescription: 1, name: 1, email: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        image: user.image,
        imageDescription: user.imageDescription || '',
        name: user.name,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('Profile data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
} 