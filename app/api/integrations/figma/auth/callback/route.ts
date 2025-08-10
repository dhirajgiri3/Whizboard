import { NextRequest, NextResponse } from 'next/server';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { upsertToken } from '@/lib/integrations/tokenStore';
import { readAndClearStateCookie } from '@/lib/utils/oauthState';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
  }

  try {
    const res = NextResponse.next();
    const { stateCookie, emailFromCookie } = readAndClearStateCookie(request, res, 'figma');
    if (!stateCookie || stateCookie !== state || !emailFromCookie) {
      return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
    }
    const redirectUri = `${getAppBaseUrl()}/api/integrations/figma/auth/callback`;
    const tokenResp = await fetch('https://www.figma.com/api/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: integrationsConfig.figma.clientId,
        client_secret: integrationsConfig.figma.clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });
    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok || tokenJson.error) {
      return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
    }

    const userEmail = emailFromCookie;
    const accessToken = tokenJson.access_token as string;
    const scope = Array.isArray(integrationsConfig.figma.scopes) ? integrationsConfig.figma.scopes.join(' ') : undefined;

    await upsertToken({
      userEmail,
      provider: 'figma',
      accessToken,
      scope,
    });

    return NextResponse.redirect(new URL('/settings?integrations=figma&status=connected', getAppBaseUrl()));
  } catch (e) {
    return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
  }
}


