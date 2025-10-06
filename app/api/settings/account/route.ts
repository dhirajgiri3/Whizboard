import { NextRequest, NextResponse } from 'next/server';
import { getCachedSession } from '@/lib/auth/session-cache';
import { connectToDatabase } from '@/lib/database/mongodb';
import cloudinary from '@/lib/utils/cloudinary';

export async function PUT(request: NextRequest) {
  try {
    const session = await getCachedSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    // Branch 1: JSON body for profile text fields (name, bio, imageDescription)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const update: Record<string, any> = { updatedAt: new Date() };

      if (typeof body.name === 'string') update.name = body.name.trim();
      if (typeof body.bio === 'string') update.bio = body.bio.trim();
      if (typeof body.username === 'string') update.username = body.username.trim().toLowerCase();
      if (typeof body.isPublicProfile === 'boolean') update.isPublicProfile = body.isPublicProfile;
      // Support legacy imageDescription field for backward compatibility
      if (typeof body.imageDescription === 'string') update.imageDescription = body.imageDescription.trim();

      if (Object.keys(update).length === 1) {
        // Only updatedAt present → nothing to update
        return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      const db = await connectToDatabase();
      
      // Try to update existing user
      const result = await db.collection('users').updateOne(
        { email: session.user.email },
        { $set: update }
      );

      // If user doesn't exist, create them
      if (result.matchedCount === 0) {
        console.warn(`User ${session.user.email} not found in database, creating new user record`);
        
        // Create basic user record
        const newUser = {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || null,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date(),
          status: 'active',
          tokenVersion: 0,
          isPublicProfile: true,
          bio: '',
          loginCount: 1,
          ...update // Include the updates
        };
        
        const insertResult = await db.collection('users').insertOne(newUser);
        
        if (insertResult.insertedId) {
          return NextResponse.json({ 
            success: true, 
            message: 'User profile created and updated successfully',
            userCreated: true
          });
        } else {
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true });
    }

    // Branch 2: multipart/form-data for image upload
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

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

    // Upload to Cloudinary
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Wrap upload_stream in a Promise
    const cloudinaryUpload = () => new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'whizboard/profile', resource_type: 'image', overwrite: true, invalidate: true },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });
    const resultUpload = await cloudinaryUpload();

    const imageUrl = resultUpload.secure_url as string;
    const publicId = resultUpload.public_id as string;

    // Connect to database
    const db = await connectToDatabase();

    // Update user profile with new image URL and store public_id for deletes
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          image: imageUrl,
          imagePublicId: publicId,
          updatedAt: new Date(),
        },
      }
    );

    // If user doesn't exist, create them
    if (result.matchedCount === 0) {
      console.warn(`User ${session.user.email} not found in database, creating new user record with image`);
      
      const newUser = {
        email: session.user.email,
        name: session.user.name || '',
        image: imageUrl,
        imagePublicId: publicId,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        tokenVersion: 0,
        isPublicProfile: true,
        bio: '',
        loginCount: 1
      };
      
      const insertResult = await db.collection('users').insertOne(newUser);
      
      if (!insertResult.insertedId) {
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully',
      image: imageUrl,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCachedSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await connectToDatabase();

    // Get user profile data with better error handling
    let user: Record<string, any> | null = null;
    try {
      user = await db.collection('users').findOne(
        { email: session.user.email },
        { projection: { image: 1, name: 1, email: 1, bio: 1, imageDescription: 1, createdAt: 1, lastLoginAt: 1, username: 1, isPublicProfile: 1 } }
      );
    } catch (dbError) {
      console.error('Database error fetching user:', dbError);
      // Return basic session data if database fails
      return NextResponse.json({
        success: true,
        user: {
          image: session.user.image || null,
          name: session.user.name || '',
          email: session.user.email,
          bio: '',
          imageDescription: '',
          createdAt: null,
          lastLoginAt: null,
          username: null,
          isPublicProfile: true,
        },
        warning: 'Database temporarily unavailable, showing session data only'
      });
    }

    if (!user) {
      // User not found in database, but session is valid
      // This could happen in production due to database sync issues
      console.warn(`User ${session.user.email} not found in database, returning session data`);
      
      return NextResponse.json({
        success: true,
        user: {
          image: session.user.image || null,
          name: session.user.name || '',
          email: session.user.email,
          bio: '',
          imageDescription: '',
          createdAt: null,
          lastLoginAt: null,
          username: null,
          isPublicProfile: true,
        },
        warning: 'User profile not found in database, showing session data only'
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        image: (user as any).image || session.user.image || null,
        name: (user as any).name,
        email: (user as any).email,
        bio: (user as any).bio || '',
        imageDescription: (user as any).imageDescription || '',
        createdAt: (user as any).createdAt || null,
        lastLoginAt: (user as any).lastLoginAt || null,
        username: (user as any).username || null,
        isPublicProfile: (user as any).isPublicProfile !== false, // Default to true
      },
    });

  } catch (error: any) {
    console.error('Profile data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    const session = await getCachedSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    if (contentType.includes('application/json')) {
      try {
        body = await request.json();
      } catch {}
    }

    // If request is for deleting only profile image
    if (body?.type === 'image' || body?.action === 'delete-image') {
      const db = await connectToDatabase();
      const user = await db.collection('users').findOne(
        { email: session.user.email },
        { projection: { imagePublicId: 1 } }
      );
      const publicId = (user as any)?.imagePublicId;
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
        } catch (e) {
          console.warn('Failed to delete Cloudinary image:', e);
        }
      }
      const result = await db.collection('users').updateOne(
        { email: session.user.email },
        { $unset: { image: '', imagePublicId: '' }, $set: { updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Profile image deleted' });
    }

    // Otherwise, delete entire account with all associated data (no password required for Google auth)
    const db = await connectToDatabase();
    
    // Get user for audit log context
    const user = await db.collection('users').findOne(
      { email: session.user.email },
      { projection: { email: 1, name: 1 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Start a database session for transaction
    const dbSession = (db as any).client.startSession();
    
    try {
      await dbSession.withTransaction(async () => {
        // Delete user's boards
        await db.collection('boards').deleteMany({ 
          $or: [
            { ownerEmail: session.user.email },
            { collaborators: { $elemMatch: { email: session.user.email } } }
          ]
        });

        // Delete user's board elements
        await db.collection('boardElements').deleteMany({ 
          $or: [
            { createdBy: session.user.email },
            { lastModifiedBy: session.user.email }
          ]
        });

        // Delete user's invitations
        await db.collection('invitations').deleteMany({
          $or: [
            { fromEmail: session.user.email },
            { toEmail: session.user.email }
          ]
        });

        // Delete user's presence data
        await db.collection('userPresence').deleteMany({ 
          userEmail: session.user.email 
        });

        // Delete user's collaboration sessions
        await db.collection('collaborationSessions').deleteMany({ 
          userEmail: session.user.email 
        });

        // Delete user's settings
        await db.collection('userSettings').deleteMany({ 
          userEmail: session.user.email 
        });

        // Delete user's integration tokens
        await db.collection('integrationTokens').deleteMany({ 
          userEmail: session.user.email 
        });

        // Finally, delete the user account
        const deleteResult = await db.collection('users').deleteOne({ 
          email: session.user.email 
        });

        if (deleteResult.deletedCount === 0) {
          throw new Error('Failed to delete user account');
        }

        // Log the account deletion for security audit
        await db.collection('securityLogs').insertOne({
          action: 'ACCOUNT_DELETED',
          userEmail: session.user.email,
          userName: (user as any).name,
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
      });

    } catch (transactionError) {
      console.error('Transaction error during account deletion:', transactionError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    } finally {
      await dbSession.endSession();
    }

  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 