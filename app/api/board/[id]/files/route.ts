import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

function createApolloClientForRequest(request: NextRequest) {
  const link = createHttpLink({
    uri: `${request.nextUrl.origin}/api/graphql`,
    credentials: 'include',
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  });

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });
}

// Remove the GET_BOARD_FILES query since it doesn't exist in the schema
// const GET_BOARD_FILES = gql`...`;

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const fileId = searchParams.get('fileId');
    
    // Handle image preview action
    if (action === 'preview' && fileId) {
      // Check board access
      const { data: boardData } = await client.query({
        query: gql`
          query GetBoard($id: String!) {
            getBoard(id: $id) {
              id
              name
              isPublic
              createdBy
              collaborators {
                id
                email
              }
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      if (!boardData?.getBoard) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }

      const board = boardData.getBoard;
      const userEmail = session.user.email;
      const userId = (session as any).user?.id;
      const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
        (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
      ));

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get the specific file
      const db = await connectToDatabase();
      
      // Validate ObjectId format
      if (!ObjectId.isValid(fileId)) {
        return NextResponse.json({ error: 'Invalid file ID format' }, { status: 400 });
      }
      
      const file = await db.collection('boardFiles').findOne({ 
        _id: new ObjectId(fileId), 
        boardId: id 
      });

      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File is not an image' }, { status: 400 });
      }

      // Convert base64 data back to buffer
      const imageBuffer = Buffer.from(file.data, 'base64');
      
      console.log(`Serving image preview: ${file.name}, size: ${imageBuffer.length} bytes, type: ${file.type}`);
      
      // Return image with proper headers
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': file.type,
          'Content-Length': imageBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // Handle download action
    if (action === 'download' && fileId) {
      // Check board access
      const { data: boardData } = await client.query({
        query: gql`
          query GetBoard($id: String!) {
            getBoard(id: $id) {
              id
              name
              isPublic
              createdBy
              collaborators {
                id
                email
              }
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'no-cache',
      });

      if (!boardData?.getBoard) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
      }

      const board = boardData.getBoard;
      const userEmail = session.user.email;
      const userId = (session as any).user?.id;
      const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
        (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
      ));

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      // Get the specific file
      const db = await connectToDatabase();
      
      // Validate ObjectId format
      if (!ObjectId.isValid(fileId)) {
        return NextResponse.json({ error: 'Invalid file ID format' }, { status: 400 });
      }
      
      const file = await db.collection('boardFiles').findOne({ 
        _id: new ObjectId(fileId), 
        boardId: id 
      });

      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      // Convert base64 data back to buffer
      const fileBuffer = Buffer.from(file.data, 'base64');
      
      console.log(`Serving file download: ${file.name}, size: ${fileBuffer.length} bytes, type: ${file.type}`);
      
      // Return file with download headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': file.type,
          'Content-Length': fileBuffer.length.toString(),
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
      });
    }

    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',');
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Check board access
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get board files directly from database
    const db = await connectToDatabase();
    const files = await db.collection('boardFiles').find({ boardId: id }).toArray();

    // Transform files to include proper id field and format dates
    const transformedFiles = files.map((file: any) => ({
      id: file._id.toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      metadata: file.metadata || {},
      tags: file.tags || [],
      version: file.version || 1,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      createdBy: file.createdBy,
    }));

    let filteredFiles = transformedFiles;

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFiles = filteredFiles.filter((file: any) =>
        file.name.toLowerCase().includes(searchLower) ||
        file.metadata?.description?.toLowerCase().includes(searchLower)
      );
    }

    if (tags && tags.length > 0) {
      filteredFiles = filteredFiles.filter((file: any) =>
        file.tags?.some((tag: string) => tags.includes(tag))
      );
    }

    if (type) {
      filteredFiles = filteredFiles.filter((file: any) => file.type === type);
    }

    // Apply sorting
    filteredFiles.sort((a: any, b: any) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'size') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return NextResponse.json({ files: filteredFiles });
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: 'Failed to get files' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const metadata = formData.get('metadata') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Check board access
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Process file
    const fileData = await processFile(file);
    
    // Create file record directly in database
    const db = await connectToDatabase();
    const newFile = {
      boardId: id,
      name: name || file.name,
      type: file.type,
      size: file.size,
      data: fileData,
      metadata: {
        description: description || '',
        originalName: file.name,
        ...(metadata ? JSON.parse(metadata) : {}),
      },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      createdBy: session.user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('boardFiles').insertOne(newFile);

    return NextResponse.json({
      success: true,
      file: { ...newFile, id: result.insertedId.toString() },
    });
  } catch (error: any) {
    console.error('Add file error:', error);
    const message = error?.message || 'Failed to add file';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, name, description, tags, metadata } = body;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Check board access
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update file directly in database
    const db = await connectToDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.metadata = { ...updateData.metadata, description };
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = { ...updateData.metadata, ...metadata };

    const result = await db.collection('boardFiles').updateOne(
      { _id: new ObjectId(fileId), boardId: id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update file error:', error);
    const message = error?.message || 'Failed to update file';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Check board access
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete file directly from database
    const db = await connectToDatabase();
    const result = await db.collection('boardFiles').deleteOne({
      _id: new ObjectId(fileId),
      boardId: id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete file error:', error);
    const message = error?.message || 'Failed to delete file';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

async function processFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Use Buffer for efficient base64 conversion in Node.js
    return Buffer.from(uint8Array).toString('base64');
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error('Failed to process file data');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const { id } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, versionId, action } = body;

    if (!fileId || !action) {
      return NextResponse.json({ error: 'File ID and action required' }, { status: 400 });
    }

    // Check board access
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
          }
        }
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const db = await connectToDatabase();

    if (action === 'get_versions') {
      // Get file versions
      const versions = await db.collection('fileVersions')
        .find({ fileId: new ObjectId(fileId) })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ versions });
    } else if (action === 'restore_version') {
      if (!versionId) {
        return NextResponse.json({ error: 'Version ID required for restore' }, { status: 400 });
      }

      const version = await db.collection('fileVersions').findOne({ 
        _id: new ObjectId(versionId),
        fileId: new ObjectId(fileId)
      });

      if (!version) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }

      // Restore the version
      await db.collection('boardFiles').updateOne(
        { _id: new ObjectId(fileId) },
        {
          $set: {
            data: version.data,
            metadata: version.metadata,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('File version error:', error);
    const message = error?.message || 'Failed to process file version';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}