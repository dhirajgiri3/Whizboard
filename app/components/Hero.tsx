"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ArrowRight, Play, Users, Star } from "lucide-react";

/**
 * Enhanced hero section with sophisticated dark blue gradients and seamless wave integration
 */
const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -50]);

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

  // Enhanced wave patterns with more variety and complexity
  const waveVariants = {
    wave1: {
      d: [
        "M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
        "M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,261.3C672,277,768,267,864,234.7C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
        "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z",
        "M0,280L48,261.3C96,243,192,207,288,202.7C384,198,480,226,576,245.3C672,265,768,275,864,261.3C960,248,1056,212,1152,197.3C1248,183,1344,189,1392,192L1440,195L1440,320L0,320Z",
        "M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
      ],
    },
    wave2: {
      d: [
        "M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z",
        "M0,192L48,208C96,224,192,256,288,229.3C384,203,480,117,576,117.3C672,117,768,203,864,213.3C960,224,1056,160,1152,149.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z",
        "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z",
        "M0,288L48,277.3C96,267,192,245,288,240C384,235,480,245,576,261.3C672,277,768,309,864,298.7C960,288,1056,224,1152,197.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z",
        "M0,224L48,218.7C96,213,192,203,288,208C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z",
      ],
    },
    wave3: {
      d: [
        "M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,224C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
        "M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,240C672,245,768,203,864,197.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L0,320Z",
        "M0,288L48,277.3C96,267,192,245,288,240C384,235,480,245,576,261.3C672,277,768,309,864,298.7C960,288,1056,224,1152,197.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z",
        "M0,192L48,202.7C96,213,192,235,288,245.3C384,256,480,256,576,245.3C672,235,768,213,864,208C960,203,1056,213,1152,229.3C1248,245,1344,267,1392,278.7L1440,290L1440,320L0,320Z",
        "M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,224C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
      ],
    },
    wave4: {
      d: [
        "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z",
        "M0,96L48,122.7C96,149,192,203,288,229.3C384,256,480,256,576,234.7C672,213,768,171,864,160C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
        "M0,224L48,213.3C96,203,192,181,288,192C384,203,480,245,576,256C672,267,768,245,864,213.3C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z",
        "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z",
        "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z",
      ],
    },
    wave5: {
      d: [
        "M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,170.7C672,160,768,160,864,181.3C960,203,1056,245,1152,250.7C1248,256,1344,224,1392,208L1440,192L1440,320L0,320Z",
        "M0,288L48,277.3C96,267,192,245,288,240C384,235,480,245,576,261.3C672,277,768,309,864,298.7C960,288,1056,224,1152,197.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L0,320Z",
        "M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,229.3C672,224,768,192,864,181.3C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z",
        "M0,224L48,208C96,192,192,160,288,170.7C384,181,480,235,576,240C672,245,768,203,864,197.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L0,320Z",
        "M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,170.7C672,160,768,160,864,181.3C960,203,1056,245,1152,250.7C1248,256,1344,224,1392,208L1440,192L1440,320L0,320Z",
      ],
    },
    wave6: {
      d: [
        "M0,64L48,80C96,96,192,128,288,154.7C384,181,480,203,576,197.3C672,192,768,160,864,144C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z",
        "M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,224C672,235,768,213,864,197.3C960,181,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z",
        "M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,224C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
        "M0,96L48,122.7C96,149,192,203,288,229.3C384,256,480,256,576,234.7C672,213,768,171,864,160C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L0,320Z",
        "M0,64L48,80C96,96,192,128,288,154.7C384,181,480,203,576,197.3C672,192,768,160,864,144C960,128,1056,128,1152,149.3C1248,171,1344,213,1392,234.7L1440,256L1440,320L0,320Z",
      ],
    },
  };

  const AvatarImages = [
    "https://plus.unsplash.com/premium_photo-1705563088258-e15be3f78695?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1525186402429-b4ff38bedec6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1496&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1664575602554-2087b04935a5?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ffffff 0%, #EDF4FB 5%, #C8DFFF 25%, #7FBAFD 45%, #3b82f6 65%, #2563eb 80%, #1e3a8a 92%, #0f172a 100%)",
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

      {/* Enhanced floating particles with better physics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${5 + i * 3.8}%`,
              top: `${10 + i * 3.2}%`,
              width: i % 4 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1px",
              height: i % 4 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1px",
            }}
            animate={{
              y: [-30, 40, -30],
              x: [0, i % 2 === 0 ? 15 : -15, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-white/60 to-blue-300/80 rounded-full blur-[0.5px] shadow-lg shadow-blue-300/30" />
          </motion.div>
        ))}
        
        {/* Floating orbs within waves */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              bottom: `${5 + i * 2}%`,
              width: "6px",
              height: "6px",
            }}
            animate={{
              y: [-10, 20, -10],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-cyan-300/60 to-blue-400/80 rounded-full shadow-xl shadow-blue-400/40 blur-[1px]" />
          </motion.div>
        ))}
      </div>

      {/* STUNNING ENHANCED WAVE LAYERS */}
      <div className="absolute bottom-0 left-0 w-full h-[40vh] pointer-events-none">
        {/* Wave 6 - Deepest background layer with glow */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * -8}px) translateY(${
              mousePosition.y * -4
            }px) scale(${1 + mousePosition.x * 0.02})`,
          }}
        >
          <defs>
            <linearGradient id="wave6" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(59, 130, 246, 0.2)", "rgba(147, 197, 253, 0.3)", "rgba(59, 130, 246, 0.2)"] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <motion.stop 
                offset="50%" 
                animate={{ stopColor: ["rgba(96, 165, 250, 0.15)", "rgba(59, 130, 246, 0.25)", "rgba(96, 165, 250, 0.15)"] }}
                transition={{ duration: 14, repeat: Infinity, delay: 2 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(30, 64, 175, 0.25)", "rgba(96, 165, 250, 0.35)", "rgba(30, 64, 175, 0.25)"] }}
                transition={{ duration: 16, repeat: Infinity, delay: 4 }}
              />
            </linearGradient>
            <filter id="glow6">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave6)"
            filter="url(#glow6)"
            animate={{ d: waveVariants.wave6.d }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>

        {/* Wave 5 - Deep background layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-50"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * -6}px) translateY(${
              mousePosition.y * -3
            }px) scale(${1 + mousePosition.y * 0.01}) rotate(${mousePosition.x * 0.5}deg)`,
          }}
        >
          <defs>
            <linearGradient id="wave5" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(96, 165, 250, 0.25)", "rgba(59, 130, 246, 0.35)", "rgba(96, 165, 250, 0.25)"] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <motion.stop 
                offset="50%" 
                animate={{ stopColor: ["rgba(147, 197, 253, 0.2)", "rgba(96, 165, 250, 0.3)", "rgba(147, 197, 253, 0.2)"] }}
                transition={{ duration: 12, repeat: Infinity, delay: 1 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(59, 130, 246, 0.3)", "rgba(30, 64, 175, 0.4)", "rgba(59, 130, 246, 0.3)"] }}
                transition={{ duration: 14, repeat: Infinity, delay: 3 }}
              />
            </linearGradient>
            <filter id="glow5">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave5)"
            filter="url(#glow5)"
            animate={{ d: waveVariants.wave5.d }}
            transition={{
              duration: 38,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </motion.svg>

        {/* Wave 4 - Mid-deep layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-60"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * -4}px) translateY(${
              mousePosition.y * -2
            }px) scale(${1 + mousePosition.x * 0.015})`,
          }}
        >
          <defs>
            <linearGradient id="wave4" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(147, 197, 253, 0.3)", "rgba(59, 130, 246, 0.4)", "rgba(147, 197, 253, 0.3)"] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.stop 
                offset="50%" 
                animate={{ stopColor: ["rgba(59, 130, 246, 0.25)", "rgba(96, 165, 250, 0.35)", "rgba(59, 130, 246, 0.25)"] }}
                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(30, 64, 175, 0.35)", "rgba(147, 197, 253, 0.45)", "rgba(30, 64, 175, 0.35)"] }}
                transition={{ duration: 12, repeat: Infinity, delay: 1 }}
              />
            </linearGradient>
            <filter id="glow4">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave4)"
            filter="url(#glow4)"
            animate={{ d: waveVariants.wave4.d }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </motion.svg>

        {/* Wave 1 - Enhanced with glow and color shifting */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-70"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * -3}px) translateY(${
              mousePosition.y * -2
            }px) scale(${1 + mousePosition.y * 0.01})`,
          }}
        >
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(175, 207, 255, 0.4)", "rgba(59, 130, 246, 0.5)", "rgba(175, 207, 255, 0.4)"] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.stop 
                offset="40%" 
                animate={{ stopColor: ["rgba(96, 165, 250, 0.35)", "rgba(147, 197, 253, 0.45)", "rgba(96, 165, 250, 0.35)"] }}
                transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              />
              <motion.stop 
                offset="80%" 
                animate={{ stopColor: ["rgba(59, 130, 246, 0.4)", "rgba(30, 64, 175, 0.5)", "rgba(59, 130, 246, 0.4)"] }}
                transition={{ duration: 10, repeat: Infinity, delay: 2 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(30, 64, 175, 0.45)", "rgba(96, 165, 250, 0.55)", "rgba(30, 64, 175, 0.45)"] }}
                transition={{ duration: 12, repeat: Infinity, delay: 3 }}
              />
            </linearGradient>
            <filter id="glow1">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave1)"
            filter="url(#glow1)"
            animate={{ d: waveVariants.wave1.d }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.svg>

        {/* Wave 2 - Enhanced middle layer */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-80"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * 2}px) translateY(${
              mousePosition.y * -1
            }px) scale(${1 + mousePosition.x * 0.008}) rotate(${mousePosition.y * 0.3}deg)`,
          }}
        >
          <defs>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(147, 197, 253, 0.4)", "rgba(96, 165, 250, 0.5)", "rgba(147, 197, 253, 0.4)"] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.stop 
                offset="40%" 
                animate={{ stopColor: ["rgba(175, 207, 255, 0.45)", "rgba(59, 130, 246, 0.55)", "rgba(175, 207, 255, 0.45)"] }}
                transition={{ duration: 7, repeat: Infinity, delay: 1.5 }}
              />
              <motion.stop 
                offset="80%" 
                animate={{ stopColor: ["rgba(59, 130, 246, 0.5)", "rgba(147, 197, 253, 0.6)", "rgba(59, 130, 246, 0.5)"] }}
                transition={{ duration: 9, repeat: Infinity, delay: 0.5 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(30, 64, 175, 0.55)", "rgba(175, 207, 255, 0.65)", "rgba(30, 64, 175, 0.55)"] }}
                transition={{ duration: 11, repeat: Infinity, delay: 2.5 }}
              />
            </linearGradient>
            <filter id="glow2">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave2)"
            filter="url(#glow2)"
            animate={{ d: waveVariants.wave2.d }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </motion.svg>

        {/* Wave 3 - Enhanced foreground layer with intense glow */}
        <motion.svg
          className="absolute bottom-0 left-0 w-full h-full opacity-90"
          preserveAspectRatio="none"
          viewBox="0 0 1440 320"
          style={{
            transform: `translateX(${mousePosition.x * 6}px) translateY(${
              mousePosition.y * 1
            }px) scale(${1 + mousePosition.x * 0.012}) rotate(${mousePosition.x * 0.2}deg)`,
          }}
        >
          <defs>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="100%">
              <motion.stop 
                offset="0%" 
                animate={{ stopColor: ["rgba(147, 197, 253, 0.5)", "rgba(59, 130, 246, 0.6)", "rgba(147, 197, 253, 0.5)"] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.stop 
                offset="40%" 
                animate={{ stopColor: ["rgba(96, 165, 250, 0.55)", "rgba(175, 207, 255, 0.65)", "rgba(96, 165, 250, 0.55)"] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
              />
              <motion.stop 
                offset="80%" 
                animate={{ stopColor: ["rgba(175, 207, 255, 0.4)", "rgba(30, 64, 175, 0.6)", "rgba(175, 207, 255, 0.4)"] }}
                transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              />
              <motion.stop 
                offset="100%" 
                animate={{ stopColor: ["rgba(30, 64, 175, 0.65)", "rgba(96, 165, 250, 0.75)", "rgba(30, 64, 175, 0.65)"] }}
                transition={{ duration: 10, repeat: Infinity, delay: 0.5 }}
              />
            </linearGradient>
            <filter id="glow3">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.path
            fill="url(#wave3)"
            filter="url(#glow3)"
            animate={{ d: waveVariants.wave3.d }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 6,
            }}
          />
        </motion.svg>
      </div>

      <main className="relative z-10 flex flex-col h-full">
        {/* Enhanced main content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            className="max-w-4xl text-center"
            style={{ y: parallaxY }}
          >
            {/* Enhanced social proof with glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-10 inline-flex items-center space-x-3 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md border border-white/25"
            >
              <div className="flex -space-x-2">
                {AvatarImages.map((image, i) => (
                  <motion.div
                    key={i}
                    className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white/70 shadow-sm"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.5 + i * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    style={{
                      backgroundImage: `url(${image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                ))}
              </div>
              <motion.span
                className="text-sm font-medium text-white/95"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Join 10,000+ teams
              </motion.span>
            </motion.div>

            {/* Enhanced main heading with better effects */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 text-4xl font-bold leading-tight text-white drop-shadow-xl sm:text-5xl md:text-6xl"
            >
              Turn Ideas into{" "}
              <motion.span
                className="relative inline-block bg-gradient-to-r from-sky-200 via-white to-blue-100 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Action
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-white/20 blur-lg rounded-lg"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.span>
              , Together.
            </motion.h1>

            {/* Enhanced description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mb-10 max-w-xl mx-auto text-md text-white/90 leading-relaxed font-light"
            >
              Create, collaborate, and bring your ideas to life with the most
              intuitive whiteboard experience. From concept to completion, all in real-time.
            </motion.p>

            {/* Enhanced CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center"
            >
              <motion.a
                href="/signup"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center space-x-3 rounded-xl bg-white/95 px-8 py-4 text-md font-medium text-gray-700 backdrop-blur-sm transition-all hover:bg-white"
              >
                <span>Start for Free</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </motion.a>

              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center space-x-3 rounded-xl border border-white/50 bg-white/15 px-8 py-4 text-md font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/60"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Play className="h-5 w-5" />
                </motion.div>
                <span>Watch Demo</span>
              </motion.a>
            </motion.div>

            {/* Enhanced trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-12 flex items-center justify-center space-x-10 text-white/85 text-sm"
            >
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-white text-white drop-shadow-sm" />
                <span className="font-medium">4.9/5 rating</span>
              </div>
              <div className="h-5 w-px bg-white/30" />
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 drop-shadow-sm" />
                <span className="font-medium">Free forever plan</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Hero;
