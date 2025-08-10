import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Whizboard - Account & Workspace Configuration",
  description: "Manage your Whizboard account settings, preferences, integrations, and security options. Customize your experience with profile settings, notifications, team management, and advanced configurations.",
  keywords: [
    'settings',
    'account settings',
    'preferences',
    'profile settings',
    'notifications',
    'integrations',
    'security settings',
    'team management',
    'workspace configuration',
    'user preferences',
    'account management',
    'privacy settings'
  ],
  openGraph: {
    title: "Settings | Whizboard - Account & Workspace Configuration",
    description: "Manage your Whizboard account settings, preferences, integrations, and security options for optimal collaboration experience.",
    type: "website",
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-settings.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Settings - Account and Workspace Configuration',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Settings | Whizboard - Account & Workspace Configuration",
    description: "Manage your Whizboard account settings and preferences for optimal collaboration experience.",
    images: ['/images/twitter-settings.png'],
  },
  robots: {
    index: false, // Settings pages shouldn't be indexed for privacy
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/settings',
  },
};

export default function SettingsLayout({
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