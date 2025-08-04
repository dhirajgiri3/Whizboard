"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Users, Star, Award, Target, Rocket, Heart, CheckCircle, Globe, Shield } from "lucide-react";
import Link from "next/link";

const AboutHero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -30]);

  // Mobile optimization
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Primary Background */}
        <div className="absolute inset-0 bg-gray-950" />
        
        {/* Grid Pattern - Enhanced visibility */}
        <div className="absolute inset-0 opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Optimized Gradient Orbs - Reduced blur for performance */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
              filter: 'blur(40px)',
              willChange: 'transform'
            }}
          />
        </div>
        
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.03) 50%, transparent 70%)',
              filter: 'blur(50px)',
              willChange: 'transform'
            }}
          />
        </div>
      </div>

      {/* Colorful Background Particles - Minimal and Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(isMobile ? 15 : 25)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: i % 8 === 0 ? (isMobile ? "3px" : "4px") : i % 4 === 0 ? (isMobile ? "2px" : "3px") : (isMobile ? "1px" : "2px"),
              height: i % 8 === 0 ? (isMobile ? "3px" : "4px") : i % 4 === 0 ? (isMobile ? "2px" : "3px") : (isMobile ? "1px" : "2px"),
            }}
            animate={{
              y: [-20, 30, -20],
              x: [0, i % 2 === 0 ? (isMobile ? 10 : 20) : (isMobile ? -10 : -20), 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: isMobile ? 20 + i * 0.8 : 15 + i * 0.6,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          >
            <div className={`w-full h-full rounded-full shadow-sm ${
              i % 6 === 0 ? "bg-blue-400/60" : 
              i % 5 === 0 ? "bg-emerald-400/50" : 
              i % 4 === 0 ? "bg-purple-400/50" :
              i % 3 === 0 ? "bg-pink-400/50" :
              i % 2 === 0 ? "bg-yellow-400/50" :
              "bg-cyan-400/50"
            }`} />
          </motion.div>
        ))}
      </div>

      {/* Main Content - Centered Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        
        {/* Top Section - Hero Content */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-12 lg:mb-16"
          style={{ y: parallaxY }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6"
          >
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Our Story</span>
          </motion.div>

          {/* Main Heading - Fixed spacing */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl  font-bold leading-[1.1] tracking-tight text-white mb-4"
          >
            About{" "}
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
              WhizBoard
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-blue-500/20 blur-xl rounded-lg"
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.span>
          </motion.h1>

          {/* Description - Fixed spacing */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-base text-white/70 leading-relaxed font-light mb-8 max-w-lg mx-auto"
          >
            We're building the future of collaborative whiteboarding. Learn about our journey, 
            values, and the people behind the innovation that's transforming how teams work together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-10"
          >
            <Link
              href="/contact"
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] flex items-center justify-center gap-2"
            >
              <span className="relative z-10">Contact Us</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="#team"
              className="text-white hover:text-blue-300 hover:bg-white/5 focus:bg-white/10 active:bg-white/15 font-medium px-6 py-3 rounded-xl border border-white/10 hover:border-blue-400/30 focus:border-blue-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Meet Our Team</span>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap items-center gap-6 text-white/60 text-sm justify-center"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">150k+ users</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span className="font-medium">Enterprise ready</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section - Enhanced Bento Grid with 5 Blocks */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Bento Grid Container - 5 Blocks Layout with Proper Spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Large Feature Card - Mission (Spans 2 columns and 2 rows) */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm md:col-span-2 lg:col-span-2 lg:row-span-2"
            >
              <div className="relative z-10 h-full flex flex-col">
                {/* Header section with improved spacing */}
                <div className="flex flex-col space-y-4 sm:space-y-5 mb-6">
                  <div className="inline-flex p-3 sm:p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                  
                  {/* Fixed title-description spacing */}
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">Our Mission</h3>
                    <p className="text-white/70 leading-relaxed">Empowering teams to collaborate seamlessly with professional-grade whiteboarding tools that transform how ideas come to life.</p>
                  </div>
                </div>
                
                {/* Feature list with consistent spacing */}
                <div className="flex flex-col space-y-3 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-white/70 text-sm">Professional-grade collaboration tools</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-white/70 text-sm">Real-time synchronization</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span className="text-white/70 text-sm">Enterprise security standards</span>
                  </div>
                </div>
                
                {/* Enhanced stats with better hierarchy */}
                <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                  <div className="flex items-center space-x-1.5">
                    <Users className="h-3 w-3 text-blue-400" />
                    <span>150k+ users</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>4.9 rating</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Award className="h-3 w-3 text-emerald-400" />
                    <span>Enterprise ready</span>
                  </div>
                </div>
                
                {/* CTA with improved styling */}
                <Link href="#mission" className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start mt-auto">
                  <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
                  <span>Learn More</span>
                </Link>
              </div>
            </motion.div>

            {/* Innovation Card - Now spans only 1 row */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="inline-flex p-3 rounded-xl bg-orange-600/10 border border-orange-600/20 group-hover:bg-orange-600/15 transition-colors self-start mb-4">
                <Rocket className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Innovation First</h3>
              <p className="text-white/70 text-sm leading-relaxed">Cutting-edge technology that pushes the boundaries of collaborative creativity.</p>
            </motion.div>

            {/* Enterprise Security Card - Fills the empty space */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="inline-flex p-3 rounded-xl bg-green-600/10 border border-green-600/20 group-hover:bg-green-600/15 transition-colors self-start mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-white/70 text-sm leading-relaxed">Bank-grade security with SOC 2 compliance and end-to-end encryption.</p>
            </motion.div>

            {/* Performance Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="inline-flex p-3 rounded-xl bg-yellow-600/10 border border-yellow-600/20 group-hover:bg-yellow-600/15 transition-colors self-start mb-4">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/70 text-sm leading-relaxed">Real-time collaboration with zero latency and instant synchronization.</p>
            </motion.div>

            {/* Community Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start mb-4">
                <Heart className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community Driven</h3>
              <p className="text-white/70 text-sm leading-relaxed">Built by users, for users, with continuous feedback and improvement.</p>
            </motion.div>

            {/* Global Reach Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="inline-flex p-3 rounded-xl bg-purple-600/10 border border-purple-600/20 group-hover:bg-purple-600/15 transition-colors self-start mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Global Reach</h3>
              <p className="text-white/70 text-sm leading-relaxed">Serving teams worldwide with localized support and infrastructure.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHero; 