import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { securityHeaders, devSecurityHeaders } from '@/lib/middleware/securityHeaders';
import { authRateLimit, apiRateLimit, fileUploadRateLimit } from '@/lib/middleware/rateLimit';
import { csrfProtection } from '@/lib/middleware/csrf';
import { securityLogger } from '@/lib/logger/securityLogger';
import { authMiddleware } from '@/lib/middleware/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    // Apply authentication middleware first
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Apply security headers
    let response = isDevelopment 
      ? devSecurityHeaders(request)
      : securityHeaders(request);

    // Apply rate limiting based on route type
    if (pathname.startsWith('/api/auth/')) {
      // Apply refined auth limiter (only counts POST /api/auth/signin)
      const rateLimitResult = authRateLimit(request);
      if (rateLimitResult instanceof NextResponse) {
        return rateLimitResult;
      }
    } else if (pathname.startsWith('/api/')) {
      const rateLimitResult = apiRateLimit(request);
      if (rateLimitResult instanceof NextResponse) {
        return rateLimitResult;
      }
    } else if (pathname.includes('/upload') || pathname.includes('/import')) {
      const rateLimitResult = fileUploadRateLimit(request);
      if (rateLimitResult instanceof NextResponse) {
        return rateLimitResult;
      }
    }

    // Apply CSRF protection for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfResult = csrfProtection(request);
      if (csrfResult instanceof NextResponse) {
        return csrfResult;
      }
    }

    // Log security events
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Log suspicious requests
    if (isSuspiciousRequest(request)) {
      securityLogger.logEvent({
        eventType: 'WARNING',
        ipAddress,
        userAgent,
        resource: pathname,
        method: request.method,
        details: { 
          reason: 'Suspicious request pattern',
          message: 'Potential security threat detected'
        },
        severity: 'MEDIUM',
        source: 'MIDDLEWARE'
      });
    }

    // Add security response headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;

  } catch (error) {
    // Log middleware errors
    securityLogger.logError(error as Error, {
      eventType: 'ERROR',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      resource: pathname,
      method: request.method,
      severity: 'HIGH',
      source: 'MIDDLEWARE'
    });

    // Return a safe response on error
    return NextResponse.next();
  }
}

function isSuspiciousRequest(request: NextRequest): boolean {
  const { pathname, search } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  
  // Check for suspicious user agents
  const suspiciousUserAgents = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /burp/i,
    /owasp/i,
    /scanner/i,
    /crawler/i,
    /bot/i
  ];
  
  if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
    return true;
  }

  // Check for suspicious query parameters
  const suspiciousParams = [
    /script/i,
    /javascript/i,
    /eval/i,
    /on\w+=/i,
    /<script/i,
    /sql/i,
    /union/i,
    /select/i,
    /insert/i,
    /update/i,
    /delete/i,
    /drop/i,
    /exec/i,
    /system/i
  ];
  
  if (suspiciousParams.some(pattern => pattern.test(search))) {
    return true;
  }

  // Check for suspicious paths
  const suspiciousPaths = [
    /\.\./i, // Directory traversal
    /admin/i,
    /config/i,
    /\.env/i,
    /\.git/i,
    /\.svn/i,
    /\.htaccess/i,
    /phpmyadmin/i,
    /wp-admin/i
  ];
  
  if (suspiciousPaths.some(pattern => pattern.test(pathname))) {
    return true;
  }

  // Check for missing or suspicious referer
  if (request.method !== 'GET' && !referer) {
    return true;
  }

  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/ (all Next.js internal assets: static, image, HMR, etc.)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/|favicon.ico|public/).*)',
  ],
};
