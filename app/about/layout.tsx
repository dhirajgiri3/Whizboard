import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'About Us | Whizboard - Revolutionizing Team Collaboration',
  description: 'Learn about Whizboard\'s mission to transform chaotic brainstorms into organized action plans. Discover our story, values, and commitment to empowering modern teams with professional-grade collaborative tools.',
  keywords: [
    'about whizboard',
    'team collaboration',
    'company story',
    'mission',
    'values',
    'collaborative whiteboard',
    'remote work solutions',
    'team productivity',
    'brainstorming tools',
    'digital workspace'
  ],
  openGraph: {
    title: 'About Us | Whizboard - Revolutionizing Team Collaboration',
    description: 'Learn about Whizboard\'s mission to transform chaotic brainstorms into organized action plans with professional-grade collaborative tools.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-about.png',
        width: 1200,
        height: 630,
        alt: 'About Whizboard - Team Collaboration Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Whizboard - Revolutionizing Team Collaboration',
    description: 'Learn about Whizboard\'s mission to transform chaotic brainstorms into organized action plans with professional-grade collaborative tools.',
    images: ['/images/twitter-about.png'],
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
    canonical: 'https://whizboard.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
} 