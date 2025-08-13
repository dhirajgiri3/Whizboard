import type { Metadata } from 'next';
import Footer from '@/components/layout/footer/Footer';
import SmoothScrollProvider from '@/components/landing/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'Help Center | Whizboard - Documentation, Tutorials & Support',
  description: 'Find answers to your questions, learn new features, and master Whizboard with our comprehensive documentation, tutorials, and support resources.',
  keywords: [
    'help',
    'documentation',
    'tutorials',
    'support',
    'whizboard help',
    'collaboration tools',
    'brainstorming',
    'troubleshooting',
    'how to use whizboard',
    'getting started',
    'user guide'
  ],
  openGraph: {
    title: 'Help Center | Whizboard - Documentation, Tutorials & Support',
    description: 'Find answers to your questions, learn new features, and master Whizboard with our comprehensive documentation, tutorials, and support resources.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/og-help.jpg',
        width: 1200,
        height: 630,
        alt: 'Whizboard Help Center - Documentation and Support',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Help Center | Whizboard - Documentation, Tutorials & Support',
    description: 'Find answers to your questions, learn new features, and master Whizboard with our comprehensive documentation, tutorials, and support resources.',
    images: ['/og-help.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/help',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      {children}
      <Footer />
    </SmoothScrollProvider>
  );
}