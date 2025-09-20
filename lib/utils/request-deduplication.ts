// Request deduplication utility to prevent multiple identical API calls
type PendingRequest = {
  promise: Promise<any>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest>();
const DEDUP_WINDOW = 1000; // 1 second deduplication window

/**
 * Deduplicates identical requests within a time window
 * @param key - Unique key for the request (e.g., URL + params)
 * @param requestFn - Function that makes the actual request
 * @returns Promise that resolves with the response
 */
export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  // Check if we have a pending request for this key
  const pending = pendingRequests.get(key);

  if (pending && (now - pending.timestamp) < DEDUP_WINDOW) {
    // Return the existing promise
    return pending.promise;
  }

  // Create new request
  const promise = requestFn().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key);
  });

  // Store the pending request
  pendingRequests.set(key, { promise, timestamp: now });

  return promise;
}

/**
 * Creates a deduplicated fetch function
 * @param baseUrl - Base URL for requests
 * @returns Fetch function with deduplication
 */
export function createDedupedFetch(baseUrl: string = '') {
  return async function dedupedFetch(
    url: string,
    options?: RequestInit
  ): Promise<Response> {
    const fullUrl = baseUrl + url;
    const method = options?.method || 'GET';
    const key = `${method}:${fullUrl}:${JSON.stringify(options?.body || '')}`;

    return deduplicateRequest(key, () => fetch(fullUrl, options));
  };
}

/**
 * Creates a deduplicated API call hook
 */
export function useDedupedApi() {
  const fetch = createDedupedFetch('/api');

  return {
    get: (url: string) => deduplicateRequest(`GET:${url}`, () =>
      fetch(url).then(res => res.json())
    ),
    post: (url: string, data: any) => deduplicateRequest(`POST:${url}:${JSON.stringify(data)}`, () =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
    ),
    put: (url: string, data: any) => deduplicateRequest(`PUT:${url}:${JSON.stringify(data)}`, () =>
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
    )
  };
}