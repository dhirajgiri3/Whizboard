"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, Play, Users, Star, Zap, Hand } from "lucide-react";
import RealtimeWhiteboard from "@/components/reatime/whiteboard/RealtimeWhiteboard";
import DemoVideoModal from "@/components/ui/modal/DemoVideoModal";

/**
 * Enhanced hero section with sophisticated responsive design and optimized performance
 */
const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -50]);

  // Mobile optimization - reduce animation intensity on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showInteractivePrompt, setShowInteractivePrompt] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show interactive prompt after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInteractivePrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Track mouse movement with proper typing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Unified reveal-on-scroll variants (first time only) for a minimal, smooth experience
  const viewportOnce = { once: true, amount: 0.2 } as const;
  const revealVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  // Optimized wave patterns with better performance
  const waveVariants = {
    wave1: {
      d: [
        "M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
        "M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,261.3C672,277,768,267,864,234.7C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
        "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z",
      ],
    },
    wave2: {
      d: [
        "M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z",
        "M0,192L48,208C96,224,192,256,288,229.3C384,203,480,117,576,117.3C672,117,768,203,864,213.3C960,224,1056,160,1152,149.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z",
        "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z",
      ],
    },
    wave3: {
      d: [
        "M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,224C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
        "M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,240C672,245,768,203,864,197.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L0,320Z",
        "M0,288L48,277.3C96,267,192,245,288,240C384,235,480,245,576,261.3C672,277,768,309,864,298.7C960,288,1056,224,1152,197.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z",
      ],
    },
  };

  const AvatarImages = [
    "https://plus.unsplash.com/premium_photo-1705563088258-e15be3f78695?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1496&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const interactivePrompts = [
    "Try drawing something!",
    "Click the toolbar to explore tools",
    "Watch others collaborate in real-time",
    "Add sticky notes with your ideas",
    "Pan and zoom around the canvas",
    "Click on shapes to select them",
    "Use keyboard shortcuts (P, C, R, T)",
    "Change colors with the color picker",
  ];

  const handleInteraction = () => {
    setInteractionCount(prev => prev + 1);
    if (showInteractivePrompt) {
      setShowInteractivePrompt(false);
      setTimeout(() => {
        setShowInteractivePrompt(true);
      }, 2000);
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      id="hero"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #F0F7FF 3%, #E5F0FF 8%, #D1E5FF 15%, #B3D7FF 25%, #85C1FF 35%, #57A9FF 45%, #3b82f6 55%, #2563eb 65%, #1d4ed8 75%, #1e40af 85%, #1e3a8a 92%, #172554 96%, #0f172a 100%)",
      }}
    >
      {/* Enhanced background texture */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.6) 1px, transparent 0),
              radial-gradient(circle at 20px 20px, rgba(59, 130, 246, 0.3) 1px, transparent 0)
            `,
            backgroundSize: "40px 40px, 60px 60px",
          }}
        />
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-900/10" />
      </div>

      {/* Optimized floating particles - Reduced count for better performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Small particles - Reduced count on mobile */}
        {[...Array(isMobile ? 12 : 24)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: i % 5 === 0 ? (isMobile ? "1.5px" : "2px") : "1px",
              height: i % 5 === 0 ? (isMobile ? "1.5px" : "2px") : "1px",
            }}
            animate={{
              y: [-20, 30, -20],
              x: [0, i % 2 === 0 ? (isMobile ? 5 : 10) : isMobile ? -5 : -10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: isMobile ? 10 + i * 0.4 : 8 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-white/70 rounded-full shadow-sm shadow-white/20" />
          </motion.div>
        ))}

        {/* Medium-sized orbs - Reduced count */}
        {[...Array(isMobile ? 6 : 10)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${15 + i * 5.5}%`,
              top: `${20 + i * 4}%`,
              width: isMobile ? "2px" : "3px",
              height: isMobile ? "2px" : "3px",
            }}
            animate={{
              y: [-15, 25, -15],
              x: [0, i % 2 === 0 ? (isMobile ? 6 : 12) : isMobile ? -6 : -12, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [0.7, 1.3, 0.7],
            }}
            transition={{
              duration: isMobile ? 12 + i * 0.5 : 10 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-white/80 rounded-full shadow-lg shadow-white/30" />
          </motion.div>
        ))}

        {/* Larger accent particles - Reduced count */}
        {[...Array(isMobile ? 3 : 5)].map((_, i) => (
          <motion.div
            key={`accent-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${25 + i * 8}%`,
              top: `${10 + i * 6}%`,
              width: isMobile ? "3px" : "4px",
              height: isMobile ? "3px" : "4px",
            }}
            animate={{
              y: [-25, 35, -25],
              x: [0, i % 2 === 0 ? (isMobile ? 8 : 15) : isMobile ? -8 : -15, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: isMobile ? 15 + i * 0.6 : 12 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-white/90 rounded-full shadow-xl shadow-white/40" />
          </motion.div>
        ))}
      </div>

      {/* Optimized wave layers - Reduced complexity for better performance */}
      <div className="absolute bottom-0 left-0 w-full h-[35vh] sm:h-[40vh] pointer-events-none">
        {/* Wave 3 - Background layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${isMobile ? mousePosition.x * -1 : mousePosition.x * -8}px) translateY(${isMobile ? mousePosition.y * -0.5 : mousePosition.y * -4}px)`,
          }}
        >
          <defs>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
              <stop offset="50%" stopColor="rgba(96, 165, 250, 0.15)" />
              <stop offset="100%" stopColor="rgba(30, 64, 175, 0.25)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#wave3)"
            animate={{ d: waveVariants.wave3.d }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>

        {/* Wave 2 - Middle layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-60"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${isMobile ? mousePosition.x * -0.5 : mousePosition.x * -4}px) translateY(${isMobile ? mousePosition.y * -0.25 : mousePosition.y * -2}px)`,
          }}
        >
          <defs>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(147, 197, 253, 0.3)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(30, 64, 175, 0.35)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#wave2)"
            animate={{ d: waveVariants.wave2.d }}
            transition={{
              duration: 38,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </motion.svg>

        {/* Wave 1 - Foreground layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-80"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${isMobile ? mousePosition.x * -0.375 : mousePosition.x * -3}px) translateY(${isMobile ? mousePosition.y * -0.25 : mousePosition.y * -2}px)`,
          }}
        >
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(175, 207, 255, 0.4)" />
              <stop offset="40%" stopColor="rgba(96, 165, 250, 0.35)" />
              <stop offset="80%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(30, 64, 175, 0.45)" />
            </linearGradient>
          </defs>
          <motion.path
            fill="url(#wave1)"
            animate={{ d: waveVariants.wave1.d }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      </div>

      <main className="relative z-10 flex flex-col min-h-screen pt-16">
        {/* Enhanced main content - Mobile responsive spacing */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 pb-12">
          <motion.div
            className="w-full max-w-6xl flex flex-col items-center gap-4 text-center"
            style={{ y: parallaxY }}
          >
            {/* Enhanced social proof with better mobile design */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 sm:px-4 py-2 backdrop-blur-md border border-white/25"
            >
              <div className="flex -space-x-1 sm:-space-x-2">
                {AvatarImages.map((image, i) => (
                  <motion.div
                    key={i}
                    className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white/70 shadow-sm"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.5 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    whileHover={{ scale: isMobile ? 1.05 : 1.1, zIndex: 10 }}
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
              <motion.span
                className="text-xs sm:text-sm font-medium text-white/95"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Join our early access
              </motion.span>
            </motion.div>

            <div className="flex flex-col items-center justify-center space-y-2">
              {/* Enhanced main heading with better responsive typography */}
              <motion.h1
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: 0.2 }}
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white text-center max-w-sm sm:max-w-2xl px-2 sm:px-0"
              >
                Transform Brainstorms into{" "}
                <motion.span
                  className="relative inline-block bg-gradient-to-r from-blue-500 via-white to-blue-500 bg-clip-text text-transparent bg-[length:200%_100%]"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Action
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-blue-500/20 blur-xl rounded-lg"
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.span>
                , Together.
              </motion.h1>

              {/* Enhanced description with better responsive design */}
              <motion.p
                variants={revealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ delay: 0.25 }}
                className="max-w-lg md:max-w-xl text-sm sm:text-base lg:text-lg text-white/80 leading-[1.6] font-light px-4 sm:px-0"
              >
                Create, collaborate, and bring your ideas to life with an
                intuitive whiteboard experience. From concept to completion, all
                in real-time.
              </motion.p>
            </div>

            {/* Enhanced CTA buttons with better mobile design */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 justify-center w-full px-4 sm:px-0 mt-6 sm:mt-8"
            >
              <motion.a
                href="/login"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 w-full sm:w-auto min-w-[200px] min-h-[44px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.a>

              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-white px-6 py-4 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] w-full sm:w-auto min-w-[200px] min-h-[44px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
                onClick={(e) => { e.preventDefault(); setIsDemoOpen(true); }}
              >
                <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>See 3-Min Demo</span>
              </motion.a>
            </motion.div>

            {/* Enhanced trust indicators with better mobile layout */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 lg:gap-8 text-white/85 text-xs sm:text-sm px-4 sm:px-0 mt-6 sm:mt-8"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-white text-white drop-shadow-sm" />
                <span className="font-medium">Loved by early adopters</span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-sm" />
                <span className="font-medium">Free forever plan available</span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-sm" />
                <span className="font-medium">Quick setup</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Interactive Whiteboard Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
          {/* Interactive Prompt Overlay */}
          {/* {showInteractivePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center mb-4 relative z-20"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  y: [0, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3"
              >
                <div className="flex items-center gap-3">
                  <Hand className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    {interactivePrompts[interactionCount % interactivePrompts.length]}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
              </motion.div>
            </motion.div>
          )} */}

          {/* Enhanced Whiteboard Container */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            transition={{ delay: 0.4 }}
            className="w-full mx-auto relative z-10"
            style={{ y: parallaxY }}
            onClick={handleInteraction}
          >
            {/* Clean Whiteboard Container */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="relative">
                <RealtimeWhiteboard />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <DemoVideoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        videoUrl="https://res.cloudinary.com/dgak25skk/video/upload/v1755180328/whizboard-3_qyofjn.mp4"
        title="Watch 3‑Min Demo"
        description="See the whiteboard in action from the hero section."
      />
    </div>
  );
};

export default Hero;
