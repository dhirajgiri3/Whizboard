import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import logger from '@/lib/logger/logger';

/**
 * API endpoint for client-side error reporting
 * This endpoint receives error reports from the client and logs them
 * In a production environment, these would typically be stored in a database
 * or forwarded to a monitoring service like Sentry
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify the user
    const session = await getServerSession(authOptions);
    
    // Parse the request body
    const body = await request.json();
    const { errors } = body;
    
    if (!Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Process each error
    errors.forEach((error) => {
      const { message, stack, name, context, severity, timestamp } = error;
      
      // Add user info from session if available
      const userContext = session ? {
        userId: session.user.id,
        email: session.user.email,
        ...context
      } : context;
      
      // Log the error with appropriate level
      switch (severity) {
        case 'info':
          logger.info({ message, stack, name, context: userContext, timestamp }, 'Client error report');
          break;
        case 'warning':
          logger.warn({ message, stack, name, context: userContext, timestamp }, 'Client error report');
          break;
        case 'critical':
          logger.fatal({ message, stack, name, context: userContext, timestamp }, 'Client error report');
          break;
        case 'error':
        default:
          logger.error({ message, stack, name, context: userContext, timestamp }, 'Client error report');
      }
      
      // In a production environment, you might want to:
      // 1. Store errors in a database
      // 2. Forward to a monitoring service like Sentry
      // 3. Send alerts for critical errors
      // 4. Analyze error patterns
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error processing client error report');
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}
