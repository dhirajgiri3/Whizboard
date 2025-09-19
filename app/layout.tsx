import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ApolloProvider } from "@/lib/provider/ApolloProvider";
import AuthSessionProvider from "@/lib/provider/AuthSessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import AppToaster from "@/components/ui/AppToaster";
import Script from "next/script";
import { Providers } from "./layout/providers";
import ConditionalHeader from "@/components/layout/header/utils/ConditionalHeader";
import MonitoringWrapper from "@/components/monitoring/MonitoringWrapper";

const maisonNeue = localFont({
  src: [
    {
      path: "../public/fonts/Maison/maison_book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Maison/maison_bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-maison-neue",
  display: "swap",
});

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
    google: "M5rv07bY6tHcGLfimzfpB7eHtc-d5-SVVVZame8NF7s",
  },
  other: {
    "theme-color": "#3b82f6",
    "msapplication-TileColor": "#3b82f6",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Whizboard",
  },
};

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Whizboard",
  "description": "Real-time collaborative whiteboard for modern teams",
  "url": "https://whizboard.com",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free forever plan available"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "2500"
  },
  "author": {
    "@type": "Organization",
    "name": "Whizboard"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={maisonNeue.variable}>
      <head>
        {/* Google site verification */}
        <meta name="google-site-verification" content="M5rv07bY6tHcGLfimzfpB7eHtc-d5-SVVVZame8NF7s" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Performance monitoring */}
        <Script
          id="performance-monitoring"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('performance' in window) {
                window.addEventListener('load', () => {
                  setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
                      console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
                    }
                  }, 0);
                });
              }
              
              // Web Vitals monitoring
              if ('web-vital' in window) {
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS(console.log);
                  getFID(console.log);
                  getFCP(console.log);
                  getLCP(console.log);
                  getTTFB(console.log);
                });
              }
            `,
          }}
        />
      </head>
      <body className={maisonNeue.className}>
        <AuthSessionProvider session={session}>
          <ApolloProvider>
            <Providers>
              <ConditionalHeader />
              <div id="main-content">
                {children}
              </div>
              <AppToaster />
              {/* Monitoring components wrapper */}
              <MonitoringWrapper />
            </Providers>
          </ApolloProvider>
        </AuthSessionProvider>
        
        {/* Performance monitoring script */}
        <Script
          id="web-vitals"
          src="https://unpkg.com/web-vitals@3/dist/web-vitals.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
