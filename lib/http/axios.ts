import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Centralized Axios instance for the app
// - Sends credentials with same-origin requests
// - Defaults to JSON for non-FormData payloads
// - Surfaces server errors with response payloads

const api: AxiosInstance = axios.create({
  // Let axios infer baseURL from window location for client-side; SSR will use absolute/relative URLs
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
  // Treat only 2xx as success; axios throws for others which we handle explicitly
  validateStatus: (status: number) => status >= 200 && status < 300,
});

// Request interceptor: ensure JSON Content-Type unless FormData/body-less
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (!isFormData && config.data) {
    // Prefer AxiosHeaders#set when available to satisfy typings
    const hasHeader =
      // @ts-ignore - AxiosHeaders supports get
      config.headers?.get?.('Content-Type') ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config.headers as any)?.['Content-Type'];
    if (!hasHeader) {
      // @ts-ignore - set exists on AxiosHeaders
      if (config.headers?.set) config.headers.set('Content-Type', 'application/json');
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config.headers = ({ ...(config.headers as any), 'Content-Type': 'application/json' } as any);
      }
    }
  }
  return config;
});

// Response interceptor: pass through success, enrich errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Normalize the error message
    const message = error?.response?.data?.error || error?.message || 'Request failed';
    if (error?.response) {
      error.message = `${message}`;
    }
    return Promise.reject(error);
  }
);

export default api;

