"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { RequireUnauth } from "@/components/auth/ProtectedRoute";
import { 
  Shield, 
  Users, 
  CheckCircle, 
  Star,
  Lock
} from "lucide-react";

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/my-boards" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const trustIndicators = [
    { icon: Users, text: "150k+ users", color: "text-blue-400" },
    { icon: Star, text: "4.9/5 rating", color: "text-yellow-400" },
    { icon: Shield, text: "Enterprise ready", color: "text-emerald-400" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        {/* Smaller, More Elegant Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Refined Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-16 h-16 border border-white/[0.12] rounded-xl"
          animate={{
            x: [0, 10, 0],
            y: [0, -8, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-12 h-12 border border-white/[0.1] rounded-xl"
          animate={{
            x: [0, -8, 0],
            y: [0, 12, 0],
            opacity: [0.12, 0.2, 0.12]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Enhanced Gradient Orbs with Higher Opacity */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{ 
            scale: [1, 1.05, 1], 
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.12) 50%, transparent 70%)',
            filter: 'blur(70px)'
          }}
          animate={{ 
            scale: [1.02, 1, 1.02], 
            opacity: [0.35, 0.5, 0.35]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 3
          }}
        />
        
        {/* Enhanced Accent Orb */}
        <motion.div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)',
            filter: 'blur(50px)'
          }}
          animate={{ 
            scale: [1.01, 1.03, 1.01], 
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: 'easeInOut',
            delay: 5
          }}
        />

        {/* Elegant Particle Effects */}
        <motion.div
          className="absolute top-1/3 left-1/2 w-1.5 h-1.5 bg-blue-400/60 rounded-full"
          animate={{
            y: [0, -40, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-emerald-400/70 rounded-full"
          animate={{
            y: [0, -35, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />

        {/* Enhanced Light Rays */}
        <motion.div
          className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent"
          animate={{
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Clean Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.h1 
              className="text-4xl font-bold text-white mb-3 uppercase tracking-wide"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: "linear-gradient(90deg, #FFFFFF 0%, #60A5FA 50%, #FFFFFF 100%)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}
            >
              Whizboard
            </motion.h1>
            <motion.p 
              className="text-white/60 text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Professional Collaborative Whiteboard
            </motion.p>
          </motion.div>

          {/* Clean Login Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 shadow-2xl"
          >
            {/* Subtle Background Enhancement */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-emerald-500/[0.03] rounded-2xl opacity-0"
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Clean Header */}
            <div className="text-center mb-8 relative z-10">
              <motion.h2 
                className="text-xl font-semibold text-white mb-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Welcome to Whizboard
              </motion.h2>
              <motion.p 
                className="text-white/60 text-sm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Sign in with Google to access your workspace
              </motion.p>
            </div>

            {/* Enhanced Google Sign In Button */}
            <motion.button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-base relative z-10">{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
            </motion.button>

            {/* Clean Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 pt-6 border-t border-white/[0.1] relative z-10"
            >
              <div className="flex items-center justify-center gap-8 text-white/50 text-xs">
                {trustIndicators.map((indicator, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                    <span className="font-medium">{indicator.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Clean Terms */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="mt-6 text-center relative z-10"
            >
              <p className="text-white/40 text-xs leading-relaxed">
                By continuing, you agree to our{" "}
                <motion.span 
                  className="text-blue-400 hover:text-blue-300 cursor-pointer underline underline-offset-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.15 }}
                >
                  Terms
                </motion.span>
                {" "}and{" "}
                <motion.span 
                  className="text-blue-400 hover:text-blue-300 cursor-pointer underline underline-offset-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.15 }}
                >
                  Privacy Policy
                </motion.span>
              </p>
            </motion.div>
          </motion.div>

          {/* Clean Bottom Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-8 text-white/40 text-xs">
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">No credit card required</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Lock className="w-4 h-4" />
                <span className="font-medium">Enterprise-grade security</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <RequireUnauth redirectTo="/my-boards">
      <LoginPageContent />
    </RequireUnauth>
  );
}
