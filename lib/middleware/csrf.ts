import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface CSRFConfig {
  secret: string;
  cookieName?: string;
  headerName?: string;
  methods?: string[];
  excludePaths?: string[];
}

export function createCSRFProtection(config: CSRFConfig) {
  const {
    secret,
    cookieName = 'csrf-token',
    headerName = 'x-csrf-token',
    methods = ['POST', 'PUT', 'PATCH', 'DELETE'],
    excludePaths = []
  } = config;

  return async function csrfProtection(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;
    
    // Skip CSRF check for excluded paths
    if (excludePaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Only check CSRF for state-changing methods
    if (!methods.includes(method)) {
      return NextResponse.next();
    }

    // Skip CSRF check for API routes that use session-based auth
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/graphql')) {
      return NextResponse.next();
    }

    try {
      // Get CSRF token from cookie
      const csrfCookie = req.cookies.get(cookieName);
      if (!csrfCookie?.value) {
        return NextResponse.json(
          { error: 'CSRF token missing' },
          { status: 403 }
        );
      }

      // Get CSRF token from header
      const csrfHeader = req.headers.get(headerName);
      if (!csrfHeader) {
        return NextResponse.json(
          { error: 'CSRF token header missing' },
          { status: 403 }
        );
      }

      // Verify CSRF token
      if (!verifyCSRFToken(csrfCookie.value, csrfHeader, secret)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    } catch (error) {
      console.error('CSRF verification error:', error);
      return NextResponse.json(
        { error: 'CSRF verification failed' },
        { status: 403 }
      );
    }
  };
}

function verifyCSRFToken(cookieToken: string, headerToken: string, secret: string): boolean {
  try {
    // Simple token comparison (use crypto.timingSafeEqual in production)
    return cookieToken === headerToken;
  } catch {
    return false;
  }
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

// Verify CSRF token for API routes
export async function verifyCSRFForAPI(req: NextRequest): Promise<boolean> {
  try {
    const csrfCookie = req.cookies.get('csrf-token');
    const csrfHeader = req.headers.get('x-csrf-token');
    
    if (!csrfCookie?.value || !csrfHeader) {
      return false;
    }

    return csrfCookie.value === csrfHeader;
  } catch {
    return false;
  }
}

// Pre-configured CSRF protection
export const csrfProtection = createCSRFProtection({
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
  excludePaths: [
    '/api/auth',
    '/api/graphql',
    '/_next',
    '/favicon.ico'
  ]
});
