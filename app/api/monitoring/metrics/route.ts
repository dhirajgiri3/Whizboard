import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import logger from '@/lib/logger/logger';

/**
 * API endpoint for collecting performance metrics from clients
 * This endpoint receives metrics from the client and logs them
 * In a production environment, these would be stored in a database
 * for analysis and visualization
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify the user
    const session = await getServerSession(authOptions);
    
    // Parse the request body
    const body = await request.json();
    const { metric } = body;
    
    if (!metric || typeof metric !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Add user info from session if available
    const enhancedMetric = session ? {
      ...metric,
      userId: metric.userId || session.user.id,
    } : metric;
    
    // Log the metric
    logger.info({ metric: enhancedMetric }, 'Performance metric received');
    
    // In a production environment, you would:
    // 1. Store the metric in a time-series database (e.g., InfluxDB, Prometheus)
    // 2. Use the data for dashboards (e.g., Grafana)
    // 3. Set up alerts for performance degradation
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'Error processing performance metric');
    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}
