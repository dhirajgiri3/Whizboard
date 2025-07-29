import { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import Header from "@/components/layout/header/Header";
import ValueProposition from "../components/landing/ValueProposition";
import SocialProof from "../components/landing/SocialProof";
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";
import SmoothScrollProvider from "../components/landing/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "Whizboard - Real-Time Collaborative Whiteboard for Modern Teams",
  description: "Transform chaotic brainstorms into organized action plans with professional-grade collaborative tools. Lightning-fast performance, real-time collaboration, and enterprise-grade security.",
  keywords: "collaborative whiteboard, real-time collaboration, team collaboration, online whiteboard, remote work, design tools, brainstorming",
  authors: [{ name: "Whizboard Team" }],
  creator: "Whizboard",
  publisher: "Whizboard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://whizboard.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Whizboard - Real-Time Collaborative Whiteboard",
    description: "Transform chaotic brainstorms into organized action plans with professional-grade collaborative tools.",
    url: "https://whizboard.com",
    siteName: "Whizboard",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whizboard - Collaborative Whiteboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Whizboard - Real-Time Collaborative Whiteboard",
    description: "Transform chaotic brainstorms into organized action plans with professional-grade collaborative tools.",
    images: ["/images/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="relative">
        <main>
          <Hero />
          <ValueProposition />
          <SocialProof />
          <Features />
          <Pricing />
          <FAQ />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
