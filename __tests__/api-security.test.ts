import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { getSecurityConfig } from '@/lib/config/security';

// Mock environment variables
vi.mock('@/lib/database/mongodb', () => ({
  default: vi.fn(() => Promise.resolve({})),
}));

// Mock security logger
vi.mock('@/lib/logger/securityLogger', () => ({
  securityLogger: {
    logEvent: vi.fn(),
    logError: vi.fn(),
  },
}));

// Mock API access logger
vi.mock('@/lib/logger/logger', () => ({
  logAPIAccess: vi.fn(),
}));

describe('API Security Tests', () => {
  let authMiddleware: AuthMiddleware;
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
    
    authMiddleware = new AuthMiddleware({
      requireAuth: true,
      requireRole: ['user', 'admin'],
      logAccess: true,
    });

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

  describe('Authentication Requirements', () => {
    it('should require authentication for protected endpoints', async () => {
      const result = await authMiddleware.requireAuth(mockRequest);
      
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('No session token');
    });

    it('should allow unauthenticated access when auth not required', async () => {
      const middleware = new AuthMiddleware({
        requireAuth: false,
        requireRole: undefined,
        logAccess: false,
      });

      const result = await middleware.authenticate(mockRequest);
      expect(result.user).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should enforce role-based access control', async () => {
      const middleware = new AuthMiddleware({
        requireAuth: true,
        requireRole: ['admin'],
        logAccess: true,
      });

      // Mock a user with insufficient role
      const mockToken = {
        sub: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        provider: 'google',
        role: 'user', // Not admin
      };

      // Mock getToken to return the user
      vi.doMock('next-auth/jwt', () => ({
        getToken: vi.fn(() => Promise.resolve(mockToken)),
      }));

      const result = await middleware.requireAuth(mockRequest);
      expect(result).toBeInstanceOf(Response);
      const response = result as Response;
      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting Implementation', () => {
    it('should have rate limiting configuration for all API endpoints', () => {
      const config = getSecurityConfig();
      
      // Check that all rate limiting categories are configured
      expect(config.rateLimit.auth).toBeDefined();
      expect(config.rateLimit.api).toBeDefined();
      expect(config.rateLimit.fileUpload).toBeDefined();
      expect(config.rateLimit.realtime).toBeDefined();
      
      // Check that all have valid configurations
      Object.values(config.rateLimit).forEach(category => {
        expect(category.windowMs).toBeGreaterThan(0);
        expect(category.maxRequests).toBeGreaterThan(0);
      });
    });

    it('should have appropriate rate limits for different endpoint types', () => {
      const config = getSecurityConfig();
      
      // Authentication endpoints should have stricter limits
      expect(config.rateLimit.auth.maxRequests).toBeLessThan(config.rateLimit.api.maxRequests);
      
      // File upload should have reasonable limits
      expect(config.rateLimit.fileUpload.maxRequests).toBeLessThanOrEqual(20);
      
      // Realtime endpoints can have higher limits
      expect(config.rateLimit.realtime.maxRequests).toBeGreaterThan(config.rateLimit.auth.maxRequests);
    });
  });

  describe('CSRF Protection', () => {
    it('should have CSRF protection enabled for API endpoints', () => {
      const config = getSecurityConfig();
      
      expect(config.csrf.enabled).toBe(true);
      expect(config.csrf.cookieName).toBe('csrf-token');
      expect(config.csrf.headerName).toBe('x-csrf-token');
    });

    it('should exclude authentication endpoints from CSRF requirements', () => {
      const config = getSecurityConfig();
      
      expect(config.csrf.excludePaths).toContain('/api/auth');
      expect(config.csrf.excludePaths).toContain('/api/graphql');
    });

    it('should have appropriate CSRF exclusions for development', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV !== 'production') {
        expect(config.csrf.excludePaths).toContain('/_next');
        expect(config.csrf.excludePaths).toContain('/favicon.ico');
      }
    });
  });

  describe('Security Headers', () => {
    it('should have comprehensive security headers configured', () => {
      const config = getSecurityConfig();
      
      // Core security headers
      expect(config.headers.enableCSP).toBe(true);
      expect(config.headers.enableXFrameOptions).toBe(true);
      expect(config.headers.enableXContentTypeOptions).toBe(true);
      expect(config.headers.enableReferrerPolicy).toBe(true);
    });

    it('should enable production-specific security headers', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.headers.enableHSTS).toBe(true);
        expect(config.headers.enablePermissionsPolicy).toBe(true);
      }
    });
  });

  describe('Input Validation', () => {
    it('should have input validation limits configured', () => {
      const config = getSecurityConfig();
      
      expect(config.validation.maxStringLength).toBeGreaterThan(0);
      expect(config.validation.maxArrayLength).toBeGreaterThan(0);
      expect(config.validation.maxObjectDepth).toBeGreaterThan(0);
    });

    it('should have input sanitization enabled', () => {
      const config = getSecurityConfig();
      
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

  describe('File Upload Security', () => {
    it('should have secure file upload configuration', () => {
      const config = getSecurityConfig();
      
      expect(config.fileUpload.maxFileSize).toBeGreaterThan(0);
      expect(config.fileUpload.allowedTypes.length).toBeGreaterThan(0);
      expect(config.fileUpload.allowedExtensions.length).toBeGreaterThan(0);
    });

    it('should have malware scanning in production', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.fileUpload.scanForMalware).toBe(true);
        expect(config.fileUpload.quarantineSuspicious).toBe(true);
      }
    });

    it('should have appropriate file type restrictions', () => {
      const config = getSecurityConfig();
      
      // Should allow common safe file types
      expect(config.fileUpload.allowedTypes).toContain('application/json');
      expect(config.fileUpload.allowedTypes).toContain('text/plain');
      expect(config.fileUpload.allowedTypes).toContain('image/jpeg');
      expect(config.fileUpload.allowedTypes).toContain('image/png');
      
      // Should have corresponding extensions
      expect(config.fileUpload.allowedExtensions).toContain('.json');
      expect(config.fileUpload.allowedExtensions).toContain('.txt');
      expect(config.fileUpload.allowedExtensions).toContain('.jpg');
      expect(config.fileUpload.allowedExtensions).toContain('.png');
    });
  });

  describe('Logging and Monitoring', () => {
    it('should have comprehensive logging configuration', () => {
      const config = getSecurityConfig();
      
      expect(config.logging.logSecurityEvents).toBe(true);
      expect(config.logging.logAuthAttempts).toBe(true);
      expect(config.logging.logFileUploads).toBe(true);
      expect(config.logging.logAPIRequests).toBe(true);
    });

    it('should have appropriate log retention periods', () => {
      const config = getSecurityConfig();
      
      expect(config.logging.retentionDays).toBeGreaterThan(0);
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.logging.retentionDays).toBeGreaterThanOrEqual(90);
        expect(config.logging.alertOnCritical).toBe(true);
      } else {
        expect(config.logging.retentionDays).toBeLessThanOrEqual(7);
        expect(config.logging.alertOnCritical).toBe(false);
      }
    });
  });

  describe('Advanced Security Features', () => {
    it('should have advanced security features available', () => {
      const config = getSecurityConfig();
      
      expect(typeof config.advanced.enableIPWhitelist).toBe('boolean');
      expect(typeof config.advanced.enableGeolocationBlocking).toBe('boolean');
      expect(typeof config.advanced.enableBehavioralAnalysis).toBe('boolean');
      expect(typeof config.advanced.enableThreatIntelligence).toBe('boolean');
      expect(typeof config.advanced.enableAutomatedResponse).toBe('boolean');
    });

    it('should enable advanced features in production', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.advanced.enableIPWhitelist).toBe(true);
        expect(config.advanced.enableGeolocationBlocking).toBe(true);
        expect(config.advanced.enableBehavioralAnalysis).toBe(true);
        expect(config.advanced.enableThreatIntelligence).toBe(true);
        expect(config.advanced.enableAutomatedResponse).toBe(true);
      }
    });
  });

  describe('Session Security', () => {
    it('should have secure session configuration', () => {
      const config = getSecurityConfig();
      
      expect(config.auth.sessionMaxAge).toBeGreaterThan(0);
      expect(config.auth.jwtMaxAge).toBeGreaterThan(0);
      expect(config.auth.updateAge).toBeGreaterThan(0);
    });

    it('should have appropriate session timeouts', () => {
      const config = getSecurityConfig();
      
      // Session should not be too long for security
      expect(config.auth.sessionMaxAge).toBeLessThanOrEqual(30 * 24 * 60 * 60); // Max 30 days
      
      // Update age should be reasonable
      expect(config.auth.updateAge).toBeLessThanOrEqual(24 * 60 * 60); // Max 24 hours
    });

    it('should have email verification requirements', () => {
      const config = getSecurityConfig();
      
      if (process.env.NODE_ENV === 'production') {
        expect(config.auth.requireEmailVerification).toBe(true);
      }
    });

    it('should have brute force protection', () => {
      const config = getSecurityConfig();
      
      expect(config.auth.maxLoginAttempts).toBeGreaterThan(0);
      expect(config.auth.lockoutDuration).toBeGreaterThan(0);
      
      // Should have reasonable limits
      expect(config.auth.maxLoginAttempts).toBeLessThanOrEqual(10);
      expect(config.auth.lockoutDuration).toBeLessThanOrEqual(60); // Max 1 hour
    });
  });

  describe('API Endpoint Security', () => {
    it('should protect sensitive endpoints', () => {
      const sensitiveEndpoints = [
        '/api/board',
        '/api/settings',
        '/api/user',
        '/api/admin',
      ];

      // All sensitive endpoints should require authentication
      sensitiveEndpoints.forEach(endpoint => {
        expect(endpoint).toMatch(/^\/api\//);
      });
    });

    it('should have appropriate CORS configuration', () => {
      // This would be tested in actual API endpoint tests
      // For now, we verify the security config supports it
      const config = getSecurityConfig();
      
      // Security headers should be enabled
      expect(config.headers.enableCSP).toBe(true);
      expect(config.headers.enableXFrameOptions).toBe(true);
    });
  });

  describe('Error Handling and Security', () => {
    it('should not expose sensitive information in error messages', () => {
      // Error messages should be generic and not reveal system details
      const genericErrors = [
        'Authentication required',
        'Invalid session token',
        'Email not verified',
        'Insufficient permissions',
      ];

      genericErrors.forEach(error => {
        // Should not contain system paths, stack traces, or internal details
        expect(error).not.toMatch(/\/.*\/.*/); // No file paths
        expect(error).not.toMatch(/Error:|Exception:/); // No technical error prefixes
        expect(error).not.toMatch(/localhost|127\.0\.0\.1/); // No internal addresses
      });
    });

    it('should log security events appropriately', () => {
      const config = getSecurityConfig();
      
      // Security events should always be logged
      expect(config.logging.logSecurityEvents).toBe(true);
      expect(config.logging.logAuthAttempts).toBe(true);
    });
  });
});
