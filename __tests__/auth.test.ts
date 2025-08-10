import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import authOptions from '@/lib/auth/options';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { getSecurityConfig, validateSecurityConfig } from '@/lib/config/security';
import { getToken } from 'next-auth/jwt';

// Mock environment variables and MongoDB client
vi.mock('@/lib/database/mongodb', () => ({
  default: Promise.resolve({
    db: vi.fn(() => ({
      collection: vi.fn(() => ({
        findOne: vi.fn(),
        find: vi.fn(() => ({ toArray: vi.fn(() => []) })),
        insertOne: vi.fn(),
        updateOne: vi.fn(),
        deleteOne: vi.fn(),
        countDocuments: vi.fn(() => 0),
      })),
    })),
  }),
}));

// Mock NextAuth - use the global mock from auth-test-setup.ts
vi.mock('next-auth/jwt');

// Helper function to set mock token for specific tests
function setMockToken(token: any) {
  (globalThis as any).mockTokenOverride = token;
}

function clearMockToken() {
  (globalThis as any).mockTokenOverride = null;
}

// Mock security logger (including named exports used by middleware)
vi.mock('@/lib/logger/securityLogger', () => ({
  securityLogger: {
    logEvent: vi.fn(),
    logError: vi.fn(),
  },
  logAPIAccess: vi.fn(),
  logInvalidInput: vi.fn(),
}));

// Mock API access logger
vi.mock('@/lib/logger/logger', () => ({
  logAPIAccess: vi.fn(),
}));

describe('Authentication System Tests', () => {
  let authMiddleware: AuthMiddleware;
  let mockRequest: NextRequest;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Set up getToken mock behavior for this test
    const { getToken } = await import('next-auth/jwt');
    // Ensure we always return a token-shaped object that includes sub
    vi.mocked(getToken).mockImplementation((options: any) => {
      console.log('getToken called with options:', JSON.stringify(options, null, 2));
      
      // Check for mock token override first (from globalThis)
      if ((globalThis as any).mockTokenOverride) {
        console.log('Using mock token override:', (globalThis as any).mockTokenOverride);
        // Map id->sub if provided for convenience
        const override = (globalThis as any).mockTokenOverride;
        const sub = override.sub || override.id;
        return Promise.resolve({
          sub,
          email: override.email,
          name: override.name,
          emailVerified: override.emailVerified,
          provider: override.provider,
          role: override.role,
          iat: override.iat || Math.floor(Date.now() / 1000),
          exp: override.exp || Math.floor(Date.now() / 1000) + 3600,
          jti: override.jti || 'test-jwt-id-123',
        });
      }
      
      // Return the mock token based on the request context
      if (options.req) {
        const authHeader = options.req.headers.get('authorization');
        console.log('Auth header:', authHeader);
        
        if (authHeader?.startsWith('Bearer ')) {
          console.log('Bearer token detected, returning valid user');
          // For Bearer token requests, return a valid user
          return Promise.resolve({
            sub: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: true,
            provider: 'google',
            role: 'user',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            jti: 'test-jwt-id-123',
          });
        }
        
        // For session cookie requests, check if we have a session cookie
        const sessionToken = options.req.cookies?.get('next-auth.session-token')?.value;
        console.log('Session token:', sessionToken);
        
        if (sessionToken) {
          console.log('Session token detected, returning valid user');
          // Return a valid user for session-based requests
          return Promise.resolve({
            sub: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            emailVerified: true,
            provider: 'google',
            role: 'user',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            jti: 'test-jwt-id-123',
          });
        }
      }
      
      console.log('No valid token found, returning null');
      // Default case - no token
      return Promise.resolve(null);
    });
    
    // Create auth middleware instance
    authMiddleware = new AuthMiddleware({
      requireAuth: true,
      requireRole: ['user', 'admin'],
      logAccess: true,
    });

    // Create mock request
    mockRequest = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Security Configuration Tests', () => {
    it('should load correct security configuration based on environment', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.auth.requireEmailVerification).toBe(true);
        expect(config.auth.maxLoginAttempts).toBe(5);
        expect(config.headers.enableHSTS).toBe(true);
        expect(config.advanced.enableIPWhitelist).toBe(true);
      } else {
        expect(config.auth.requireEmailVerification).toBe(false);
        expect(config.auth.maxLoginAttempts).toBe(10);
        expect(config.headers.enableHSTS).toBe(false);
        expect(config.advanced.enableIPWhitelist).toBe(false);
      }
    });

    it('should validate security configuration correctly', () => {
      const validConfig = getSecurityConfig();
      const errors = validateSecurityConfig(validConfig);
      expect(errors).toHaveLength(0);

      // Test invalid configuration
      const invalidConfig = {
        ...validConfig,
        auth: {
          ...validConfig.auth,
          sessionMaxAge: -1, // Invalid negative value
        },
      };
      
      const invalidErrors = validateSecurityConfig(invalidConfig);
      expect(invalidErrors).toContain('Session max age must be positive');
    });

    it('should apply security configuration overrides', () => {
      const baseConfig = getSecurityConfig();
      const overrides = {
        auth: {
          maxLoginAttempts: 3,
          lockoutDuration: 60,
        },
      };
      
      const configWithOverrides = {
        ...baseConfig,
        ...overrides,
      };
      
      expect(configWithOverrides.auth.maxLoginAttempts).toBe(3);
      expect(configWithOverrides.auth.lockoutDuration).toBe(60);
    });
  });

  describe('NextAuth Configuration Tests', () => {
    it('should have secure session configuration', () => {
      expect(authOptions.session.strategy).toBe('jwt');
      expect(authOptions.session.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
      expect(authOptions.session.updateAge).toBe(24 * 60 * 60); // 24 hours
    });

    it('should have secure JWT configuration', () => {
      expect(authOptions.jwt.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
      expect(authOptions.jwt.secret).toBeDefined();
    });

    it('should have secure cookie configuration', () => {
      const sessionCookie = authOptions.cookies?.sessionToken;
      expect(sessionCookie?.options.httpOnly).toBe(true);
      expect(sessionCookie?.options.sameSite).toBe('lax');
      expect(sessionCookie?.options.secure).toBe(process.env.NODE_ENV === 'production');
    });

    it('should have security callbacks configured', () => {
      expect(authOptions.callbacks.signIn).toBeDefined();
      expect(authOptions.callbacks.jwt).toBeDefined();
      expect(authOptions.callbacks.session).toBeDefined();
      expect(authOptions.callbacks.redirect).toBeDefined();
    });

    it('should have security events configured', () => {
      expect(authOptions.events?.signIn).toBeDefined();
      expect(authOptions.events?.signOut).toBeDefined();
      expect(authOptions.events?.createUser).toBeDefined();
      expect(authOptions.events?.session).toBeDefined();
    });
  });

  describe('Authentication Middleware Tests', () => {
    it('should authenticate valid JWT token', async () => {
      // Create request with session cookie
      const requestWithSession = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'user-agent': 'test-user-agent',
          'x-forwarded-for': '127.0.0.1',
        },
      });
      
      // Add session cookie
      requestWithSession.cookies.set('next-auth.session-token', 'valid-session-token');

      const result = await authMiddleware.authenticate(requestWithSession);
      
      console.log('Test result:', JSON.stringify(result, null, 2));
      
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('user123');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid JWT token', async () => {
      const result = await authMiddleware.authenticate(mockRequest);
      
      expect(result.user).toBeNull();
      expect(result.error).toBe('No session token');
    });

    it('should reject unverified email when required', async () => {
      // Set mock token with unverified email
      setMockToken({
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: false,
        provider: 'google',
        role: 'user',
      });

      // Create request with session cookie
      const requestWithSession = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'user-agent': 'test-user-agent',
          'x-forwarded-for': '127.0.0.1',
        },
      });
      
      // Add session cookie
      requestWithSession.cookies.set('next-auth.session-token', 'valid-session-token');

      const result = await authMiddleware.authenticate(requestWithSession);
      
      expect(result.user).toBeNull();
      expect(result.error).toBe('Email not verified');
      
      // Clean up
      clearMockToken();
    });

    it('should reject insufficient role', async () => {
      // Set mock token with insufficient role
      setMockToken({
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        provider: 'google',
        role: 'guest', // Insufficient role
      });

      // Create request with session cookie
      const requestWithSession = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'user-agent': 'test-user-agent',
          'x-forwarded-for': '127.0.0.1',
        },
      });
      
      // Add session cookie
      requestWithSession.cookies.set('next-auth.session-token', 'valid-session-token');

      const result = await authMiddleware.authenticate(requestWithSession);
      
      expect(result.user).toBeNull();
      expect(result.error).toBe('Insufficient permissions');
      
      // Clean up
      clearMockToken();
    });

    it('should handle Bearer token authentication', async () => {
      const requestWithBearer = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer valid-token',
          'user-agent': 'test-user-agent',
          'x-forwarded-for': '127.0.0.1',
        },
      });

      const result = await authMiddleware.authenticate(requestWithBearer);
      
      console.log('Bearer test result:', JSON.stringify(result, null, 2));
      
      expect(result.user).toBeDefined();
      expect(result.user?.id).toBe('user123');
      expect(result.error).toBeUndefined();
    });

    it('should require authentication when configured', async () => {
      const middleware = new AuthMiddleware({
        requireAuth: true,
        requireRole: undefined,
        logAccess: false,
      });

      const result = await middleware.requireAuth(mockRequest);
      
      // Should return NextResponse with 401 status
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should have rate limiting configured for different endpoints', () => {
      const config = getSecurityConfig();
      
      expect(config.rateLimit.auth.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.rateLimit.auth.maxRequests).toBeGreaterThan(0);
      
      expect(config.rateLimit.api.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.rateLimit.api.maxRequests).toBeGreaterThan(0);
      
      expect(config.rateLimit.fileUpload.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(config.rateLimit.fileUpload.maxRequests).toBeGreaterThan(0);
      
      expect(config.rateLimit.realtime.windowMs).toBe(60 * 1000); // 1 minute
      expect(config.rateLimit.realtime.maxRequests).toBeGreaterThan(0);
    });

    it('should have stricter rate limits in production', () => {
      const devConfig = getSecurityConfig();
      
      // Temporarily set NODE_ENV to production for testing
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodConfig = getSecurityConfig();
      
      // Production should have stricter limits
      expect(prodConfig.rateLimit.auth.maxRequests).toBeLessThanOrEqual(devConfig.rateLimit.auth.maxRequests);
      expect(prodConfig.rateLimit.api.maxRequests).toBeLessThanOrEqual(devConfig.rateLimit.api.maxRequests);
      expect(prodConfig.rateLimit.fileUpload.maxRequests).toBeLessThanOrEqual(devConfig.rateLimit.fileUpload.maxRequests);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CSRF Protection Tests', () => {
    it('should have CSRF protection enabled', () => {
      const config = getSecurityConfig();
      
      expect(config.csrf.enabled).toBe(true);
      expect(config.csrf.cookieName).toBe('csrf-token');
      expect(config.csrf.headerName).toBe('x-csrf-token');
      expect(config.csrf.excludePaths).toContain('/api/auth');
      expect(config.csrf.excludePaths).toContain('/api/graphql');
    });

    it('should exclude authentication endpoints from CSRF', () => {
      const config = getSecurityConfig();
      
      // Authentication endpoints should be excluded
      expect(config.csrf.excludePaths).toContain('/api/auth');
      expect(config.csrf.excludePaths).toContain('/api/graphql');
      
      // Development should have more exclusions
      if (process.env.NODE_ENV !== 'production') {
        expect(config.csrf.excludePaths).toContain('/_next');
        expect(config.csrf.excludePaths).toContain('/favicon.ico');
      }
    });
  });

  describe('Security Headers Tests', () => {
    it('should have security headers configured', () => {
      const config = getSecurityConfig();
      
      expect(config.headers.enableCSP).toBe(true);
      expect(config.headers.enableXFrameOptions).toBe(true);
      expect(config.headers.enableXContentTypeOptions).toBe(true);
      expect(config.headers.enableReferrerPolicy).toBe(true);
    });

    it('should enable HSTS in production only', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.headers.enableHSTS).toBe(true);
        expect(config.headers.enablePermissionsPolicy).toBe(true);
      } else {
        expect(config.headers.enableHSTS).toBe(false);
        expect(config.headers.enablePermissionsPolicy).toBe(false);
      }
    });
  });

  describe('File Upload Security Tests', () => {
    it('should have secure file upload configuration', () => {
      const config = getSecurityConfig();
      
      expect(config.fileUpload.maxFileSize).toBeGreaterThan(0);
      expect(config.fileUpload.allowedTypes.length).toBeGreaterThan(0);
      expect(config.fileUpload.allowedExtensions.length).toBeGreaterThan(0);
    });

    it('should have stricter file upload limits in production', () => {
      const devConfig = getSecurityConfig();
      
      // Temporarily set NODE_ENV to production for testing
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodConfig = getSecurityConfig();
      
      // Production should have smaller file size limits
      expect(prodConfig.fileUpload.maxFileSize).toBeLessThanOrEqual(devConfig.fileUpload.maxFileSize);
      
      // Production should have malware scanning enabled
      expect(prodConfig.fileUpload.scanForMalware).toBe(true);
      expect(prodConfig.fileUpload.quarantineSuspicious).toBe(true);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Input Validation Tests', () => {
    it('should have input validation limits configured', () => {
      const config = getSecurityConfig();
      
      expect(config.validation.maxStringLength).toBeGreaterThan(0);
      expect(config.validation.maxArrayLength).toBeGreaterThan(0);
      expect(config.validation.maxObjectDepth).toBeGreaterThan(0);
      expect(config.validation.sanitizeInputs).toBe(true);
      expect(config.validation.blockSuspiciousPatterns).toBe(true);
    });

    it('should have stricter validation in production', () => {
      const devConfig = getSecurityConfig();
      
      // Temporarily set NODE_ENV to production for testing
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodConfig = getSecurityConfig();
      
      // Production should have stricter limits
      expect(prodConfig.validation.maxStringLength).toBeLessThanOrEqual(devConfig.validation.maxStringLength);
      expect(prodConfig.validation.maxArrayLength).toBeLessThanOrEqual(devConfig.validation.maxArrayLength);
      expect(prodConfig.validation.maxObjectDepth).toBeLessThanOrEqual(devConfig.validation.maxObjectDepth);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Logging and Monitoring Tests', () => {
    it('should have logging configuration', () => {
      const config = getSecurityConfig();
      
      expect(config.logging.logSecurityEvents).toBe(true);
      expect(config.logging.logAuthAttempts).toBe(true);
      expect(config.logging.logFileUploads).toBe(true);
      expect(config.logging.logAPIRequests).toBe(true);
      expect(config.logging.retentionDays).toBeGreaterThan(0);
    });

    it('should have longer retention in production', () => {
      const devConfig = getSecurityConfig();
      
      // Temporarily set NODE_ENV to production for testing
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const prodConfig = getSecurityConfig();
      
      // Production should have longer retention
      expect(prodConfig.logging.retentionDays).toBeGreaterThan(devConfig.logging.retentionDays);
      expect(prodConfig.logging.alertOnCritical).toBe(true);
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Advanced Security Features Tests', () => {
    it('should have advanced security features configured', () => {
      const config = getSecurityConfig();
      
      expect(typeof config.advanced.enableIPWhitelist).toBe('boolean');
      expect(typeof config.advanced.enableGeolocationBlocking).toBe('boolean');
      expect(typeof config.advanced.enableBehavioralAnalysis).toBe('boolean');
      expect(typeof config.advanced.enableThreatIntelligence).toBe('boolean');
      expect(typeof config.advanced.enableAutomatedResponse).toBe('boolean');
    });

    it('should enable advanced features in production only', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.advanced.enableIPWhitelist).toBe(true);
        expect(config.advanced.enableGeolocationBlocking).toBe(true);
        expect(config.advanced.enableBehavioralAnalysis).toBe(true);
        expect(config.advanced.enableThreatIntelligence).toBe(true);
        expect(config.advanced.enableAutomatedResponse).toBe(true);
      } else {
        expect(config.advanced.enableIPWhitelist).toBe(false);
        expect(config.advanced.enableGeolocationBlocking).toBe(false);
        expect(config.advanced.enableBehavioralAnalysis).toBe(false);
        expect(config.advanced.enableThreatIntelligence).toBe(false);
        expect(config.advanced.enableAutomatedResponse).toBe(false);
      }
    });
  });
});
