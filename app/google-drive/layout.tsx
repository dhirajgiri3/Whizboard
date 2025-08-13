import Footer from '@/components/layout/footer/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Google Drive Integration | Whizboard - Cloud Storage & File Management',
  description: 'Seamlessly integrate your Whizboard with Google Drive. Export boards, organize files, and manage your cloud storage with powerful collaboration tools.',
  keywords: [
    'google drive integration',
    'cloud storage',
    'file management',
    'export boards',
    'drive sync',
    'file organization',
    'cloud collaboration',
    'google drive export',
    'file sharing',
    'cloud backup'
  ],
  openGraph: {
    title: 'Google Drive Integration | Whizboard - Cloud Storage & File Management',
    description: 'Seamlessly integrate your Whizboard with Google Drive for enhanced file management and collaboration.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-google-drive.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Google Drive Integration - Cloud Storage',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Drive Integration | Whizboard - Cloud Storage & File Management',
    description: 'Seamlessly integrate your Whizboard with Google Drive for enhanced file management.',
    images: ['/images/twitter-google-drive.png'],
  },
  robots: {
    index: false, // Integration pages should be private for logged-in users
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/google-drive',
  },
};

export default function GoogleDriveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern opacity-[0.12]" />
      <div className="absolute -top-16 -right-16 w-48 h-48 gradient-orb-blue" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 gradient-orb-blue opacity-60" />
      
      {children}
      <Footer />
    </div>
  );
}