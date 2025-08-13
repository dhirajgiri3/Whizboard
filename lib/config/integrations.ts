import '@/lib/env';

function resolveBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  // If value already starts with http(s), return as-is
  if (/^https?:\/\//i.test(fromEnv)) return fromEnv;
  // VERCEL_URL is host without protocol; prefix with https
  return `https://${fromEnv}`;
}

export const integrationsConfig = {
  appBaseUrl: resolveBaseUrl(),

  slack: {
    clientId: process.env.SLACK_CLIENT_ID || '',
    clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    // comma-separated in env
    scopes: (process.env.SLACK_SCOPES || 'chat:write,channels:read,channels:join,commands,links:read,links:write,files:write')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
    // space-separated for Google
    scopes: (process.env.GOOGLE_DRIVE_SCOPES || 'https://www.googleapis.com/auth/drive.file')
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean),
  },


};

export function getAppBaseUrl(): string {
  return integrationsConfig.appBaseUrl;
}


