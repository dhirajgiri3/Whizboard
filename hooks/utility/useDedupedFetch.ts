import { useCallback, useRef } from 'react';

// Request deduplication for React components
const pendingRequests = new Map<string, Promise<any>>();

export function useDedupedFetch() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const dedupedFetch = useCallback(async (url: string, options?: RequestInit) => {
    // Create cache key
    const method = options?.method || 'GET';
    const cacheKey = `${method}:${url}:${JSON.stringify(options?.body || '')}`;

    // Check if request is already pending
    const existingRequest = pendingRequests.get(cacheKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Create the request promise
    const requestPromise = fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => {
      // Clean up when request completes
      pendingRequests.delete(cacheKey);
    });

    // Store the pending request
    pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }, []);

  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    pendingRequests.clear();
  }, []);

  return {
    dedupedFetch,
    cancelPendingRequests,
  };
}

// Hook specifically for API calls
export function useDedupedApi() {
  const { dedupedFetch } = useDedupedFetch();

  const get = useCallback(async (endpoint: string) => {
    const response = await dedupedFetch(`/api${endpoint}`);
    return response.json();
  }, [dedupedFetch]);

  const post = useCallback(async (endpoint: string, data: any) => {
    const response = await dedupedFetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }, [dedupedFetch]);

  const put = useCallback(async (endpoint: string, data: any) => {
    const response = await dedupedFetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }, [dedupedFetch]);

  return { get, post, put };
}