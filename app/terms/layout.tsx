
import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'Terms of Service | Whizboard - User Agreement & Service Terms',
  description: 'Read Whizboard\'s terms of service and user agreement. Understand your rights and responsibilities when using our collaborative whiteboard platform and professional-grade tools.',
  keywords: [
    'terms of service',
    'user agreement',
    'service terms',
    'terms and conditions',
    'legal agreement',
    'user rights',
    'service usage',
    'whizboard terms',
    'platform rules',
    'acceptable use'
  ],
  openGraph: {
    title: 'Terms of Service | Whizboard - User Agreement & Service Terms',
    description: 'Read Whizboard\'s terms of service and user agreement for our collaborative whiteboard platform.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-terms.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Terms of Service - User Agreement',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | Whizboard - User Agreement & Service Terms',
    description: 'Read Whizboard\'s terms of service and user agreement for our collaborative whiteboard platform.',
    images: ['/images/twitter-terms.png'],
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
    canonical: 'https://whizboard.com/terms',
  },
};

export default function TermsLayout({
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