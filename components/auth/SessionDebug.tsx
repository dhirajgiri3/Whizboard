'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('[SESSION DEBUG] Status:', status);
    console.log('[SESSION DEBUG] Session:', session);
    console.log('[SESSION DEBUG] User:', session?.user);
  }, [session, status]);

  // Only show in development or when explicitly enabled
  // Temporarily enabled for debugging production auth issues
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEBUG_SESSION && false) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      wordBreak: 'break-all'
    }}>
      <div><strong>Session Status:</strong> {status}</div>
      <div><strong>User ID:</strong> {session?.user?.id || 'none'}</div>
      <div><strong>Email:</strong> {session?.user?.email || 'none'}</div>
      <div><strong>Provider:</strong> {(session?.user as any)?.provider || 'none'}</div>
      <div><strong>Status:</strong> {(session?.user as any)?.status || 'none'}</div>
    </div>
  );
}
