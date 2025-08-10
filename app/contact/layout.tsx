
import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'Contact Us | Whizboard - Get in Touch with Our Team',
  description: 'Have questions about Whizboard? Need support or want to share feedback? Contact our team for assistance with collaborative whiteboard solutions, technical support, or partnership inquiries.',
  keywords: [
    'contact whizboard',
    'customer support',
    'technical support',
    'feedback',
    'partnership',
    'sales inquiry',
    'help desk',
    'get in touch',
    'support team',
    'contact form'
  ],
  openGraph: {
    title: 'Contact Us | Whizboard - Get in Touch with Our Team',
    description: 'Have questions about Whizboard? Contact our team for assistance with collaborative whiteboard solutions, technical support, or partnership inquiries.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'Contact Whizboard - Customer Support and Inquiries',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Whizboard - Get in Touch with Our Team',
    description: 'Have questions about Whizboard? Contact our team for assistance with collaborative whiteboard solutions and technical support.',
    images: ['/images/twitter-contact.png'],
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
    canonical: 'https://whizboard.com/contact',
  },
};

export default function ContactLayout({
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