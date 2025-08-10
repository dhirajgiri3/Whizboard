import crypto from 'crypto';
import { NextResponse, NextRequest } from 'next/server';

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
  res.cookies.set(getCookieName(provider), value, {
    httpOnly: true,
    secure: true,
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
  if (cookie?.value) {
    const [stateCookie, email] = cookie.value.split('|');
    res.cookies.set(getCookieName(provider), '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return { stateCookie, emailFromCookie: email ? decodeURIComponent(email) : undefined };
  }
  return {};
}


