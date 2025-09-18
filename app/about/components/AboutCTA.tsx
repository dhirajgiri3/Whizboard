"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle, Shield, Rocket } from "lucide-react";
import { useDemoModal } from "@/components/ui/modal/DemoModalProvider";
import CTAButton from "@/components/ui/buttons/CTAButton";
import TrustIndicators from "@/components/ui/TrustIndicators";
import { LANDING_CONTENT } from "@/lib/landing-content";

const AboutCTA = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  const { openDemo } = useDemoModal();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-gray-500/1 to-gray-500/2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      {/* Background Grid */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </motion.div>
      
      {/* Minimal Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
        style={{
          background: 'radial-gradient(circle, rgba(115, 115, 115, 0.1) 0%, rgba(115, 115, 115, 0.02) 50%, transparent 70%)',
          filter: 'blur(50px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden h-[80vh] flex items-center justify-center"
        >
          {/* Enhanced Dynamic Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B]/90 via-blue-600/30 to-[#0F0F10]/90 backdrop-blur-3xl rounded-[2rem] border-none shadow-none outline-none"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          
          {/* Enhanced Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-500/50 blur-3xl"
              animate={{
                scale: [1, 1.25, 1],
                rotate: [0, 180, 360],
                x: [0, 40, 0],
                y: [0, -25, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/30 to-blue-500/50 blur-3xl"
              animate={{
                scale: [1.15, 1, 1.15],
                rotate: [360, 180, 0],
                x: [0, -25, 0],
                y: [0, 35, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </div>

          <div className="relative z-10 text-center px-8 lg:px-16 flex flex-col gap-12 lg:gap-16">
            {/* Minimal Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={headerVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Redesigned Header - Ready to get started? */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4 sm:gap-6"
              >
                {/* Badge */}
                <motion.div
                  variants={itemVariants}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                >
                  <Rocket className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                  <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                    Get Started
                  </span>
                </motion.div>

                <div className="flex flex-col items-center gap-2">
                  {/* Title */}
                  <motion.h3
                    variants={itemVariants}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap justify-center items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight text-center"
                  >
                    <span>Ready to transform your</span>
                    <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                      collaboration?
                    </span>
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    variants={itemVariants}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white/60 text-base max-w-xl mx-auto font-light leading-relaxed text-center"
                  >
                    Join thousands of teams worldwide who are transforming their collaboration with Whizboard. Start your journey to better brainstorming, seamless teamwork, and breakthrough innovation today.
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>

            {/* Minimal CTA Buttons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <CTAButton
                  href="/login"
                  variant="white"
                  size="lg"
                  theme="about"
                  className="px-12 py-5 rounded-full"
                >
                  {LANDING_CONTENT.ctaButtons.about}
                </CTAButton>
              </motion.div>

              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <CTAButton
                  variant="ghost"
                  size="lg"
                  icon="play"
                  onClick={openDemo}
                  theme="about"
                  className="px-12 py-5"
                >
                  {LANDING_CONTENT.ctaButtons.seeDemo}
                </CTAButton>
              </motion.div>
            </motion.div>

            {/* Minimal Trust Indicators */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16"
            >
              <TrustIndicators 
                indicators={[
                  {
                    icon: CheckCircle,
                    text: "No credit card required",
                    color: "text-emerald-400",
                  },
                  {
                    icon: Shield,
                    text: "Bank-level security",
                    color: "text-blue-400",
                  },
                  {
                    icon: Zap,
                    text: "Setup in 30 seconds",
                    color: "text-blue-400",
                  },
                ]}
                variant="horizontal"
                size="sm"
                className="text-white/50"
                withMotion={false}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutCTA; 