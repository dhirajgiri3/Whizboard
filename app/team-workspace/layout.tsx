
import type { Metadata } from 'next';
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: 'Team Workspace | Whizboard - Collaborative Team Environment',
  description: 'Access your team workspace on Whizboard. Collaborate in real-time, manage team boards, share ideas, and boost productivity with your team members in a secure collaborative environment.',
  keywords: [
    'team workspace',
    'team collaboration',
    'shared workspace',
    'team boards',
    'collaborative environment',
    'team productivity',
    'real-time collaboration',
    'team management',
    'shared projects',
    'team dashboard'
  ],
  openGraph: {
    title: 'Team Workspace | Whizboard - Collaborative Team Environment',
    description: 'Access your team workspace on Whizboard for real-time collaboration, team boards, and enhanced productivity.',
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-team-workspace.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard Team Workspace - Collaborative Environment',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team Workspace | Whizboard - Collaborative Team Environment',
    description: 'Access your team workspace on Whizboard for real-time collaboration and enhanced team productivity.',
    images: ['/images/twitter-team-workspace.png'],
  },
  robots: {
    index: false, // Team workspaces should be private
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/team-workspace',
  },
};

export default function TeamWorkspaceLayout({
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