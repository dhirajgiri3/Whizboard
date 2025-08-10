import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export interface StoredToken {
  userEmail: string;
  provider: 'slack' | 'googleDrive' | 'figma';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date | null;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertToken(token: Omit<StoredToken, 'createdAt' | 'updatedAt'>) {
  logger.info({ 
    userEmail: token.userEmail, 
    provider: token.provider, 
    hasAccessToken: !!token.accessToken,
    hasRefreshToken: !!token.refreshToken,
    scope: token.scope 
  }, 'Upserting integration token');
  
  try {
    const db = await connectToDatabase();
    const result = await db.collection('integrationTokens').updateOne(
      { userEmail: token.userEmail, provider: token.provider },
      { $set: { ...token, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    
    logger.info({ 
      userEmail: token.userEmail, 
      provider: token.provider, 
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId 
    }, 'Token upserted successfully');
  } catch (error) {
    logger.error({ 
      userEmail: token.userEmail, 
      provider: token.provider, 
      error 
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


