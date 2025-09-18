import NextAuth from 'next-auth';
import authOptions from '@/lib/auth/options';

// Ensure this route uses the Node.js runtime (not Edge), since it relies on the MongoDB adapter
export const runtime = 'nodejs';

// Enhanced security configuration
const handler = NextAuth(authOptions);

// Add custom error handling
const customHandler = async (req: Request, context: { params: Promise<{ nextauth: string[] }> }) => {
  try {
    const resolvedContext = { params: await context.params };
    return await handler(req, resolvedContext);
  } catch (error) {
     if (error instanceof Error) {
      console.error('NextAuth error:', error);
    
      // Handle OAuthAccountNotLinked error
      if (error.message?.includes('OAuthAccountNotLinked')) {
        const url = new URL(req.url);
        url.pathname = '/auth/error';
        url.searchParams.set('error', 'OAuthAccountNotLinked');
        return Response.redirect(url);
      }
      
      // Handle callback errors
      if (error.message?.includes('Callback') || error.message?.includes('callback')) {
        const url = new URL(req.url);
        url.pathname = '/auth/error';
        url.searchParams.set('error', 'Callback');
        return Response.redirect(url);
      }
    }
    
    // Re-throw other errors
    throw error;
  }
};

export { customHandler as GET, customHandler as POST }; 