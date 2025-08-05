"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, X } from "lucide-react";

interface HelpHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

const HelpHero = ({ searchQuery, onSearchChange, onClearSearch }: HelpHeroProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const gradientStyle = {
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: "24px 24px",
  };

  const orbStyle = {
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
    filter: 'blur(40px)',
    willChange: 'transform'
  };

  const neutralOrbStyle = {
    background: 'radial-gradient(circle, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.03) 50%, transparent 70%)',
    filter: 'blur(50px)',
    willChange: 'transform'
  };

  const suggestions = ["Getting Started", "Collaboration", "Troubleshooting", "Keyboard Shortcuts"];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 sm:pt-20 lg:pt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-950" />
      
      {/* Grid Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.4 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="w-full h-full" style={gradientStyle} />
      </motion.div>

      {/* Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.3 }}
      >
        <div className="w-full h-full rounded-full" style={orbStyle} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.6 }}
      >
        <div className="w-full h-full rounded-full" style={neutralOrbStyle} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          className="text-center max-w-4xl mx-auto w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm mb-4 sm:mb-6"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-white/70 text-xs sm:text-sm font-medium">Help & Documentation</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-4 sm:mb-6 px-2"
          >
            How Can We{" "}
            <motion.span
              className="inline-block bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent bg-[length:200%_100%]"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              Help You?
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto px-4 sm:px-6"
          >
            Find answers to your questions, learn new features, and master WhizBoard 
            with our comprehensive documentation and tutorials.
          </motion.p>

          {/* Search */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto w-full px-4 sm:px-6"
          >
            <div className="relative group">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 sm:w-5 sm:h-5 group-focus-within:text-blue-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, or features..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg text-white placeholder-white/40 transition-all duration-200 hover:bg-white/[0.08] hover:border-white/[0.12]"
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors duration-200"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            
            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: searchQuery ? 0 : 1, y: searchQuery ? 10 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2"
            >
              <span className="text-xs sm:text-sm text-white/50">Popular:</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSearchChange(suggestion)}
                  className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/[0.05]"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HelpHero; 