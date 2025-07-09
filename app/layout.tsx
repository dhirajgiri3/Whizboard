import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/provider/ApolloProvider";
import AuthSessionProvider from "@/lib/provider/AuthSessionProvider";
import { Toaster } from "sonner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhizBoard",
  description: "A real-time collaborative whiteboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <ApolloProvider>
            {children}
            <Toaster richColors position="top-center" />
          </ApolloProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
