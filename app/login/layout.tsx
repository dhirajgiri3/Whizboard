"use client";
import { SessionProvider } from "next-auth/react";

// Avoid nesting SessionProviders; the app root already provides one
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}