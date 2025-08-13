import { NextRequest, NextResponse } from 'next/server';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { upsertToken } from '@/lib/integrations/tokenStore';
import { readAndClearStateCookie } from '@/lib/utils/oauthState';
import logger from '@/lib/logger/logger';
import axios from 'axios';
import '@/lib/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  logger.info({ hasCode: !!code, hasState: !!state }, 'Slack OAuth callback received');
  
  if (!code || !state) {
    logger.warn('Missing code or state in Slack OAuth callback');
    return NextResponse.redirect(new URL('/settings?integrations=slack&status=error', getAppBaseUrl()));
  }

  try {
    const res = NextResponse.next();
    const { stateCookie, emailFromCookie } = readAndClearStateCookie(request, res, 'slack');
    
    if (!stateCookie || stateCookie !== state || !emailFromCookie) {
      logger.warn({ 
        hasStateCookie: !!stateCookie, 
        stateMatch: stateCookie === state, 
        hasEmail: !!emailFromCookie 
      }, 'Invalid state or missing email in Slack OAuth callback');
      return NextResponse.redirect(new URL('/settings?integrations=slack&status=error', getAppBaseUrl()));
    }

    logger.info({ userEmail: emailFromCookie }, 'Processing Slack OAuth callback for user');

    const redirectUri = `${getAppBaseUrl()}/api/integrations/slack/auth/callback`;
    const tokenResp = await axios.post('https://slack.com/api/oauth.v2.access', new URLSearchParams({
      code: code!,
      client_id: integrationsConfig.slack.clientId,
      client_secret: integrationsConfig.slack.clientSecret,
      redirect_uri: redirectUri,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: false,
    });

    const tokenJson = tokenResp.data as any;
    if (!tokenJson.ok) {
      logger.error({ 
        userEmail: emailFromCookie, 
        slackError: tokenJson.error 
      }, 'Slack OAuth token exchange failed');
      return NextResponse.redirect(new URL('/settings?integrations=slack&status=error', getAppBaseUrl()));
    }

    const userEmail = emailFromCookie;
    const accessToken = tokenJson.access_token as string;
    const scope = tokenJson.scope as string;

    logger.info({ 
      userEmail, 
      hasAccessToken: !!accessToken, 
      scope 
    }, 'Slack OAuth token exchange successful, saving token');

    await upsertToken({
      userEmail,
      provider: 'slack',
      accessToken,
      scope,
    });

    logger.info({ userEmail }, 'Slack integration completed successfully');
    return NextResponse.redirect(new URL('/settings?integrations=slack&status=connected', getAppBaseUrl()));
  } catch (e) {
    logger.error({ error: e }, 'Exception occurred during Slack OAuth callback');
    return NextResponse.redirect(new URL('/settings?integrations=slack&status=error', getAppBaseUrl()));
  }
}


