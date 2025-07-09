import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ApolloProvider } from "@/lib/provider/ApolloProvider";
import AuthSessionProvider from "@/lib/provider/AuthSessionProvider";
import { Toaster } from "sonner";
import { BoardProvider } from "@/components/context/BoardContext";
import Header from "@/components/layout/header/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhizBoard - My Boards",
  description: "Manage and organize your boards",
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
            <BoardProvider>
              <Header />
              {children}
            </BoardProvider>
            <Toaster richColors position="top-center" />
          </ApolloProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
