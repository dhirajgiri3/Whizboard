import { NextRequest, NextResponse } from 'next/server';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { upsertToken } from '@/lib/integrations/tokenStore';
import { readAndClearStateCookie } from '@/lib/utils/oauthState';

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
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: integrationsConfig.googleDrive.clientId,
        client_secret: integrationsConfig.googleDrive.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok || tokenJson.error) {
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


