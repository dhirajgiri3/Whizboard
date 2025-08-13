import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  provider?: string;
}

export interface AuthOptions {
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  logAccess?: boolean;
}

export async function authenticateRequest(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<{ user: AuthenticatedUser | null; error?: string; status?: number }> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      if (options.requireAuth) {
        return {
          user: null,
          error: 'Authentication required',
          status: 401
        };
      }
      return { user: null };
    }

    const user: AuthenticatedUser = {
      id: token.sub!,
      email: token.email || '',
      name: token.name,
      emailVerified: token.emailVerified,
      provider: token.provider
    };

    // Check email verification if required
    if (options.requireEmailVerification && !user.emailVerified) {
      return {
        user: null,
        error: 'Email verification required',
        status: 403
      };
    }

    return { user };
  } catch (error) {
    console.error('API authentication error:', error);
    return {
      user: null,
      error: 'Authentication failed',
      status: 500
    };
  }
}

export async function requireAuth(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<NextResponse | AuthenticatedUser> {
  const { user, error, status } = await authenticateRequest(request, {
    requireAuth: true,
    ...options
  });

  if (error || !user) {
    return NextResponse.json(
      { error: error || 'Authentication required' },
      { status: status || 401 }
    );
  }

  return user;
}

export async function optionalAuth(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const { user } = await authenticateRequest(request, { requireAuth: false });
  return user;
}

// Helper function to create protected API handler
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await requireAuth(request, options);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    return handler(request, authResult);
  };
}

// Helper function to create optional auth API handler
export function withOptionalAuth(
  handler: (request: NextRequest, user: AuthenticatedUser | null) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await optionalAuth(request);
    return handler(request, user);
  };
}
