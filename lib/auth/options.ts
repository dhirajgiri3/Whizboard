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
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
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
    async signIn({ user, account, profile, email }) {
      if (account?.provider === 'google') {
        if (!(profile as any)?.email_verified) return false;
        (user as any).emailVerified = new Date();
        
        // Allow linking accounts by email
        if (email?.verificationRequest) {
          return true;
        }
        
        // Check if user already exists in database
        try {
          const client = await clientPromise;
          const db = client.db();
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (existingUser) {
            // User exists, allow sign in
            console.log(`[AUTH] User ${user.email} already exists, allowing sign in`);
            return true;
          }
        } catch (error) {
          console.error('[AUTH] Error checking existing user:', error);
          // On error, allow sign in
          return true;
        }
        
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
        // Initialize tokenVersion used for session invalidation
        (token as any).tokenVersion = (user as any).tokenVersion ?? 0;
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...(session as any).user } as any;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && (token as any).sub) {
        // Validate user still exists in database
        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection('users').findOne({
            _id: new (await import('mongodb')).ObjectId((token as any).sub)
          });
          
          // If user doesn't exist in database, invalidate session
          if (!user) {
            console.log(`[SECURITY] User ${session.user.email} not found in database, invalidating session`);
            return null; // This will force logout
          }
          
          // Check if user is active/not banned
          if (user.status === 'banned' || user.status === 'suspended') {
            console.log(`[SECURITY] User ${session.user.email} is ${user.status}, invalidating session`);
            return null; // This will force logout
          }

          // Invalidate session if tokenVersion has changed
          const tokenVersionFromDb = (user as any).tokenVersion ?? 0;
          if (typeof (token as any).tokenVersion === 'number' && (token as any).tokenVersion < tokenVersionFromDb) {
            console.log(`[SECURITY] Token version outdated for ${session.user.email}, invalidating session`);
            return null;
          }
          
          (session.user as any).id = (token as any).sub;
          (session.user as any).emailVerified = (token as any).emailVerified;
          (session.user as any).provider = (token as any).provider;
          (session.user as any).status = user.status || 'active';
          (session.user as any).tokenVersion = (token as any).tokenVersion ?? 0;
          (session as any).security = {
            issuedAt: (token as any).iat,
            jwtId: (token as any).jti,
            lastUpdated: new Date().toISOString(),
            userExists: true,
          };
        } catch (error) {
          console.error('[SECURITY] Error validating user in session callback:', error);
          // On database error, allow session but log the issue
          (session.user as any).id = (token as any).sub;
          (session.user as any).emailVerified = (token as any).emailVerified;
          (session.user as any).provider = (token as any).provider;
          (session as any).security = {
            issuedAt: (token as any).iat,
            jwtId: (token as any).jti,
            lastUpdated: new Date().toISOString(),
            userExists: 'unknown',
          };
        }
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
      
      // Update lastLoginAt timestamp
      if (user.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                lastLoginAt: new Date(),
                updatedAt: new Date()
              } 
            }
          );
        } catch (error) {
          console.error('Failed to update lastLoginAt:', error);
        }
      }
    },
    async linkAccount({ user, account }) {
      console.log(`[SECURITY] Account linked: ${user.email} to ${account?.provider}`);
    },
    async createUser({ user }) {
      console.log(`[SECURITY] New user created: ${user.email}`);
      
      // Set createdAt timestamp for new users
      if (user.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                createdAt: new Date(),
                lastLoginAt: new Date(),
                updatedAt: new Date(),
                status: 'active',
                tokenVersion: 0
              } 
            }
          );
        } catch (error) {
          console.error('Failed to set createdAt:', error);
        }
      }
    },
    async signOut({ session }) {
      console.log(`[SECURITY] User signed out: ${session?.user?.email}`);
    },
    async createUser({ user }) {
      console.log(`[SECURITY] New user created: ${user.email}`);
      
      // Set createdAt timestamp for new users
      if (user.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                createdAt: new Date(),
                lastLoginAt: new Date(),
                updatedAt: new Date()
              } 
            }
          );
        } catch (error) {
          console.error('Failed to set createdAt:', error);
        }
      }
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


