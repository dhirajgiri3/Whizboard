export interface SecurityConfig {
  // Authentication settings
  auth: {
    sessionMaxAge: number; // in seconds
    jwtMaxAge: number; // in seconds
    updateAge: number; // in seconds
    requireEmailVerification: boolean;
    allowedDomains?: string[];
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
  };

  // Rate limiting settings
  rateLimit: {
    auth: {
      windowMs: number; // in milliseconds
      maxRequests: number;
    };
    api: {
      windowMs: number;
      maxRequests: number;
    };
    fileUpload: {
      windowMs: number;
      maxRequests: number;
    };
    realtime: {
      windowMs: number;
      maxRequests: number;
    };
  };

  // File upload security
  fileUpload: {
    maxFileSize: number; // in bytes
    allowedTypes: string[];
    allowedExtensions: string[];
    scanForMalware: boolean;
    quarantineSuspicious: boolean;
  };

  // CSRF protection
  csrf: {
    enabled: boolean;
    cookieName: string;
    headerName: string;
    excludePaths: string[];
  };

  // Security headers
  headers: {
    enableHSTS: boolean;
    enableCSP: boolean;
    enableXFrameOptions: boolean;
    enableXContentTypeOptions: boolean;
    enableReferrerPolicy: boolean;
    enablePermissionsPolicy: boolean;
  };

  // Input validation
  validation: {
    maxStringLength: number;
    maxArrayLength: number;
    maxObjectDepth: number;
    sanitizeInputs: boolean;
    blockSuspiciousPatterns: boolean;
  };

  // Logging and monitoring
  logging: {
    logSecurityEvents: boolean;
    logAuthAttempts: boolean;
    logFileUploads: boolean;
    logAPIRequests: boolean;
    retentionDays: number;
    alertOnCritical: boolean;
  };

  // Advanced security features
  advanced: {
    enableIPWhitelist: boolean;
    enableGeolocationBlocking: boolean;
    enableBehavioralAnalysis: boolean;
    enableThreatIntelligence: boolean;
    enableAutomatedResponse: boolean;
  };
}

// Development configuration (less restrictive)
export const devSecurityConfig: SecurityConfig = {
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    jwtMaxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    requireEmailVerification: false, // Disable in development
    maxLoginAttempts: 10,
    lockoutDuration: 15,
  },

  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // More lenient in development
    },
    api: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 200, // More lenient in development
    },
    fileUpload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20, // More lenient in development
    },
    realtime: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 500, // More lenient in development
    },
  },

  fileUpload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB in development
    allowedTypes: [
      'application/json',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed'
    ],
    allowedExtensions: ['.json', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip'],
    scanForMalware: false, // Disable in development
    quarantineSuspicious: false, // Disable in development
  },

  csrf: {
    enabled: true,
    cookieName: 'csrf-token',
    headerName: 'x-csrf-token',
    excludePaths: [
      '/api/auth',
      '/api/graphql',
      '/_next',
      '/favicon.ico'
    ],
  },

  headers: {
    enableHSTS: false, // Disable in development
    enableCSP: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: false, // Disable in development
  },

  validation: {
    maxStringLength: 10000, // More lenient in development
    maxArrayLength: 1000, // More lenient in development
    maxObjectDepth: 10,
    sanitizeInputs: true,
    blockSuspiciousPatterns: true,
  },

  logging: {
    logSecurityEvents: true,
    logAuthAttempts: true,
    logFileUploads: true,
    logAPIRequests: true,
    retentionDays: 7, // Shorter retention in development
    alertOnCritical: false, // Disable in development
  },

  advanced: {
    enableIPWhitelist: false, // Disable in development
    enableGeolocationBlocking: false, // Disable in development
    enableBehavioralAnalysis: false, // Disable in development
    enableThreatIntelligence: false, // Disable in development
    enableAutomatedResponse: false, // Disable in development
  },
};

// Production configuration (strict)
export const prodSecurityConfig: SecurityConfig = {
  auth: {
    sessionMaxAge: 24 * 60 * 60, // 24 hours (shorter for production)
    jwtMaxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
    requireEmailVerification: true, // Require in production
    maxLoginAttempts: 5, // Stricter in production
    lockoutDuration: 30, // Longer lockout in production
  },

  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // Stricter in production
    },
    api: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100, // Stricter in production
    },
    fileUpload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // Stricter in production
    },
    realtime: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 300, // Stricter in production
    },
  },

  fileUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB in production
    allowedTypes: [
      'application/json',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    allowedExtensions: ['.json', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
    scanForMalware: true, // Enable in production
    quarantineSuspicious: true, // Enable in production
  },

  csrf: {
    enabled: true,
    cookieName: 'csrf-token',
    headerName: 'x-csrf-token',
    excludePaths: [
      '/api/auth',
      '/api/graphql'
    ],
  },

  headers: {
    enableHSTS: true, // Enable in production
    enableCSP: true,
    enableXFrameOptions: true,
    enableXContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true, // Enable in production
  },

  validation: {
    maxStringLength: 5000, // Stricter in production
    maxArrayLength: 500, // Stricter in production
    maxObjectDepth: 5,
    sanitizeInputs: true,
    blockSuspiciousPatterns: true,
  },

  logging: {
    logSecurityEvents: true,
    logAuthAttempts: true,
    logFileUploads: true,
    logAPIRequests: true,
    retentionDays: 90, // Longer retention in production
    alertOnCritical: true, // Enable in production
  },

  advanced: {
    enableIPWhitelist: true, // Enable in production
    enableGeolocationBlocking: true, // Enable in production
    enableBehavioralAnalysis: true, // Enable in production
    enableThreatIntelligence: true, // Enable in production
    enableAutomatedResponse: true, // Enable in production
  },
};

// Get current security configuration based on environment
export function getSecurityConfig(): SecurityConfig {
  return process.env.NODE_ENV === 'production' ? prodSecurityConfig : devSecurityConfig;
}

// Environment-specific overrides
export function getSecurityConfigWithOverrides(overrides: Partial<SecurityConfig>): SecurityConfig {
  const baseConfig = getSecurityConfig();
  return {
    ...baseConfig,
    ...overrides,
  };
}

// Validate security configuration
export function validateSecurityConfig(config: SecurityConfig): string[] {
  const errors: string[] = [];

  // Validate auth settings
  if (config.auth.sessionMaxAge <= 0) {
    errors.push('Session max age must be positive');
  }
  if (config.auth.jwtMaxAge <= 0) {
    errors.push('JWT max age must be positive');
  }
  if (config.auth.maxLoginAttempts <= 0) {
    errors.push('Max login attempts must be positive');
  }

  // Validate rate limiting
  if (config.rateLimit.auth.maxRequests <= 0) {
    errors.push('Auth rate limit must be positive');
  }
  if (config.rateLimit.api.maxRequests <= 0) {
    errors.push('API rate limit must be positive');
  }

  // Validate file upload
  if (config.fileUpload.maxFileSize <= 0) {
    errors.push('Max file size must be positive');
  }
  if (config.fileUpload.allowedTypes.length === 0) {
    errors.push('At least one file type must be allowed');
  }

  // Validate validation settings
  if (config.validation.maxStringLength <= 0) {
    errors.push('Max string length must be positive');
  }
  if (config.validation.maxArrayLength <= 0) {
    errors.push('Max array length must be positive');
  }
  if (config.validation.maxObjectDepth <= 0) {
    errors.push('Max object depth must be positive');
  }

  return errors;
}

// Export current configuration
export const currentSecurityConfig = getSecurityConfig();
