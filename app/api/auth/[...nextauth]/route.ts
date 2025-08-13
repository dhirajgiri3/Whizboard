import NextAuth from 'next-auth';
import authOptions from '@/lib/auth/options';

// Ensure this route uses the Node.js runtime (not Edge), since it relies on the MongoDB adapter
export const runtime = 'nodejs';

// Enhanced security configuration
const handler = NextAuth(authOptions);

// Add custom error handling
const customHandler = async (req: Request, context: any) => {
  try {
    return await handler(req, context);
  } catch (error: any) {
    console.error('NextAuth error:', error);
    
    // Log additional details for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    
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
    
    // Re-throw other errors
    throw error;
  }
};

export { customHandler as GET, customHandler as POST }; 