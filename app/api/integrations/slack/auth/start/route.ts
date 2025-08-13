import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { attachStateCookie, createOAuthState } from '@/lib/utils/oauthState';
import '@/lib/env';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', getAppBaseUrl()));
  }

  const clientId = integrationsConfig.slack.clientId;
  const scopes = integrationsConfig.slack.scopes.join(',');
  const redirectUri = `${getAppBaseUrl()}/api/integrations/slack/auth/callback`;
  const state = createOAuthState();

  const url = new URL('https://slack.com/oauth/v2/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', scopes);
  url.searchParams.set('user_scope', '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  const res = NextResponse.redirect(url);
  return attachStateCookie(res, 'slack', state, session.user.email);
}


