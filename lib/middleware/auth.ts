import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define route access levels
export enum RouteAccess {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  BOARD_MEMBER = 'board_member'
}

// Route configuration mapping
export const routeConfig: Record<string, RouteAccess> = {
  // Public routes (accessible to everyone)
  '/': RouteAccess.PUBLIC,
  '/about': RouteAccess.PUBLIC,
  '/contact': RouteAccess.PUBLIC,
  '/help': RouteAccess.PUBLIC,
  '/terms': RouteAccess.PUBLIC,
  '/privacy': RouteAccess.PUBLIC,
  
  // Authentication required routes
  '/profile': RouteAccess.AUTHENTICATED,
  '/settings': RouteAccess.AUTHENTICATED,
  '/my-boards': RouteAccess.AUTHENTICATED,
  '/team-workspace': RouteAccess.AUTHENTICATED,
  '/board': RouteAccess.AUTHENTICATED,
  
  // Unauthenticated only routes (login, register)
  '/login': RouteAccess.UNAUTHENTICATED,
  
  // API routes (handled separately)
  '/api': RouteAccess.PUBLIC,
};

// Default redirect paths
export const defaultRedirects = {
  unauthenticated: '/login',
  authenticated: '/my-boards',
  boardAccess: '/my-boards',
};

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const isAuthenticated = !!token;
    const currentRoute = getRouteAccessLevel(pathname);
    
    // Handle route access based on authentication status
    switch (currentRoute) {
      case RouteAccess.PUBLIC:
        // Public routes are accessible to everyone
        return NextResponse.next();
        
      case RouteAccess.AUTHENTICATED:
        if (!isAuthenticated) {
          // Redirect unauthenticated users to login
          const loginUrl = new URL(defaultRedirects.unauthenticated, request.url);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
        
      case RouteAccess.UNAUTHENTICATED:
        if (isAuthenticated) {
          // Redirect authenticated users away from login/register pages
          const redirectUrl = request.nextUrl.searchParams.get('callbackUrl') || defaultRedirects.authenticated;
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
        
      case RouteAccess.BOARD_MEMBER:
        if (!isAuthenticated) {
          // Redirect unauthenticated users to login
          const loginUrl = new URL(defaultRedirects.unauthenticated, request.url);
          loginUrl.searchParams.set('callbackUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
        // Additional board access validation will be handled in the page component
        return NextResponse.next();
        
      default:
        // Unknown route, allow access (could be a 404)
        return NextResponse.next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    // On error, redirect to login for safety
    const loginUrl = new URL(defaultRedirects.unauthenticated, request.url);
    return NextResponse.redirect(loginUrl);
  }
}

function getRouteAccessLevel(pathname: string): RouteAccess {
  // Check exact matches first
  if (routeConfig[pathname]) {
    return routeConfig[pathname];
  }
  
  // Check for board routes
  if (pathname.startsWith('/board/')) {
    return RouteAccess.BOARD_MEMBER;
  }
  
  // Check for settings sub-routes
  if (pathname.startsWith('/settings/')) {
    return RouteAccess.AUTHENTICATED;
  }
  
  // Check for board sub-routes
  if (pathname.startsWith('/board/')) {
    return RouteAccess.BOARD_MEMBER;
  }
  
  // Default to public for unknown routes
  return RouteAccess.PUBLIC;
}

// Helper function to check if user has access to a specific board
export async function checkBoardAccess(
  request: NextRequest, 
  boardId: string
): Promise<{ hasAccess: boolean; redirectUrl?: string }> {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return {
        hasAccess: false,
        redirectUrl: `/login?callbackUrl=/board/${boardId}`
      };
    }
    
    // Here you would typically check if the user has access to the specific board
    // This could involve checking the user's board memberships, permissions, etc.
    // For now, we'll assume authenticated users have access
    
    return { hasAccess: true };
  } catch (error) {
    console.error('Board access check error:', error);
    return {
      hasAccess: false,
      redirectUrl: '/login'
    };
  }
}
