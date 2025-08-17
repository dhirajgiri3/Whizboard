import { AuthOptions } from 'next-auth';
import { randomUUID as nodeRandomUUID } from 'crypto';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/database/mongodb';
import { currentSecurityConfig } from '@/lib/config/security';
import { generateUniqueUsername } from '@/lib/utils/usernameGenerator';
import '@/lib/env';

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
        (token as any).jti = (globalThis as any).crypto?.randomUUID
          ? (globalThis as any).crypto.randomUUID()
          : nodeRandomUUID();
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
        // Add basic user info from token to session
        (session.user as any).id = (token as any).sub;
        (session.user as any).emailVerified = (token as any).emailVerified;
        (session.user as any).provider = (token as any).provider;
        
        // Only validate user in database if we're not in a loading state
        // This prevents infinite loading issues
        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection('users').findOne({
            _id: new (await import('mongodb')).ObjectId((token as any).sub)
          });
          
          if (user) {
            (session.user as any).status = user.status || 'active';
            (session.user as any).tokenVersion = (user as any).tokenVersion ?? 0;
          } else {
            // User not found in database, but don't invalidate session immediately
            // This could happen during the initial sign-in process
            console.log(`[AUTH] User ${session.user.email} not found in database yet, allowing session`);
            (session.user as any).status = 'active';
            (session.user as any).tokenVersion = 0;
          }
        } catch (error) {
          console.error('[AUTH] Error validating user in session callback:', error);
          // On database error, still allow session but with basic info
          (session.user as any).status = 'active';
          (session.user as any).tokenVersion = 0;
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
  
  // Ensure proper URL configuration for production
  ...(process.env.NODE_ENV === 'production' && {
    url: 'https://whizboard.cyperstudio.in',
  }),

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
    async createUser({ user }) {
      console.log(`[SECURITY] New user created: ${user.email}`);
      
      // Set createdAt timestamp and generate username for new users
      if (user.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          
          // Generate unique username
          const username = await generateUniqueUsername(user.email, user.name || undefined);
          
          await db.collection('users').updateOne(
            { email: user.email },
            { 
              $set: { 
                createdAt: new Date(),
                lastLoginAt: new Date(),
                updatedAt: new Date(),
                status: 'active',
                tokenVersion: 0,
                username: username,
                emailVerified: new Date(), // Auto-verify email for Google OAuth
                isPublicProfile: true, // Default to public profile
                bio: '', // Initialize empty bio
              } 
            }
          );
          
          console.log(`[AUTH] Generated username "${username}" for user ${user.email}`);
        } catch (error) {
          console.error('Failed to set user data:', error);
        }
      }
    },
    async signOut({ session }) {
      console.log(`[SECURITY] User signed out: ${session?.user?.email}`);
    },
    // Note: linkAccount is already handled above
    async session({ session }) {
      console.log(`[SECURITY] Session accessed: ${session?.user?.email}`);
    },
  },
};

export default authOptions;


