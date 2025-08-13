import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = await connectToDatabase();
    
    // Find workspace and verify permissions
    const workspace = await db.collection('workspaces').findOne({
      $or: [
        { ownerId: new ObjectId(session.user.id) },
        { 'members.userId': new ObjectId(session.user.id) }
      ]
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Get audit logs for this workspace
    const auditLogs = await db.collection('workspace_audit_logs')
      .find({ workspaceId: workspace._id })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection('workspace_audit_logs')
      .countDocuments({ workspaceId: workspace._id });

    return NextResponse.json({
      success: true,
      logs: auditLogs.map(log => ({
        id: log._id.toString(),
        action: log.action,
        description: log.description,
        performedBy: log.performedBy,
        targetUser: log.targetUser,
        metadata: log.metadata,
        createdAt: log.createdAt
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    logger.error('Error fetching workspace audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper moved to lib/workspace/audit to avoid invalid route exports