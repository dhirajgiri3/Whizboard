import { NextRequest, NextResponse } from 'next/server';
import { currentSecurityConfig } from '@/lib/config/security';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore: RateLimitStore = {};

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests per window default
    message = 'Too many requests, please try again later.',
    statusCode = 429
  } = config;

  return function rateLimit(req: NextRequest) {
    const identifier = getIdentifier(req);
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    });

    // Get or create rate limit entry
    if (!rateLimitStore[identifier]) {
      rateLimitStore[identifier] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    const entry = rateLimitStore[identifier];
    
    // Check if window has reset
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: message,
          retryAfter,
          limit: maxRequests,
          remaining: 0
        },
        { 
          status: statusCode,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
          }
        }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
    
    return response;
  };
}

function getIdentifier(req: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0].trim() : undefined) || req.headers.get('x-real-ip') || 'unknown';
  
  // For authenticated users, include user ID for more granular control
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT or session (simplified)
    return `user:${ip}`;
  }
  
  return `ip:${ip}`;
}

// Pre-configured rate limiters for different use cases
// Auth rate limiter: Only count POST /api/auth/signin requests.
// Skip GET endpoints like session, csrf, providers, callback, and internal _log.
const baseAuthLimiter = createRateLimiter({
  windowMs: currentSecurityConfig.rateLimit.auth.windowMs,
  maxRequests: currentSecurityConfig.rateLimit.auth.maxRequests,
  message: 'Too many authentication attempts, please try again later.',
  statusCode: 429,
});

export function authRateLimit(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method.toUpperCase();

  // Allow common safe/auth endpoints without counting
  const isSafeAuthEndpoint = (
    method === 'GET' && (
      pathname === '/api/auth/session' ||
      pathname === '/api/auth/csrf' ||
      pathname === '/api/auth/providers' ||
      pathname.startsWith('/api/auth/callback') ||
      pathname.startsWith('/api/auth/verify-request')
    )
  ) || pathname.startsWith('/api/auth/_log');

  if (isSafeAuthEndpoint) {
    return; // no limiting
  }

  // Only limit explicit sign-in attempts (POST)
  const isSigninAttempt = method === 'POST' && pathname.startsWith('/api/auth/signin');
  if (!isSigninAttempt) {
    return; // no limiting
  }

  return baseAuthLimiter(req);
}

export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 API calls per 15 minutes
  message: 'API rate limit exceeded, please try again later.',
  statusCode: 429
});

export const fileUploadRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 file uploads per hour
  message: 'File upload limit exceeded, please try again later.',
  statusCode: 429
});

export const realtimeRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 300, // 300 real-time events per minute
  message: 'Real-time event limit exceeded, please try again later.',
  statusCode: 429
});
