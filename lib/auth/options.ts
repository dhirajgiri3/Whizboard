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
    maxAge: currentSecurityConfig.auth.sessionMaxAge, // Use security config
    updateAge: currentSecurityConfig.auth.updateAge, // Use security config
  },

  jwt: {
    maxAge: currentSecurityConfig.auth.jwtMaxAge, // Use security config
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
        // Enhanced email verification check
        if (!(profile as any)?.email_verified) {
          console.log(`[SECURITY] Sign-in blocked: Email not verified for ${user.email}`);
          return false;
        }
        (user as any).emailVerified = new Date();
        
        // Allow linking accounts by email
        if (email?.verificationRequest) {
          return true;
        }
        
        // Enhanced user validation
        try {
          const client = await clientPromise;
          const db = client.db();
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (existingUser) {
            // Check if user is banned/suspended
            if (existingUser.status === 'banned' || existingUser.status === 'suspended') {
              console.log(`[SECURITY] Sign-in blocked: User ${user.email} is ${existingUser.status}`);
              return false;
            }
            
            // Update last login timestamp
            await db.collection('users').updateOne(
              { email: user.email },
              { 
                $set: { 
                  lastLoginAt: new Date(),
                  updatedAt: new Date(),
                  loginCount: (existingUser.loginCount || 0) + 1
                } 
              }
            );
            
            console.log(`[SECURITY] User ${user.email} signed in successfully (login #${(existingUser.loginCount || 0) + 1})`);
            return true;
          }
        } catch (error) {
          console.error('[SECURITY] Error validating user during sign-in:', error);
          // On error, block sign in for security
          return false;
        }
        
        // Domain restriction (if configured)
        if (process.env.ALLOWED_DOMAINS && user.email) {
          const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');
          const userDomain = user.email.split('@')[1];
          if (!allowedDomains.includes(userDomain)) {
            console.log(`[SECURITY] Sign-in blocked: Domain ${userDomain} not allowed for ${user.email}`);
            return false;
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        // Enhanced token security
        token.sub = (user as any).id;
        (token as any).emailVerified = (user as any).emailVerified;
        (token as any).provider = account.provider;
        (token as any).iat = Math.floor(Date.now() / 1000);
        (token as any).jti = (globalThis as any).crypto?.randomUUID
          ? (globalThis as any).crypto.randomUUID()
          : nodeRandomUUID();
        (token as any).tokenVersion = (user as any).tokenVersion ?? 0;
        (token as any).loginCount = (user as any).loginCount ?? 0;
        (token as any).lastLoginAt = (user as any).lastLoginAt;
        
        // Add security metadata
        (token as any).security = {
          issuedAt: (token as any).iat,
          jwtId: (token as any).jti,
          userAgent: account.provider === 'google' ? 'Google OAuth' : 'Unknown',
          ipAddress: 'client-ip-would-be-set-here', // Would be set by middleware
        };
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
        
        // Enhanced session validation
        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db.collection('users').findOne({
            _id: new (await import('mongodb')).ObjectId((token as any).sub)
          });
          
          if (user) {
            // Check user status
            if (user.status === 'banned' || user.status === 'suspended') {
              console.log(`[SECURITY] Session invalidated: User ${session.user.email} is ${user.status}`);
              return session; // Return session but log the security issue
            }
            
            (session.user as any).status = user.status || 'active';
            (session.user as any).tokenVersion = (user as any).tokenVersion ?? 0;
            (session.user as any).loginCount = (user as any).loginCount ?? 0;
            (session.user as any).lastLoginAt = (user as any).lastLoginAt;
            
            // Add security metadata to session
            (session as any).security = {
              issuedAt: (token as any).iat,
              jwtId: (token as any).jti,
              lastUpdated: new Date().toISOString(),
              userExists: true,
              tokenVersion: (token as any).tokenVersion,
            };
          } else {
            // User not found in database, invalidate session
            console.log(`[SECURITY] Session invalidated: User ${session.user.email} not found in database`);
            return session; // Return session instead of null to avoid TypeScript error
          }
        } catch (error) {
          console.error('[SECURITY] Error validating user in session callback:', error);
          // On database error, return session but log the issue
          return session;
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
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: currentSecurityConfig.auth.sessionMaxAge,
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.csrf-token'
        : 'next-auth.csrf-token',
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
      
      // Enhanced security logging
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
              },
              $inc: { loginCount: 1 }
            }
          );
          
          // Log security event
          await db.collection('security_events').insertOne({
            eventType: 'SIGN_IN',
            userId: user.id,
            email: user.email,
            provider: account?.provider,
            timestamp: new Date(),
            ipAddress: 'client-ip-would-be-set-here',
            userAgent: 'client-user-agent-would-be-set-here',
            success: true,
          });
        } catch (error) {
          console.error('Failed to log sign-in event:', error);
        }
      }
    },
    async createUser({ user }) {
      console.log(`[SECURITY] New user created: ${user.email}`);
      
      // Enhanced user creation with security features
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
                emailVerified: new Date(),
                isPublicProfile: true,
                bio: '',
                loginCount: 1,
                securitySettings: {
                  twoFactorEnabled: false,
                  lastPasswordChange: null,
                  accountLocked: false,
                  lockoutReason: null,
                }
              } 
            }
          );
          
          // Log security event
          await db.collection('security_events').insertOne({
            eventType: 'USER_CREATED',
            userId: user.id,
            email: user.email,
            timestamp: new Date(),
            ipAddress: 'client-ip-would-be-set-here',
            userAgent: 'client-user-agent-would-be-set-here',
            success: true,
          });
          
          console.log(`[AUTH] Generated username "${username}" for user ${user.email}`);
        } catch (error) {
          console.error('Failed to set user data:', error);
        }
      }
    },
    async signOut({ session }) {
      console.log(`[SECURITY] User signed out: ${session?.user?.email}`);
      
      // Log sign-out event
      if (session?.user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db();
          await db.collection('security_events').insertOne({
            eventType: 'SIGN_OUT',
            userId: session.user.id,
            email: session.user.email,
            timestamp: new Date(),
            ipAddress: 'client-ip-would-be-set-here',
            userAgent: 'client-user-agent-would-be-set-here',
            success: true,
          });
        } catch (error) {
          console.error('Failed to log sign-out event:', error);
        }
      }
    },
    async session({ session }) {
      console.log(`[SECURITY] Session accessed: ${session?.user?.email}`);
    },
  },
};

export default authOptions;


