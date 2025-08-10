import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export interface StoredToken {
  userEmail: string;
  provider: 'slack' | 'googleDrive';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date | null;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertToken(token: Omit<StoredToken, 'createdAt' | 'updatedAt'>) {
  const requestId = Math.random().toString(36).substring(7);
  logger.info({ 
    requestId,
    userEmail: token.userEmail, 
    provider: token.provider, 
    hasAccessToken: !!token.accessToken,
    hasRefreshToken: !!token.refreshToken,
    accessTokenLength: token.accessToken?.length,
    refreshTokenLength: token.refreshToken?.length,
    expiresAt: token.expiresAt,
    scope: token.scope 
  }, 'Upserting integration token');
  
  try {
    const db = await connectToDatabase();
    logger.debug({ requestId, userEmail: token.userEmail, provider: token.provider }, 'Database connection established for token upsert');
    
    const filter = { userEmail: token.userEmail, provider: token.provider };
    const update = { 
      $set: { ...token, updatedAt: new Date() }, 
      $setOnInsert: { createdAt: new Date() } 
    };
    const options = { upsert: true };
    
    logger.debug({ 
      requestId,
      userEmail: token.userEmail, 
      provider: token.provider,
      filter,
      updateKeys: Object.keys(update.$set)
    }, 'Executing token upsert operation');
    
    const result = await db.collection('integrationTokens').updateOne(filter, update, options);
    
    logger.info({ 
      requestId,
      userEmail: token.userEmail, 
      provider: token.provider, 
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId,
      matchedCount: result.matchedCount,
      acknowledged: result.acknowledged
    }, 'Token upserted successfully');
    
    return result;
  } catch (error) {
    logger.error({ 
      requestId,
      userEmail: token.userEmail, 
      provider: token.provider, 
      error: {
        message: (error as any).message,
        name: (error as any).name,
        stack: (error as any).stack
      }
    }, 'Failed to upsert token');
    throw error;
  }
}

export async function getToken(userEmail: string, provider: StoredToken['provider']) {
  logger.info({ userEmail, provider }, 'Getting integration token');
  
  try {
    const db = await connectToDatabase();
    const token = await db.collection('integrationTokens').findOne({ userEmail, provider });
    
    if (token) {
      logger.info({ userEmail, provider, hasAccessToken: !!token.accessToken }, 'Token retrieved successfully');
    } else {
      logger.warn({ userEmail, provider }, 'No token found');
    }
    
    return token;
  } catch (error) {
    logger.error({ userEmail, provider, error }, 'Failed to get token');
    return null;
  }
}

export async function deleteToken(userEmail: string, provider: StoredToken['provider']) {
  logger.info({ userEmail, provider }, 'Deleting integration token');
  
  try {
    const db = await connectToDatabase();
    const result = await db.collection('integrationTokens').deleteMany({ userEmail, provider });
    
    logger.info({ 
      userEmail, 
      provider, 
      deletedCount: result.deletedCount 
    }, 'Token deleted successfully');
  } catch (error) {
    logger.error({ userEmail, provider, error }, 'Failed to delete token');
    throw error;
  }
}


