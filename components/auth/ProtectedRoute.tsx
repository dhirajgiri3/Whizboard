'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode, useMemo } from 'react';
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

  // Memoize auth state to prevent unnecessary recalculations
  const authState = useMemo(() => {
    if (status === 'loading') return { shouldShow: false, isLoading: true };

    const isAuthenticated = !!session;

    if (requireAuth && !isAuthenticated) {
      return { shouldShow: false, isLoading: false, needsLogin: true };
    }

    if (requireUnauth && isAuthenticated) {
      return { shouldShow: false, isLoading: false, needsRedirect: true };
    }

    return { shouldShow: true, isLoading: false };
  }, [session, status, requireAuth, requireUnauth]);

  useEffect(() => {
    if (authState.isLoading) return;

    if (authState.needsLogin) {
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname || '/')}`;
      router.push(loginUrl);
      return;
    }

    if (authState.needsRedirect) {
      const redirectUrl = redirectTo || '/my-boards';
      router.push(redirectUrl);
      return;
    }
  }, [authState, router, pathname, redirectTo]);

  // Show loading while checking authentication
  if (authState.isLoading) {
    return <>{fallback}</>;
  }

  // Don't render children if not authorized
  if (!authState.shouldShow) {
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
