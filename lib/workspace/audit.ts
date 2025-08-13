import { connectToDatabase } from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';
import logger from '@/lib/logger/logger';

export async function createAuditLog(
  workspaceId: ObjectId,
  action: string,
  description: string,
  performedBy: { userId: ObjectId; name: string; email: string },
  targetUser?: { userId: ObjectId; name: string; email: string },
  metadata?: any
) {
  try {
    const db = await connectToDatabase();

    const auditLog = {
      workspaceId,
      action,
      description,
      performedBy,
      targetUser,
      metadata,
      createdAt: new Date(),
    };

    await db.collection('workspace_audit_logs').insertOne(auditLog);
  } catch (error) {
    logger.error('Error creating audit log:', error);
  }
}


