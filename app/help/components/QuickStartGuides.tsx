"use client";

import React from "react";
import { motion, cubicBezier, type Variants } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { quickStartGuides } from "../data/helpData";

const QuickStartGuides = () => {
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: cubicBezier(0.4, 0, 0.2, 1)
      }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-4"
          >
            <Star className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Quick Start</span>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
              Quick Start Guides
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              Get up to speed quickly with these essential guides and tutorials
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {quickStartGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <motion.div
                key={guide.title}
                variants={fadeInUp}
                className="group"
              >
                <Link href={guide.href} className="block h-full">
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm h-full">
                    <div className="h-full flex flex-col">
                      {/* Icon Container */}
                      <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors mb-4 self-start">
                        <Icon className="h-6 w-6 text-blue-400" />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-3 mb-6">
                        <h3 className="text-lg font-semibold text-white">{guide.title}</h3>
                        <p className="text-white/70 text-sm leading-relaxed">{guide.description}</p>
                      </div>
                      
                      {/* CTA */}
                      <div className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start mt-auto">
                        <span>Get Started</span>
                        <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
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