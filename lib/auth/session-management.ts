import clientPromise from '@/lib/database/mongodb';
import { ObjectId } from 'mongodb';

export type BasicUserInfo = { _id: ObjectId; email?: string | null; status?: string | null } | null;

export async function validateUserExists(userId: string): Promise<BasicUserInfo> {
  const client = await clientPromise;
  const db = client.db();
  const user = await db
    .collection('users')
    .findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, status: 1 } });
  return (user as any) ?? null;
}

export async function invalidateUserSessions(userId: string): Promise<boolean> {
  // For JWT-based sessions, implement logical invalidation via tokenVersion
  const client = await clientPromise;
  const db = client.db();
  const result = await db
    .collection('users')
    .updateOne({ _id: new ObjectId(userId) }, { $inc: { tokenVersion: 1 }, $set: { updatedAt: new Date() } });
  return result.modifiedCount > 0;
}

export async function softDeleteUser(userId: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );

  // Invalidate existing JWT sessions
  await invalidateUserSessions(userId);
  return result.modifiedCount > 0;
}

export async function hardDeleteUser(userId: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();
  const userObjectId = new ObjectId(userId);

  // Best-effort cleanup of related NextAuth data
  const [accountsResult, verificationTokensResult, sessionsResult, userResult] = await Promise.all([
    db.collection('accounts').deleteMany({ userId: userObjectId }),
    db.collection('verificationTokens').deleteMany({ userId: userObjectId } as any).catch(() => ({ deletedCount: 0 })),
    db.collection('sessions').deleteMany({ userId: userObjectId }).catch(() => ({ deletedCount: 0 })),
    db.collection('users').deleteOne({ _id: userObjectId }),
  ]);

  return userResult.deletedCount === 1;
}

export async function banUser(userId: string, reason?: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        status: 'banned',
        bannedAt: new Date(),
        banReason: reason ?? null,
        updatedAt: new Date(),
      },
    }
  );

  await invalidateUserSessions(userId);
  return result.modifiedCount > 0;
}

export async function unbanUser(userId: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();
  const result = await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        status: 'active',
        updatedAt: new Date(),
      },
      $unset: { bannedAt: 1, banReason: 1 },
    }
  );
  return result.modifiedCount > 0;
}


