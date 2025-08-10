import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invitation Declined | Whizboard - Collaboration Invitation Status',
  description: 'Your collaboration invitation has been declined. Learn about next steps and how to get started with Whizboard for team collaboration.',
  keywords: [
    'invitation declined',
    'collaboration invitation',
    'team invitation',
    'board invitation',
    'invitation status',
    'collaboration declined',
    'team collaboration',
    'board sharing'
  ],
  openGraph: {
    title: 'Invitation Declined | Whizboard - Collaboration Invitation Status',
    description: 'Your collaboration invitation has been declined. Learn about next steps with Whizboard.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-invitation-declined.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Invitation Declined - Collaboration Status',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invitation Declined | Whizboard - Collaboration Invitation Status',
    description: 'Your collaboration invitation has been declined. Learn about next steps with Whizboard.',
    images: ['/images/twitter-invitation-declined.png'],
  },
  robots: {
    index: false, // Invitation status pages should not be indexed
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/invitation-declined',
  },
};

export default function InvitationDeclinedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}