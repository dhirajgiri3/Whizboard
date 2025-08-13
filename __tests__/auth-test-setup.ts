import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Mock NextAuth JWT token verification
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn((options: any) => {
    console.log('getToken called with options:', options);
    
    // Check for mock token override first
    if (globalThis.mockTokenOverride) {
      console.log('Using mock token override:', globalThis.mockTokenOverride);
      return Promise.resolve(globalThis.mockTokenOverride);
    }

    // Mock token verification for tests
    if (options.req?.headers?.authorization?.startsWith('Bearer ')) {
      const token = options.req.headers.authorization.substring(7);
      console.log('Auth header:', options.req.headers.authorization);
      if (token === 'valid-token') {
        console.log('Bearer token detected, returning valid user');
        return Promise.resolve({
          sub: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: new Date(),
          provider: 'google',
          role: 'user',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          jti: 'test-jwt-id-123',
        });
      }
    }
    
    // Mock session token verification
    if (options.req?.cookies?.get) {
      const sessionToken = options.req.cookies.get('next-auth.session-token')?.value ||
                          options.req.cookies.get('__Secure-next-auth.session-token')?.value;
      console.log('Session token:', sessionToken);
      
      if (sessionToken === 'valid-session-token') {
        console.log('Session token detected, returning valid user');
        return Promise.resolve({
          sub: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          emailVerified: new Date(),
          provider: 'google',
          role: 'user',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          jti: 'test-jwt-id-123',
        });
      }
    }
    
    // Return null for invalid/missing tokens
    console.log('No valid token found, returning null');
    return Promise.resolve(null);
  }),
}));

// Mock MongoDB adapter for NextAuth
vi.mock('@next-auth/mongodb-adapter', () => ({
  MongoDBAdapter: vi.fn(() => ({
    createUser: vi.fn(),
    getUser: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserByAccount: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    linkAccount: vi.fn(),
    unlinkAccount: vi.fn(),
    createSession: vi.fn(),
    getSessionAndUser: vi.fn(),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    createVerificationToken: vi.fn(),
    useVerificationToken: vi.fn(),
  })),
}));

// Mock MongoDB client
vi.mock('@/lib/database/mongodb', () => ({
  default: Promise.resolve({
    db: vi.fn(() => ({
      collection: vi.fn(() => ({
        findOne: vi.fn(),
        find: vi.fn(() => ({
          toArray: vi.fn(() => []),
        })),
        insertOne: vi.fn(),
        updateOne: vi.fn(),
        deleteOne: vi.fn(),
        countDocuments: vi.fn(() => 0),
      })),
    })),
  }),
}));

// Test environment configuration for authentication tests
export const setupAuthTestEnvironment = () => {
  beforeAll(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    process.env.REDIS_URL = 'redis://localhost:6379/0';
    
    // Mock crypto for consistent JWT ID generation in tests
    if (!global.crypto) {
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: () => 'test-uuid-123',
        },
      });
    }
  });

  afterAll(() => {
    // Clean up test environment
    delete process.env.NEXTAUTH_SECRET;
    delete process.env.NEXTAUTH_URL;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.MONGODB_URI;
    delete process.env.REDIS_URL;
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });
};

// Mock data for authentication tests
export const mockAuthData = {
  users: {
    validUser: {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'user',
    },
    adminUser: {
      id: 'admin456',
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'admin',
    },
    unverifiedUser: {
      id: 'user789',
      email: 'unverified@example.com',
      name: 'Unverified User',
      emailVerified: null,
      provider: 'google',
      role: 'user',
    },
  },
  
  tokens: {
    validToken: {
      sub: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: 'test-jwt-id-123',
    },
    expiredToken: {
      sub: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'user',
      iat: Math.floor(Date.now() / 1000) - 7200,
      exp: Math.floor(Date.now() / 1000) - 3600,
      jti: 'test-jwt-id-expired',
    },
    adminToken: {
      sub: 'admin456',
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: 'test-jwt-id-admin',
    },
  },
  
  sessions: {
    validSession: {
      user: {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      },
      expires: new Date(Date.now() + 3600000).toISOString(),
    },
    adminSession: {
      user: {
        id: 'admin456',
        email: 'admin@example.com',
        name: 'Admin User',
        image: 'https://example.com/admin-avatar.jpg',
      },
      expires: new Date(Date.now() + 3600000).toISOString(),
    },
  },
  
  requests: {
    authenticated: {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: {
        'authorization': 'Bearer valid-token',
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    },
    unauthenticated: {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: {
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    },
    withSessionCookie: {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: {
        'cookie': 'next-auth.session-token=valid-session-token',
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
      },
    },
  },
  
  cookies: {
    validSession: 'next-auth.session-token=valid-session-token',
    secureSession: '__Secure-next-auth.session-token=secure-session-token',
    csrfToken: 'next-auth.csrf-token=csrf-token-123',
    multipleCookies: 'next-auth.session-token=session-token; other-cookie=value; csrf-token=csrf-123',
  },
};

// Helper functions for authentication tests
export const authTestHelpers = {
  // Create a mock NextRequest for testing
  createMockRequest: (overrides: Partial<RequestInit> = {}) => {
    const baseRequest = {
      method: 'GET',
      url: 'http://localhost:3000/api/test',
      headers: {
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
      },
      ...overrides,
    };
    
    return new Request(baseRequest.url, baseRequest);
  },
  
  // Create a mock NextRequest with authentication
  createAuthenticatedRequest: (token: string, overrides: Partial<RequestInit> = {}) => {
    return authTestHelpers.createMockRequest({
      headers: {
        'authorization': `Bearer ${token}`,
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
        ...overrides.headers,
      },
      ...overrides,
    });
  },
  
  // Create a mock NextRequest with session cookie
  createSessionRequest: (sessionToken: string, overrides: Partial<RequestInit> = {}) => {
    return authTestHelpers.createMockRequest({
      headers: {
        'cookie': `next-auth.session-token=${sessionToken}`,
        'user-agent': 'test-user-agent',
        'x-forwarded-for': '127.0.0.1',
        ...overrides.headers,
      },
      ...overrides,
    });
  },
  
  // Validate JWT token structure
  validateJWTToken: (token: any) => {
    expect(token).toBeDefined();
    expect(token.sub).toBeDefined();
    expect(token.iat).toBeDefined();
    expect(token.exp).toBeDefined();
    expect(token.jti).toBeDefined();
    
    // Check that expiration is in the future
    expect(token.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    
    // Check that issued at is in the past
    expect(token.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  },
  
  // Validate session structure
  validateSession: (session: any) => {
    expect(session).toBeDefined();
    expect(session.user).toBeDefined();
    expect(session.user.id).toBeDefined();
    expect(session.user.email).toBeDefined();
    expect(session.expires).toBeDefined();
    
    // Check that expiration is in the future
    const expirationDate = new Date(session.expires);
    expect(expirationDate.getTime()).toBeGreaterThan(Date.now());
  },
  
  // Validate user structure
  validateUser: (user: any) => {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(typeof user.id).toBe('string');
    expect(user.id.length).toBeGreaterThan(0);
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  },
  
  // Generate test JWT token
  generateTestToken: (overrides: Partial<any> = {}) => {
    const now = Math.floor(Date.now() / 1000);
    return {
      sub: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: new Date(),
      provider: 'google',
      role: 'user',
      iat: now,
      exp: now + 3600,
      jti: 'test-jwt-id-' + Math.random().toString(36).substr(2, 9),
      ...overrides,
    };
  },
  
  // Generate test session
  generateTestSession: (overrides: Partial<any> = {}) => {
    return {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        ...overrides.user,
      },
      expires: new Date(Date.now() + 3600000).toISOString(),
      ...overrides,
    };
  },
};

// Export the setup function
export default setupAuthTestEnvironment;
