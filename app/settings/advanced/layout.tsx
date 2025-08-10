import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Advanced Settings | Whizboard - Power User Configuration",
  description: "Access advanced configuration options for your Whizboard account. Manage API keys, developer settings, data export, security policies, and enterprise-level customizations.",
  keywords: [
    'advanced settings',
    'power user settings',
    'developer settings',
    'API configuration',
    'data export',
    'security policies',
    'enterprise settings',
    'advanced configuration',
    'technical settings',
    'system preferences'
  ],
  openGraph: {
    title: "Advanced Settings | Whizboard - Power User Configuration",
    description: "Access advanced configuration options including API keys, developer settings, and enterprise-level customizations.",
    type: "website",
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-advanced-settings.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Advanced Settings - Power User Configuration',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Advanced Settings | Whizboard - Power User Configuration",
    description: "Access advanced configuration options including API keys, developer settings, and enterprise customizations.",
    images: ['/images/twitter-advanced-settings.png'],
  },
  robots: {
    index: false, // Advanced settings should be private
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/settings/advanced',
  },
};

export default function AdvancedSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
