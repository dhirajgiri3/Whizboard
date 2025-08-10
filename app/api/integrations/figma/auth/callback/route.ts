import { NextRequest, NextResponse } from 'next/server';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { upsertToken } from '@/lib/integrations/tokenStore';
import { readAndClearStateCookie } from '@/lib/utils/oauthState';
import logger from '@/lib/logger/logger';
import axios from 'axios';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  logger.info('Figma OAuth callback route invoked');
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  logger.info({ hasCode: !!code, hasState: !!state }, 'Figma OAuth callback received');
  if (!code || !state) {
    logger.warn('Missing code or state in Figma OAuth callback');
    return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
  }

  try {
    const res = NextResponse.next();
    const { stateCookie, emailFromCookie } = readAndClearStateCookie(request, res, 'figma');
    if (!stateCookie || stateCookie !== state || !emailFromCookie) {
      logger.warn({ 
        hasStateCookie: !!stateCookie, 
        stateMatch: stateCookie === state, 
        hasEmail: !!emailFromCookie 
      }, 'Invalid state or missing email in Figma OAuth callback');
      return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
    }
    const redirectUri = `${getAppBaseUrl()}/api/integrations/figma/auth/callback`;
    logger.info({ userEmail: emailFromCookie, redirectUri }, 'Exchanging Figma authorization code for token');
    const tokenResp = await axios.post('https://www.figma.com/api/oauth/token', new URLSearchParams({
      client_id: integrationsConfig.figma.clientId,
      client_secret: integrationsConfig.figma.clientSecret,
      redirect_uri: redirectUri,
      code: code!,
      grant_type: 'authorization_code',
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: false,
    });
    const tokenJson = tokenResp.data as any;
    if (!tokenResp.status || (tokenJson as any).error) {
      logger.error({ 
        userEmail: emailFromCookie, 
        figmaError: (tokenJson as any).error,
        status: tokenResp.status 
      }, 'Figma OAuth token exchange failed');
      return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
    }

    const userEmail = emailFromCookie;
    const accessToken = tokenJson.access_token as string;
    const scope = Array.isArray(integrationsConfig.figma.scopes) ? integrationsConfig.figma.scopes.join(' ') : undefined;

    logger.info({ userEmail, hasAccessToken: !!accessToken, scope }, 'Figma OAuth token exchange successful, saving token');
    await upsertToken({
      userEmail,
      provider: 'figma',
      accessToken,
      scope,
    });

    logger.info({ userEmail }, 'Figma integration completed successfully');
    return NextResponse.redirect(new URL('/settings?integrations=figma&status=connected', getAppBaseUrl()));
  } catch (e) {
    logger.error({ error: e }, 'Exception occurred during Figma OAuth callback');
    return NextResponse.redirect(new URL('/settings?integrations=figma&status=error', getAppBaseUrl()));
  }
}


