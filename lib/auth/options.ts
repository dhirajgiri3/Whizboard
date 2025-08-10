import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/database/mongodb';
import { currentSecurityConfig } from '@/lib/config/security';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    } as any),
  ],
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  jwt: {
    maxAge: currentSecurityConfig.auth.jwtMaxAge,
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-testing',
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!(profile as any)?.email_verified) return false;
        (user as any).emailVerified = new Date();
        if (process.env.ALLOWED_DOMAINS && user.email) {
          const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
          const userDomain = user.email.split('@')[1];
          if (!allowedDomains.includes(userDomain)) return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        token.sub = (user as any).id;
        (token as any).emailVerified = (user as any).emailVerified;
        (token as any).provider = account.provider;
        (token as any).iat = Math.floor(Date.now() / 1000);
        (token as any).jti = crypto.randomUUID();
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...(session as any).user } as any;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && (token as any).sub) {
        (session.user as any).id = (token as any).sub;
        (session.user as any).emailVerified = (token as any).emailVerified;
        (session.user as any).provider = (token as any).provider;
        (session as any).security = {
          issuedAt: (token as any).iat,
          jwtId: (token as any).jti,
          lastUpdated: new Date().toISOString(),
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  events: {
    async signIn({ user, account }) {
      console.log(`[SECURITY] User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut({ session }) {
      console.log(`[SECURITY] User signed out: ${session?.user?.email}`);
    },
    async createUser({ user }) {
      console.log(`[SECURITY] New user created: ${user.email}`);
    },
    async linkAccount({ user, account }) {
      console.log(`[SECURITY] Account linked: ${user.email} to ${account?.provider}`);
    },
    async session({ session }) {
      console.log(`[SECURITY] Session accessed: ${session?.user?.email}`);
    },
  },
};

export default authOptions;


