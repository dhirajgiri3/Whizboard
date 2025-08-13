// @ts-nocheck
import React from "react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // In a real app, you'd fetch board data here
  const { id: boardId } = await params;
  
  return {
    title: `Board ${boardId} | Whizboard - Collaborative Whiteboard`,
    description: `Access and collaborate on board ${boardId}. Real-time whiteboard collaboration with professional-grade tools for brainstorming, planning, and team productivity.`,
    keywords: [
      'collaborative whiteboard',
      'real-time collaboration',
      'team board',
      'brainstorming',
      'visual collaboration',
      'online whiteboard',
      'team productivity',
      'shared workspace',
      'digital canvas',
      'project planning'
    ],
    openGraph: {
      title: `Board ${boardId} | Whizboard - Collaborative Whiteboard`,
      description: `Access and collaborate on board ${boardId} with real-time whiteboard collaboration tools.`,
      type: 'website',
      siteName: 'Whizboard',
      images: [
        {
          url: `/images/og-board-${boardId}.png`,
          width: 1200,
          height: 630,
          alt: `Whizboard - Collaborative Board ${boardId}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Board ${boardId} | Whizboard - Collaborative Whiteboard`,
      description: `Access and collaborate on board ${boardId} with real-time whiteboard collaboration tools.`,
      images: [`/images/twitter-board-${boardId}.png`],
    },
    robots: {
      index: false, // Individual boards should be private
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    alternates: {
      canonical: `https://whizboard.com/board/${boardId}`,
    },
  };
}

export default function BoardLayout({ children, ..._rest }: any) {
  return (
    <div className="board-layout min-h-screen">
      {children}
    </div>
  );
}
