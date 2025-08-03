"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, ArrowRight, Play, CheckCircle, Shield } from "lucide-react";
import Link from "next/link";

const AboutCTA = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const orbAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <section ref={ref} className="py-16 md:py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Enhanced Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: 'translate(-50%, -50%)'
        }}></div>
        
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)',
          filter: 'blur(70px)',
          transform: 'translate(50%, 50%)'
        }}></div>
        
        <motion.div
          className="max-w-3xl mx-auto relative"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6 group/badge hover:scale-105 transition-transform duration-300">
            <Zap className="h-4 w-4 text-purple-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Get Started</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
            Ready to Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Collaboration</span>?
          </h2>
          
          <p className="text-base sm:text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of teams who are already using WhizBoard to innovate faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.a
              href="/signup"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
            >
              <span>Start Collaborating Today</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.a>

            <motion.a
              href="#demo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Watch 2-Min Demo</span>
            </motion.a>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-white/50 text-sm mt-10"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Setup in 30 seconds</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] bg-repeat opacity-[0.02] pointer-events-none"></div>
    </section>
  );
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

export default AboutCTA; 