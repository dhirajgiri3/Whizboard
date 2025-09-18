import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import logger from '@/lib/logger/logger';

/**
 * API endpoint for receiving alerts from clients
 * This endpoint logs alerts and could trigger notifications
 * to administrators or DevOps teams
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify the user
    const session = await getServerSession(authOptions);
    
    // Parse the request body
    const body = await request.json();
    const { alert } = body;
    
    if (!alert || typeof alert !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Add user info from session if available
    const enhancedAlert = session ? {
      ...alert,
      userId: session.user.id,
      userEmail: session.user.email,
    } : alert;
    
    // Log the alert with appropriate level
    switch (alert.severity) {
      case 'info':
        logger.info({ alert: enhancedAlert }, 'Alert received');
        break;
      case 'warning':
        logger.warn({ alert: enhancedAlert }, 'Alert received');
        break;
      case 'critical':
        logger.fatal({ alert: enhancedAlert }, 'Alert received');
        break;
      case 'error':
      default:
        logger.error({ alert: enhancedAlert }, 'Alert received');
    }
    
    // In a production environment, you would:
    // 1. Store the alert in a database
    // 2. Send notifications (email, Slack, PagerDuty, etc.)
    // 3. Trigger automated remediation if applicable
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error processing alert');
    return NextResponse.json(
      { error: 'Failed to process alert' },
      { status: 500 }
    );
  }
}
