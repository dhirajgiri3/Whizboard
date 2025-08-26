"use client";

import React from "react";
import { motion } from "framer-motion";
import AboutHero from "./components/AboutHero";
import AboutStats from "./components/AboutStats";
import AboutMission from "./components/AboutMission";
import AboutTeam from "./components/AboutTeam";
import AboutTimeline from "./components/AboutTimeline";
import AboutCTA from "./components/AboutCTA";
import SmoothScrollProvider from "@/components/landing/SmoothScrollProvider";
import { DemoModalProvider } from "@/components/ui/modal/DemoModalProvider";
import { LANDING_CONTENT } from "@/lib/landing-content";

export default function AboutPage() {
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <SmoothScrollProvider>
      <DemoModalProvider
        videoUrl={LANDING_CONTENT.demoModal.videoUrl}
        title={LANDING_CONTENT.demoModal.title}
        description={LANDING_CONTENT.demoModal.description}
      >
        <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden pt-10">
          {/* Background Elements */}
          <motion.div 
            className="absolute inset-0 opacity-30"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={backgroundVariants}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px'
            }}></div>
          </motion.div>
          
          {/* Enhanced Gradient Orbs */}
          <motion.div 
            className="absolute top-1/4 left-1/4 w-96 h-96" 
            style={{
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
              filter: 'blur(60px)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80" 
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
              filter: 'blur(80px)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          
          {/* Additional subtle orbs */}
          <motion.div 
            className="absolute top-3/4 left-1/3 w-64 h-64" 
            style={{
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
              filter: 'blur(40px)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Page Content */}
          <main className="relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutHero />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutStats />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutMission />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutTeam />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutTimeline />
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={sectionVariants}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <AboutCTA />
            </motion.div>
          </main>
        </div>
      </DemoModalProvider>
    </SmoothScrollProvider>
  );
}
