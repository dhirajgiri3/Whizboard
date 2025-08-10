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
    client_id: integrationsConfig.googleDrive.clientId,
    redirect_uri: `${getAppBaseUrl()}/api/integrations/google-drive/auth/callback`,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: integrationsConfig.googleDrive.scopes.join(' '),
    state,
    include_granted_scopes: 'true',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  const res = NextResponse.redirect(url);
  return attachStateCookie(res, 'googleDrive', state, session.user.email);
}


