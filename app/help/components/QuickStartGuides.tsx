"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Play, Keyboard, Star } from "lucide-react";
import Link from "next/link";
import { quickStartGuides } from "../data/helpData";

const QuickStartGuides = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const orbStyle = {
    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
    filter: 'blur(40px)',
    willChange: 'transform'
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial="initial"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm mb-4 sm:mb-6"
          >
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-white/70 text-xs sm:text-sm font-medium">Quick Start</span>
          </motion.div>

          {/* Header */}
          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2">
              Quick Start Guides
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 sm:px-6">
              Get up to speed quickly with these essential guides and tutorials
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {quickStartGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <motion.div
                key={guide.title}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="group"
              >
                <Link href={guide.href}>
                  <div className="group p-4 sm:p-6 lg:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm h-full relative">
                    {/* Gradient orb */}
                    <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                      <div className="w-full h-full rounded-full" style={orbStyle} />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className={`inline-flex p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${guide.color} border border-white/20 group-hover:scale-105 transition-transform duration-200 self-start`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-white">{guide.title}</h3>
                          <p className="text-white/70 leading-relaxed text-sm sm:text-base">{guide.description}</p>
                        </div>
                      </div>
                      
                      {/* CTA */}
                      <div className="flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start mt-auto">
                        <span className="text-xs sm:text-sm">Get Started</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover/link:translate-x-0.5 transition-transform duration-200" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default QuickStartGuides; 