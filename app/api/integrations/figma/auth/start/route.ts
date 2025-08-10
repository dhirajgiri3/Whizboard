import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { attachStateCookie, createOAuthState } from '@/lib/utils/oauthState';
import logger from '@/lib/logger/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  logger.info('Figma OAuth start route invoked');
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthenticated user attempted to start Figma OAuth');
    return NextResponse.redirect(new URL('/login', getAppBaseUrl()));
  }
  const state = createOAuthState();
  const redirectUri = `${getAppBaseUrl()}/api/integrations/figma/auth/callback`;
  const scopes = integrationsConfig.figma.scopes.join(' ');
  logger.info({ userEmail: session.user.email, redirectUri, scopes }, 'Starting Figma OAuth');
  const params = new URLSearchParams({
    client_id: integrationsConfig.figma.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  });
  const url = `https://www.figma.com/oauth?${params.toString()}`;
  const res = NextResponse.redirect(url);
  logger.debug({ userEmail: session.user.email }, 'Figma OAuth state cookie will be attached');
  return attachStateCookie(res, 'figma', state, session.user.email);
}


