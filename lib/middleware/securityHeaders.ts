import { NextRequest, NextResponse } from 'next/server';

interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
}

export function createSecurityHeaders(config: SecurityHeadersConfig = {}) {
  const {
    enableHSTS = true,
    enableCSP = true,
    enableXFrameOptions = true,
    enableXContentTypeOptions = true,
    enableReferrerPolicy = true,
    enablePermissionsPolicy = true
  } = config;

  return function securityHeaders(req: NextRequest) {
    const response = NextResponse.next();
    
    // HTTP Strict Transport Security (HSTS)
    if (enableHSTS && req.nextUrl.protocol === 'https:') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Content Security Policy (CSP)
    if (enableCSP) {
      const cspDirectives = [
        "default-src 'self'",
        // Allow inline/eval for Next dev tooling; tighten for prod as needed
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
        // Safari can load styles via blob:/data: during dev/HMR; allow fonts stylesheet
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com blob: data:",
        // Mirror style-src for element-specific enforcement (Safari compatibility)
        "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com blob: data:",
        // Permit fonts from Google and data URIs
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob:",
        // Include ws: for Next.js dev HMR and any ws client connections
        "connect-src 'self' http: https: ws: wss:",
        "frame-src 'self' https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://accounts.google.com",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests"
      ];

      response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
    }

    // X-Frame-Options
    if (enableXFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY');
    }

    // X-Content-Type-Options
    if (enableXContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Permissions Policy
    if (enablePermissionsPolicy) {
      const permissionsPolicy = [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'encrypted-media=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'web-share=()'
      ];
      
      response.headers.set('Permissions-Policy', permissionsPolicy.join(', '));
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    
    // Remove server information
    response.headers.delete('X-Powered-By');
    response.headers.delete('Server');

    return response;
  };
}

// Pre-configured security headers
export const securityHeaders = createSecurityHeaders({
  enableHSTS: true,
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true
});

// Development-friendly security headers (less restrictive)
export const devSecurityHeaders = createSecurityHeaders({
  enableHSTS: false, // Disable HSTS in development
  enableCSP: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: false // Disable strict permissions in development
});
