import { createYoga } from 'graphql-yoga';
import { schema, pubSub } from '@/lib/graphql/schema';
import { decode } from 'next-auth/jwt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
        if (cookieHeader) {
          // Parse cookie manually for session token
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          const sessionToken = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'];
          
          if (sessionToken) {
            const token = await decode({
              token: sessionToken,
              secret: authOptions.secret!,
            });
            
            if (token) {
              session = {
                user: {
                  id: token.sub,
                  name: token.name,
                  email: token.email,
                  image: token.picture,
                },
                expires: new Date((token.exp as number) * 1000).toISOString(),
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('Error decoding session:', error);
    }

    return {
      ...context,
      pubSub,
      session,
    };
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    credentials: true,
  },
  // Disable GraphiQL in production
  graphiql: process.env.NODE_ENV !== 'production',
});

export { yoga as GET, yoga as POST, yoga as OPTIONS };
