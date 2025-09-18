'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { LoadingOverlay } from '@/components/ui/loading/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireUnauth = false,
  redirectTo,
  fallback = <LoadingOverlay theme="dark" variant="collaboration" text="Authenticating" subtitle="Verifying your session..." />
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    // If authentication is required and user is not authenticated
    if (requireAuth && !session) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;
      router.push(loginUrl);
      return;
    }

    // If unauthenticated access is required and user is authenticated
    if (requireUnauth && session) {
      const redirectUrl = redirectTo || '/my-boards';
      router.push(redirectUrl);
      return;
    }
  }, [session, status, requireAuth, requireUnauth, redirectTo, router, pathname]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return <>{fallback}</>;
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && !session) {
    return <>{fallback}</>;
  }

  // If unauthenticated access is required and user is authenticated, don't render children
  if (requireUnauth && session) {
    return <>{fallback}</>;
  }

  // Render children if all conditions are met
  return <>{children}</>;
}

// Convenience components for common use cases
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}

export function RequireUnauth({ children, fallback, redirectTo }: { 
  children: ReactNode; 
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute requireUnauth={true} redirectTo={redirectTo} fallback={fallback}>
      {children}
    </ProtectedRoute>
  );
}
