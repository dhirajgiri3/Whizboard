
import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'Privacy Policy | Whizboard - Your Data Protection & Privacy Rights',
  description: 'Learn how Whizboard protects your privacy and handles your data. Our comprehensive privacy policy covers data collection, usage, storage, and your rights regarding personal information.',
  keywords: [
    'privacy policy',
    'data protection',
    'privacy rights',
    'data security',
    'GDPR compliance',
    'personal information',
    'data collection',
    'user privacy',
    'whizboard privacy',
    'data handling'
  ],
  openGraph: {
    title: 'Privacy Policy | Whizboard - Your Data Protection & Privacy Rights',
    description: 'Learn how Whizboard protects your privacy and handles your data with enterprise-grade security and compliance.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-privacy.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Privacy Policy - Data Protection and Security',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Whizboard - Your Data Protection & Privacy Rights',
    description: 'Learn how Whizboard protects your privacy and handles your data with enterprise-grade security.',
    images: ['/images/twitter-privacy.png'],
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
    canonical: 'https://whizboard.com/privacy',
  },
};

export default function PrivacyLayout({
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