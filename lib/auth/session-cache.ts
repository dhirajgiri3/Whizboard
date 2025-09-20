// Session caching utility to reduce NextAuth overhead
import { getServerSession } from 'next-auth';
import { authOptions } from './options';
import { Session } from 'next-auth';

type CachedSession = {
  session: Session | null;
  timestamp: number;
};

const sessionCache = new Map<string, CachedSession>();
const CACHE_TTL = 60000; // 1 minute cache for sessions
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

/**
 * Get session with caching to reduce database hits
 * @param sessionToken - Optional session token for cache key
 * @returns Cached or fresh session
 */
export async function getCachedSession(sessionToken?: string): Promise<Session | null> {
  // Generate cache key (use token if available, otherwise use timestamp)
  const cacheKey = sessionToken || `session-${Date.now()}`;

  // Check cache first
  const cached = sessionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.session;
  }

  // Get fresh session
  const session = await getServerSession(authOptions);

  // Cache the session if we have a valid key
  if (sessionToken && session) {
    // Clean up old entries if cache is getting too large
    if (sessionCache.size >= MAX_CACHE_SIZE) {
      const oldestKeyValue = sessionCache.keys().next();
      if (!oldestKeyValue.done && oldestKeyValue.value) {
        sessionCache.delete(oldestKeyValue.value);
      }
    }

    sessionCache.set(cacheKey, {
      session,
      timestamp: Date.now()
    });
  }

  return session;
}

/**
 * Clear session cache for a specific user
 * @param userEmail - User email to clear cache for
 */
export function clearSessionCache(userEmail?: string): void {
  if (userEmail) {
    // Clear specific user's cache entries
    for (const [key, cached] of sessionCache.entries()) {
      if (cached.session?.user?.email === userEmail) {
        sessionCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    sessionCache.clear();
  }
}

/**
 * Get session with reduced logging overhead
 */
export async function getOptimizedSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions);
  } catch {
    // Silently fail for performance
    return null;
  }
}