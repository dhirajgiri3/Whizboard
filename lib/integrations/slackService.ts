import { connectToDatabase } from '@/lib/database/mongodb';
import logger from '@/lib/logger/logger';

export async function getSlackBotTokenForEmail(userEmail: string): Promise<string | null> {
  logger.info({ userEmail }, 'Getting Slack bot token for user');
  
  try {
    const db = await connectToDatabase();
    const tokenDoc = await db.collection('integrationTokens').findOne({ userEmail, provider: 'slack' });
    
    if (tokenDoc?.accessToken) {
      logger.info({ userEmail, hasToken: true }, 'Successfully retrieved Slack token');
      return tokenDoc.accessToken;
    } else {
      logger.warn({ userEmail, hasToken: false }, 'No Slack token found for user');
      return null;
    }
  } catch (error) {
    logger.error({ userEmail, error }, 'Failed to get Slack bot token');
    return null;
  }
}

export async function getUserEmailById(userId: string): Promise<string | null> {
  logger.info({ userId }, 'Getting user email by ID');
  
  try {
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new (await import('mongodb')).ObjectId(userId) }, { projection: { email: 1 } });
    
    if (user?.email) {
      logger.info({ userId, email: user.email }, 'Successfully retrieved user email');
      return user.email;
    } else {
      logger.warn({ userId }, 'User not found or no email');
      return null;
    }
  } catch (error) {
    logger.error({ userId, error }, 'Failed to get user email by ID');
    return null;
  }
}

export async function getDefaultSlackChannelForEmail(userEmail: string): Promise<{ id: string; name?: string } | null> {
  logger.info({ userEmail }, 'Getting default Slack channel for user');
  
  try {
    const db = await connectToDatabase();
    const settings = await db.collection('userSettings').findOne({ userEmail }, { projection: { slackDefaultChannel: 1 } });
    
    const defaultChannel = settings?.slackDefaultChannel || null;
    logger.info({ userEmail, defaultChannel }, 'Retrieved default Slack channel');
    
    return defaultChannel;
  } catch (error) {
    logger.error({ userEmail, error }, 'Failed to get default Slack channel');
    return null;
  }
}

export async function listSlackChannels(botToken: string): Promise<Array<{ id: string; name: string }>> {
  logger.info('Listing Slack channels');
  
  try {
    const url = new URL('https://slack.com/api/conversations.list');
    url.searchParams.set('types', 'public_channel');
    url.searchParams.set('limit', '1000');
    
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${botToken}` },
      cache: 'no-store' as any,
    });
    
    const data = await resp.json();
    
    if (data.ok) {
      const channels = (data.channels || []).map((c: any) => ({ id: c.id, name: c.name }));
      logger.info({ channelCount: channels.length }, 'Successfully listed Slack channels');
      return channels;
    } else {
      logger.error({ slackError: data.error }, 'Slack API error when listing channels');
      return [];
    }
  } catch (error) {
    logger.error({ error }, 'Failed to list Slack channels');
    return [];
  }
}

export async function isBotInChannel(botToken: string, channelId: string): Promise<boolean> {
  logger.info({ channelId }, 'Checking if bot is in Slack channel');
  
  try {
    const resp = await fetch(`https://slack.com/api/conversations.info?channel=${channelId}`, {
      headers: {
        Authorization: `Bearer ${botToken}`,
      },
    });
    
    const data = await resp.json();
    
    if (data.ok) {
      const isMember = data.channel?.is_member || false;
      logger.info({ channelId, isMember }, 'Bot channel membership status');
      return isMember;
    } else {
      logger.error({ channelId, slackError: data.error }, 'Slack API error when checking channel membership');
      return false;
    }
  } catch (error) {
    logger.error({ channelId, error }, 'Failed to check bot channel membership');
    return false;
  }
}

export async function inviteBotToChannel(botToken: string, channelId: string): Promise<boolean> {
  logger.info({ channelId }, 'Attempting to invite bot to Slack channel');
  
  try {
    const resp = await fetch('https://slack.com/api/conversations.join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channelId }),
    });
    
    const data = await resp.json();
    
    if (data.ok) {
      logger.info({ channelId }, 'Successfully joined Slack channel');
      return true;
    } else {
      if (data.error === 'missing_scope') {
        logger.error({ 
          channelId, 
          slackError: data.error,
          neededScope: 'channels:join',
          message: 'Bot lacks channels:join scope. Please reconnect Slack integration with proper permissions.'
        }, 'Slack API error when joining channel');
      } else {
        logger.error({ channelId, slackError: data.error }, 'Slack API error when joining channel');
      }
      return false;
    }
  } catch (error) {
    logger.error({ channelId, error }, 'Failed to join Slack channel');
    return false;
  }
}

export async function postSlackMessage(botToken: string, channelId: string, text: string): Promise<boolean> {
  logger.info({ channelId, textLength: text.length }, 'Posting message to Slack');
  
  try {
    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channelId, text }),
    });
    
    const data = await resp.json();
    
    if (data.ok) {
      logger.info({ channelId, messageId: data.ts }, 'Successfully posted message to Slack');
      return true;
    } else {
      // Handle "not_in_channel" error by automatically inviting the bot
      if (data.error === 'not_in_channel') {
        logger.warn({ channelId }, 'Bot not in channel, attempting to join automatically');
        
        const joined = await inviteBotToChannel(botToken, channelId);
        if (joined) {
          // Retry posting the message after joining
          logger.info({ channelId }, 'Retrying message post after joining channel');
          
          const retryResp = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${botToken}`,
            },
            body: JSON.stringify({ channel: channelId, text }),
          });
          
          const retryData = await retryResp.json();
          
          if (retryData.ok) {
            logger.info({ channelId, messageId: retryData.ts }, 'Successfully posted message to Slack after joining channel');
            return true;
          } else {
            logger.error({ channelId, slackError: retryData.error }, 'Slack API error when retrying message post');
            return false;
          }
        } else {
          if (data.error === 'missing_scope') {
            logger.error({ 
              channelId, 
              slackError: data.error,
              neededScope: 'channels:join',
              message: 'Bot lacks channels:join scope. Please reconnect Slack integration with proper permissions.'
            }, 'Failed to join channel due to missing permissions');
          } else {
            logger.error({ channelId }, 'Failed to join channel, cannot post message');
          }
          return false;
        }
      } else {
        logger.error({ channelId, slackError: data.error }, 'Slack API error when posting message');
        return false;
      }
    }
  } catch (error) {
    logger.error({ channelId, error }, 'Failed to post message to Slack');
    return false;
  }
}

// Updated function to accept userEmail directly for better efficiency
export async function postSlackForUser(userEmail: string, message: string): Promise<boolean> {
  logger.info({ userEmail, messageLength: message.length }, 'Attempting to send Slack notification for user');
  
  try {
    const token = await getSlackBotTokenForEmail(userEmail);
    if (!token) {
      logger.warn({ userEmail }, 'No Slack token found for user');
      return false;
    }
    
    const channel = await getDefaultSlackChannelForEmail(userEmail);
    if (!channel?.id) {
      logger.warn({ userEmail }, 'No default Slack channel set for user');
      return false;
    }
    
    logger.info({ userEmail, channelId: channel.id, channelName: channel.name }, 'Sending Slack notification');
    
    const result = await postSlackMessage(token, channel.id, message);
    
    if (result) {
      logger.info({ userEmail, channelId: channel.id }, 'Slack notification sent successfully');
    } else {
      logger.error({ userEmail, channelId: channel.id }, 'Failed to send Slack notification');
    }
    
    return result;
  } catch (error) {
    logger.error({ userEmail, error }, 'Exception occurred while sending Slack notification');
    return false;
  }
}

// Keep the old function for backward compatibility, but mark it as deprecated
export async function postSlackForUserById(userId: string, message: string): Promise<boolean> {
  logger.info({ userId, messageLength: message.length }, 'Attempting to send Slack notification by user ID');
  
  try {
    const userEmail = await getUserEmailById(userId);
    if (!userEmail) {
      logger.warn({ userId }, 'Could not find user email for ID');
      return false;
    }
    
    return await postSlackForUser(userEmail, message);
  } catch (error) {
    logger.error({ userId, error }, 'Exception occurred while sending Slack notification by user ID');
    return false;
  }
}

// Function to check if the bot has required permissions
export async function checkSlackBotPermissions(botToken: string): Promise<{
  hasRequiredScopes: boolean;
  missingScopes: string[];
  currentScopes: string[];
}> {
  logger.info('Checking Slack bot permissions');
  
  try {
    // Test the channels:join permission by attempting to join a test channel
    // We'll use a non-existent channel ID to test the scope without actually joining
    const testResp = await fetch('https://slack.com/api/conversations.join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: 'TEST_CHANNEL_ID' }),
    });
    
    const testData = await testResp.json();
    
    // Get current scopes from auth.test
    const authResp = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${botToken}` },
    });
    
    const authData = await authResp.json();
    const currentScopes = authData.ok ? (authData.scope || '').split(',').map((s: string) => s.trim()) : [];
    
    const requiredScopes = ['chat:write', 'channels:read', 'channels:join'];
    const missingScopes = requiredScopes.filter(scope => !currentScopes.includes(scope));
    
    const hasRequiredScopes = missingScopes.length === 0;
    
    logger.info({ 
      hasRequiredScopes, 
      missingScopes, 
      currentScopes,
      testError: testData.error 
    }, 'Slack bot permission check completed');
    
    return {
      hasRequiredScopes,
      missingScopes,
      currentScopes
    };
  } catch (error) {
    logger.error({ error }, 'Failed to check Slack bot permissions');
    return {
      hasRequiredScopes: false,
      missingScopes: ['channels:join'],
      currentScopes: []
    };
  }
}


