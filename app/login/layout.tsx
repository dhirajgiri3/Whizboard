import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Whizboard - Access Your Collaborative Workspace',
  description: 'Sign in to your Whizboard account to access your collaborative whiteboards, team workspaces, and real-time collaboration tools. Secure login with multiple authentication options.',
  keywords: [
    'login',
    'sign in',
    'authentication',
    'user account',
    'access workspace',
    'secure login',
    'whizboard login',
    'team access',
    'account access',
    'user portal'
  ],
  openGraph: {
    title: 'Login | Whizboard - Access Your Collaborative Workspace',
    description: 'Sign in to your Whizboard account to access your collaborative whiteboards and team workspaces.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-login.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Login - Access Your Workspace',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login | Whizboard - Access Your Collaborative Workspace',
    description: 'Sign in to your Whizboard account to access your collaborative whiteboards and team workspaces.',
    images: ['/images/twitter-login.png'],
  },
  robots: {
    index: false, // Login pages shouldn't be indexed
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/login',
  },
};

// Avoid nesting SessionProviders; the app root already provides one
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}