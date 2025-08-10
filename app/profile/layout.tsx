import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'Profile | Whizboard - Your Account & Personal Settings',
  description: 'View and manage your Whizboard profile. Update your personal information, profile image, bio, and account details for better collaboration experience.',
  keywords: [
    'user profile',
    'account profile',
    'personal settings',
    'profile management',
    'user account',
    'profile information',
    'account details',
    'user dashboard',
    'profile settings',
    'personal information'
  ],
  openGraph: {
    title: 'Profile | Whizboard - Your Account & Personal Settings',
    description: 'View and manage your Whizboard profile, personal information, and account details.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-profile.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Profile - Personal Account Management',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile | Whizboard - Your Account & Personal Settings',
    description: 'View and manage your Whizboard profile and personal information.',
    images: ['/images/twitter-profile.png'],
  },
  robots: {
    index: false, // User profiles should be private
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/profile',
  },
};

export default function ProfileLayout({
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