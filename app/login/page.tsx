 "use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-md w-full border border-gray-200">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">Welcome to CyperBoard</h1>
        <p className="text-gray-600 mb-8 text-center">Sign in to collaborate, create, and share boards in real time.</p>
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 text-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.7 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.13 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.29 37.29 46.1 31.44 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.09-3.22-1.09-6.7 0-9.92l-7.98-6.2C.9 16.18 0 19.01 0 22c0 2.99.9 5.82 2.69 8.83l7.98-6.2z"/><path fill="#EA4335" d="M24 44c6.18 0 11.36-2.05 15.15-5.57l-7.19-5.6c-2.01 1.35-4.59 2.15-7.96 2.15-6.43 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/></g></svg>
          Sign in with Google
        </button>
      </div>
      <p className="mt-8 text-gray-400 text-sm">&copy; {new Date().getFullYear()} CyperBoard. All rights reserved.</p>
    </div>
  );
}
