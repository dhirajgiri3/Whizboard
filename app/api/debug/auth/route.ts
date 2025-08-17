import { NextRequest, NextResponse } from 'next/server';
import { debugMiddlewareAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const authDebug = await debugMiddlewareAuth(request);
    
    return NextResponse.json({
      success: true,
      auth: authDebug,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
