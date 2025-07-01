"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (status === "loading") return <span>Loading...</span>;
  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in with Google</button>;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-700">{session.user?.name}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
} 