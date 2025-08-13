import type { Metadata } from "next";
import { BoardProvider } from "@/lib/context/BoardContext";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

export const metadata: Metadata = {
  title: "My Boards | Whizboard - Manage Your Collaborative Whiteboards",
  description: "View, organize, and manage all your collaborative whiteboards in one place. Access your personal boards, shared team projects, and recent collaborations with powerful organization tools.",
  keywords: [
    'my boards',
    'board management',
    'whiteboard dashboard',
    'organize boards',
    'personal boards',
    'team boards',
    'board library',
    'collaborative projects',
    'board organization',
    'workspace management'
  ],
  openGraph: {
    title: "My Boards | Whizboard - Manage Your Collaborative Whiteboards",
    description: "View, organize, and manage all your collaborative whiteboards in one place with powerful organization tools.",
    type: 'website',
    siteName: 'Whizboard',
    images: [
      {
        url: '/images/og-my-boards.png',
        width: 1200,
        height: 630,
        alt: 'Whizboard My Boards - Manage Your Whiteboards',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "My Boards | Whizboard - Manage Your Collaborative Whiteboards",
    description: "View, organize, and manage all your collaborative whiteboards in one place with powerful organization tools.",
    images: ['/images/twitter-my-boards.png'],
  },
  robots: {
    index: false, // Personal board dashboards should be private
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: 'https://whizboard.com/my-boards',
  },
};

export default function MyBoardsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <BoardProvider>
        {children}
        <Footer />
      </BoardProvider>
    </>
  );
}
