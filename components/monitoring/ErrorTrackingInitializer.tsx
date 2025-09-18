'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { initErrorTracking, setUserContext } from '@/lib/utils/error-tracking';

/**
 * Component that initializes error tracking when the app loads
 * This is a client-side component that should be mounted once at the app root
 */
const ErrorTrackingInitializer = (): null => {
  const { data: session } = useSession();
  
  useEffect(() => {
    // Initialize error tracking with appropriate configuration
    initErrorTracking({
      enabled: true,
      captureUnhandledErrors: true,
      captureUnhandledRejections: true,
      captureConsoleErrors: true,
      sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0, // Sample 50% in production, 100% in dev
      endpoint: '/api/monitoring/errors',
      environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
    });
    
    // Set up user context if user is logged in
    if (session?.user) {
      setUserContext(
        session.user.id as string,
        session.user.name || undefined
      );
    }
  }, [session]);
  
  // This component doesn't render anything
  return null;
};

export default ErrorTrackingInitializer;
