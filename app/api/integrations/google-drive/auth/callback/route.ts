import { NextRequest, NextResponse } from 'next/server';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { upsertToken } from '@/lib/integrations/tokenStore';
import { readAndClearStateCookie } from '@/lib/utils/oauthState';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?integrations=googleDrive&status=error', getAppBaseUrl()));
  }

  try {
    const res = NextResponse.next();
    const { stateCookie, emailFromCookie } = readAndClearStateCookie(request, res, 'googleDrive');
    if (!stateCookie || stateCookie !== state || !emailFromCookie) {
      return NextResponse.redirect(new URL('/settings?integrations=googleDrive&status=error', getAppBaseUrl()));
    }
    const redirectUri = `${getAppBaseUrl()}/api/integrations/google-drive/auth/callback`;
    const tokenResp = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code: code!,
      client_id: integrationsConfig.googleDrive.clientId,
      client_secret: integrationsConfig.googleDrive.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: false,
    });
    const tokenJson = tokenResp.data as any;
    if (!tokenResp.status || tokenJson.error) {
      return NextResponse.redirect(new URL('/settings?integrations=googleDrive&status=error', getAppBaseUrl()));
    }

    const userEmail = emailFromCookie;
    const accessToken = tokenJson.access_token as string;
    const refreshToken = tokenJson.refresh_token as string | undefined;
    const expiresIn = tokenJson.expires_in as number | undefined;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    await upsertToken({
      userEmail,
      provider: 'googleDrive',
      accessToken,
      refreshToken,
      expiresAt,
      scope: Array.isArray(integrationsConfig.googleDrive.scopes) ? integrationsConfig.googleDrive.scopes.join(' ') : undefined,
    });

    return NextResponse.redirect(new URL('/settings?integrations=googleDrive&status=connected', getAppBaseUrl()));
  } catch (e) {
    return NextResponse.redirect(new URL('/settings?integrations=googleDrive&status=error', getAppBaseUrl()));
  }
}


