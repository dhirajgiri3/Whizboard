import crypto from 'crypto';
import { NextResponse, NextRequest } from 'next/server';
import { getAppBaseUrl } from '@/lib/config/integrations';
import logger from '@/lib/logger/logger';

function getCookieName(provider: 'slack' | 'googleDrive' | 'figma') {
  return `oauth_state_${provider}`;
}

export function createOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function attachStateCookie(
  res: NextResponse,
  provider: 'slack' | 'googleDrive' | 'figma',
  state: string,
  userEmail: string
): NextResponse {
  const value = `${state}|${encodeURIComponent(userEmail)}`;
  const baseUrl = getAppBaseUrl();
  const isHttps = /^https:\/\//i.test(baseUrl);
  const isSecure = isHttps || process.env.NODE_ENV === 'production';
  logger.debug({ provider, isHttps, isSecure, baseUrl, hasEmail: !!userEmail }, 'Attaching OAuth state cookie');
  res.cookies.set(getCookieName(provider), value, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });
  return res;
}

export function readAndClearStateCookie(
  req: NextRequest,
  res: NextResponse,
  provider: 'slack' | 'googleDrive' | 'figma'
): { stateCookie?: string; emailFromCookie?: string } {
  const cookie = req.cookies.get(getCookieName(provider));
  logger.debug({ provider, hasCookie: !!cookie?.value }, 'Reading OAuth state cookie');
  if (cookie?.value) {
    const [stateCookie, email] = cookie.value.split('|');
    const baseUrl = getAppBaseUrl();
    const isHttps = /^https:\/\//i.test(baseUrl);
    const isSecure = isHttps || process.env.NODE_ENV === 'production';
    logger.debug({ provider, isHttps, isSecure, baseUrl }, 'Clearing OAuth state cookie');
    res.cookies.set(getCookieName(provider), '', { httpOnly: true, secure: isSecure, sameSite: 'lax', path: '/', maxAge: 0 });
    return { stateCookie, emailFromCookie: email ? decodeURIComponent(email) : undefined };
  }
  return {};
}


