import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { integrationsConfig, getAppBaseUrl } from '@/lib/config/integrations';
import { attachStateCookie, createOAuthState } from '@/lib/utils/oauthState';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', getAppBaseUrl()));
  }
  const state = createOAuthState();
  const params = new URLSearchParams({
    client_id: integrationsConfig.figma.clientId,
    redirect_uri: `${getAppBaseUrl()}/api/integrations/figma/auth/callback`,
    response_type: 'code',
    scope: integrationsConfig.figma.scopes.join(' '),
    state,
  });
  const url = `https://www.figma.com/oauth?${params.toString()}`;
  const res = NextResponse.redirect(url);
  return attachStateCookie(res, 'figma', state, session.user.email);
}


