import { createYoga } from 'graphql-yoga';
import { schema, pubSub } from '@/lib/graphql/schema';
import { decode } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth/options';
import axios from 'axios';
import '@/lib/env';

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  context: async (context) => {
    // Get session from cookies for HTTP requests
    let session = null;
    
    try {
      // Only try to get cookies for HTTP requests, not WebSocket
      if (context.request && context.request.headers) {
        const cookieHeader = context.request.headers.get('cookie');
        console.log('Cookie header:', cookieHeader);
        
        if (cookieHeader) {
          // Parse cookie manually for session token
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          console.log('Parsed cookies:', Object.keys(cookies));
          
          // Try multiple possible session token cookie names
          const sessionToken = cookies['next-auth.session-token'] || 
                             cookies['__Secure-next-auth.session-token'] ||
                             cookies['next-auth.csrf-token'];
          console.log('Session token found:', !!sessionToken);
          
          if (sessionToken) {
            try {
              const token = await decode({
                token: sessionToken,
                secret: authOptions.secret!,
              });
              
              console.log('Decoded token:', !!token, token?.sub);
              
              if (token && token.sub) {
                session = {
                  user: {
                    id: token.sub,
                    name: token.name,
                    email: token.email,
                    image: token.picture,
                  },
                  expires: new Date((token.exp as number) * 1000).toISOString(),
                };
                console.log('Session created:', !!session, session?.user?.id);
              }
            } catch (decodeError) {
              console.error('Error decoding token:', decodeError);
              // If token decoding fails, try to get session from the session endpoint
              try {
              try {
                const { data: sessionData } = await axios.get(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/session`, {
                  headers: { cookie: cookieHeader as string },
                  withCredentials: true,
                  validateStatus: () => true,
                });
                if (sessionData?.user?.id) {
                  session = sessionData;
                  console.log('Session retrieved from session endpoint:', !!session, session?.user?.id);
                }
              } catch {}
              } catch (sessionError) {
                console.error('Error fetching session:', sessionError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in GraphQL context:', error);
    }

    return {
      ...context,
      pubSub,
      session,
    };
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://whizboard.cyperstudio.in'] 
      : ['http://localhost:3000'],
    credentials: true,
  },
  // Disable GraphiQL in production
  graphiql: process.env.NODE_ENV !== 'production',
});

export async function GET(request: Request) {
  return yoga.fetch(request);
}

export async function POST(request: Request) {
  return yoga.fetch(request);
}

export async function OPTIONS(request: Request) {
  return yoga.fetch(request);
}
