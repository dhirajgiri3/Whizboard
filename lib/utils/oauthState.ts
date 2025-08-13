import crypto from 'crypto';
import '@/lib/env';
import { NextResponse, NextRequest } from 'next/server';
import { getAppBaseUrl } from '@/lib/config/integrations';
import logger from '@/lib/logger/logger';

function getCookieName(provider: 'slack' | 'googleDrive') {
  return `oauth_state_${provider}`;
}

export function createOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function attachStateCookie(
  res: NextResponse,
  provider: 'slack' | 'googleDrive',
  state: string,
  userEmail: string
): NextResponse {
  const value = `${state}|${encodeURIComponent(userEmail)}`;
  const baseUrl = getAppBaseUrl();
  const isHttps = /^https:\/\//i.test(baseUrl);
  const isSecure = isHttps || process.env.NODE_ENV === 'production';
  const cookieName = getCookieName(provider);
  
  logger.debug({ 
    provider, 
    isHttps, 
    isSecure, 
    baseUrl, 
    hasEmail: !!userEmail,
    cookieName,
    stateLength: state.length,
    valueLength: value.length
  }, 'Attaching OAuth state cookie');
  
  res.cookies.set(cookieName, value, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  });
  
  logger.info({ provider, cookieName, userEmail: '[REDACTED]' }, 'OAuth state cookie attached successfully');
  return res;
}

export function readAndClearStateCookie(
  req: NextRequest,
  res: NextResponse,
  provider: 'slack' | 'googleDrive'
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


