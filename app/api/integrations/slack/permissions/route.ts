import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { getSlackBotTokenForEmail, checkSlackBotPermissions } from '@/lib/integrations/slackService';
import logger from '@/lib/logger/logger';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized attempt to check Slack bot permissions');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  logger.info({ userEmail: session.user.email }, 'Checking Slack bot permissions for user');

  try {
    const token = await getSlackBotTokenForEmail(session.user.email);
    if (!token) {
      logger.warn({ userEmail: session.user.email }, 'No Slack token found for user');
      return NextResponse.json({ error: 'Slack not connected' }, { status: 400 });
    }

    const permissions = await checkSlackBotPermissions(token);
    
    logger.info({ 
      userEmail: session.user.email, 
      hasRequiredScopes: permissions.hasRequiredScopes,
      missingScopes: permissions.missingScopes 
    }, 'Successfully checked Slack bot permissions');

    return NextResponse.json(permissions);
  } catch (error) {
    logger.error({ userEmail: session.user.email, error }, 'Failed to check Slack bot permissions');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
