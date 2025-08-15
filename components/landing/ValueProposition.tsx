"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  Zap,
  Users,
  Shield,
  CheckCircle,
  Link,
  BookOpen,
  UserCheck,
  FolderOpen,
  DollarSign,
  Monitor,
  Rocket,
  Zap as Lightning,
  RefreshCw,
  Save,
  Gift,
  Smartphone as Mobile,
  TrendingUp,
  CheckCircle2,
  Cloud,
  HelpCircle,
  ChevronDown,
  Target,
  Clock,
  X,
  Star,
  Lock,
  ArrowRight,
  Play,
} from "lucide-react";
import SectionHeader from "@/components/ui/header/SectionHeader";
import { useDemoModal } from "@/components/ui/modal/DemoModalProvider";
import CTAButton from "@/components/ui/buttons/CTAButton";
import TrustIndicators from "@/components/ui/TrustIndicators";
import FeatureCard from "@/components/ui/cards/FeatureCard";
import { LANDING_CONTENT } from "@/lib/landing-content";

// Enhanced scrollbar styles with performant CSS animation and smoother fades
const enhancedScrollbarStyles = `
  /* Infinite Vertical Scroll Animation using CSS transforms */
  @keyframes scroll-up {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-50%);
    }
  }
  
  .animate-scroll-up {
    /* Increased duration for a smoother, professional scroll speed */
    animation: scroll-up 50s linear infinite;
  }
  
  .animate-scroll-up:hover {
    animation-play-state: paused;
  }
  
  .scroll-content {
    display: flex;
    flex-direction: column;
  }
  
  .scroll-content > * {
    flex-shrink: 0;
  }

  /* Enhanced fade effects - Taller with a smoother gradient */
  .fade-edge-enhanced-top {
    background: linear-gradient(to bottom, 
      rgba(10, 10, 11, 0.9) 0%, 
      rgba(10, 10, 11, 0.7) 30%, 
      transparent 100%);
    height: 50px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    pointer-events: none;
  }
  
  .fade-edge-enhanced-bottom {
    background: linear-gradient(to top, 
      rgba(10, 10, 11, 0.9) 0%, 
      rgba(10, 10, 11, 0.7) 30%, 
      transparent 100%);
    height: 80px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    pointer-events: none;
  }
  
  .scroll-indicator {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const ValueProposition = () => {
  // Unified viewport options for first-time-only reveal on scroll
  const viewportOptions = { once: true, amount: 0.2 } as const;

  // Enhanced traditional approach items with professional icons
  const traditionalItems = [
    {
      text: "Disconnected tools",
      icon: Link,
      description: "Switching between apps constantly",
      severity: "high",
    },
    {
      text: "Complex setup",
      icon: BookOpen,
      description: "Weeks of training required",
      severity: "high",
    },
    {
      text: "Limited collaboration",
      icon: UserCheck,
      description: "Delayed team updates",
      severity: "medium",
    },
    {
      text: "Version control issues",
      icon: FolderOpen,
      description: "Lost work and conflicts",
      severity: "high",
    },
    {
      text: "Expensive licensing",
      icon: DollarSign,
      description: "High monthly costs",
      severity: "medium",
    },
    {
      text: "Poor mobile support",
      icon: Mobile,
      description: "Limited functionality",
      severity: "medium",
    },
    {
      text: "No cloud sync",
      icon: Cloud,
      description: "Work stuck on devices",
      severity: "high",
    },
    {
      text: "Outdated interface",
      icon: Monitor,
      description: "Clunky and slow",
      severity: "medium",
    },
    {
      text: "Limited integrations",
      icon: Link,
      description: "Isolated from other tools",
      severity: "medium",
    },
    {
      text: "Poor support",
      icon: HelpCircle,
      description: "Slow response times",
      severity: "high",
    },
    {
      text: "Limited insights",
      icon: TrendingUp,
      description: "Missing visibility",
      severity: "medium",
    },
    {
      text: "Security issues",
      icon: Shield,
      description: "Outdated protocols",
      severity: "high",
    },
  ];

  // Enhanced Whizboard solution items with professional icons
  const whizboardItems = [
    {
      text: "Unified collaborative platform",
      icon: Rocket,
      description: "Everything you need in one place",
      benefit: "high",
    },
    {
      text: "Intuitive design, instant productivity",
      icon: Lightning,
      description: "Start creating immediately",
      benefit: "high",
    },
    {
      text: "Real-time collaboration",
      icon: RefreshCw,
      description: "Live updates and cursors",
      benefit: "high",
    },
    {
      text: "Auto-save & sync",
      icon: Save,
      description: "Never lose your work",
      benefit: "high",
    },
    {
      text: "Free plan available",
      icon: Gift,
      description: "Start using immediately",
      benefit: "medium",
    },
    {
      text: "Works on any device",
      icon: Mobile,
      description: "Responsive design",
      benefit: "high",
    },
    {
      text: "Cloud-native platform",
      icon: Cloud,
      description: "Access from anywhere",
      benefit: "high",
    },
    {
      text: "Modern interface",
      icon: Monitor,
      description: "Smooth performance",
      benefit: "high",
    },
    {
      text: "Seamless integrations",
      icon: Link,
      description: "Connects with your tools",
      benefit: "medium",
    },
    {
      text: "Expert customer support",
      icon: HelpCircle,
      description: "Available when you need us",
      benefit: "high",
    },
    {
      text: "Collaboration analytics",
      icon: TrendingUp,
      description: "Deep visibility",
      benefit: "medium",
    },
    {
      text: "Enterprise security",
      icon: Shield,
      description: "SOC 2 compliant",
      benefit: "high",
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Precision Drawing",
      description:
        "Professional drawing tools with accurate controls for detailed designs and diagrams.",
      metric: "Accurate controls",
      stats: "Easy to iterate",
      iconColor: "text-blue-400",
      gradient: "from-blue-600/10 to-blue-400/5",
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description:
        "Work together with live cursors, instant updates, and team presence indicators.",
      metric: "Live cursors",
      stats: "Instant sync",
      iconColor: "text-emerald-400",
      gradient: "from-emerald-600/10 to-emerald-400/5",
    },
    {
      icon: Zap,
      title: "Lightning Fast Performance",
      description:
        "Optimized performance for smooth drawing, even with complex boards.",
      metric: "Smooth rendering",
      stats: "Fast loading",
      iconColor: "text-amber-400",
      gradient: "from-amber-600/10 to-amber-400/5",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Instant Access",
      description:
        "Start collaborating in seconds with any modern browser. No downloads required.",
      highlight: "Zero Setup",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "SOC 2 compliant with end-to-end encryption and advanced access controls.",
      highlight: "Secure by design",
    },
    {
      icon: Target,
      title: "AI-Powered Features",
      description:
        "Smart shape recognition, auto-formatting, and intelligent collaboration suggestions.",
      highlight: "Coming Soon",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const { openDemo } = useDemoModal();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: enhancedScrollbarStyles }} />
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden bg-[#0A0A0B]">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.015] dot-pattern"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[60px] opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full filter blur-[80px] opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-0">
          {/* Main Value Proposition */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="flex flex-col items-center gap-3 sm:gap-4"
          >
            <SectionHeader
              badge={{
                icon: Rocket,
                text: "Why Choose Whizboard",
              }}
              title="Transform Ideas Into Actionable Plans"
              description="Stop struggling with scattered thoughts and chaotic brainstorms. Our professional-grade collaborative whiteboard transforms creative chaos into organized, actionable outcomes."
              disableAnimation={true}
            />
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="grid md:grid-cols-3 gap-8 lg:gap-10 mt-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <FeatureCard
                  icon={benefit.icon}
                  title={benefit.title}
                  description={benefit.description}
                  gradient={benefit.gradient}
                  iconColor={benefit.iconColor}
                  stats={{ time: benefit.stats }}
                  size="lg"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Traditional Approach & Whizboard Solution */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col gap-10 pt-20"
          >
            <div className="text-center flex flex-col gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-3 sm:space-y-4"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                >
                  <Target className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                  <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                    Whizboard Solution
                  </span>
                </motion.div>

                <div className="flex flex-col items-center gap-1">
                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight text-center"
                  >
                    Why Teams Choose{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                      Whizboard
                    </span>
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-white/70 max-w-xl leading-[1.6] text-sm sm:text-base text-center"
                  >
                    See the difference between traditional tools and our modern
                    approach to collaborative whiteboarding.
                  </motion.p>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Comparison Grid - Bento Style with Infinite Scroll */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 auto-rows-[500px]">
              {/* Traditional Approach - Large Card with Infinite Scroll */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
                className="lg:col-span-5 group"
              >
                <div className="relative h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                  {/* Subtle Gradient Orb Background */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full filter blur-[60px] opacity-20 group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 70%)",
                    }}
                  ></div>

                  {/* Enhanced Header */}
                  <div className="relative z-10 flex items-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mr-6 border border-red-500/20 group-hover:scale-105 transition-transform duration-300">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Traditional Approach
                      </h3>
                      <p className="text-white/60 text-sm font-medium">
                        Outdated, fragmented tools
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-red-400/80 text-xs font-medium">
                          Inefficient workflow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Infinite Vertical Scroll Container with Fading Edges */}
                  <div className="relative z-10 h-80 overflow-hidden rounded-2xl">
                    <div className="scroll-content space-y-3 pb-4 animate-scroll-up">
                      {/* Duplicate items for seamless loop (original + clone) */}
                      {[...traditionalItems, ...traditionalItems].map(
                        (item, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200 group/item ${
                              item.severity === "high"
                                ? "border-red-500/20 hover:border-red-500/30"
                                : item.severity === "medium"
                                ? "border-orange-500/20 hover:border-orange-500/30"
                                : "border-yellow-500/20 hover:border-yellow-500/30"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200 ${
                                item.severity === "high"
                                  ? "bg-red-500/10 border border-red-500/20"
                                  : item.severity === "medium"
                                  ? "bg-orange-500/10 border border-orange-500/20"
                                  : "bg-yellow-500/10 border border-yellow-500/20"
                              }`}
                            >
                              <item.icon
                                className={`w-5 h-5 ${
                                  item.severity === "high"
                                    ? "text-red-400"
                                    : item.severity === "medium"
                                    ? "text-orange-400"
                                    : "text-yellow-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-white/90 text-sm font-medium">
                                {item.text}
                              </div>
                              <div className="text-white/50 text-xs">
                                {item.description}
                              </div>
                            </div>
                            <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Enhanced Fade Overlays */}
                    <div className="fade-edge-enhanced-top rounded-t-2xl"></div>
                    <div className="fade-edge-enhanced-bottom rounded-b-2xl"></div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/40 text-xs pointer-events-none">
                      <ChevronDown className="w-3 h-3 scroll-indicator" />
                      <span>Auto-scroll</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* VS Divider */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="lg:col-span-2 flex items-center justify-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-white/[0.05] rounded-full flex items-center justify-center border border-white/[0.1] backdrop-blur-sm">
                    <span className="text-white/60 font-bold text-xl">VS</span>
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-500/10 animate-pulse"></div>
                </div>
              </motion.div>

              {/* Whizboard Solution - Large Card with Infinite Scroll */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
                className="lg:col-span-5 group"
              >
                <div className="relative h-full bg-white/[0.02] backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                  {/* Subtle Gradient Orb Background */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full filter blur-[60px] opacity-20 group-hover:scale-110 transition-transform duration-500"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)",
                    }}
                  ></div>

                  {/*Header */}
                  <div className="relative z-10 flex items-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mr-6 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                      <CheckCircle2 className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Whizboard Solution
                      </h3>
                      <p className="text-blue-400/80 text-sm font-medium">
                        Modern, unified platform
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-400/80 text-xs font-medium">
                          Streamlined workflow
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Infinite Vertical Scroll Container with Fading Edges */}
                  <div className="relative z-10 h-80 overflow-hidden">
                    <div className="scroll-content space-y-3 pb-4 animate-scroll-up">
                      {/* Duplicate items for seamless loop (original + clone) */}
                      {[...whizboardItems, ...whizboardItems].map(
                        (item, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200 group/item ${
                              item.benefit === "high"
                                ? "border-emerald-500/20 hover:border-emerald-500/30"
                                : item.benefit === "medium"
                                ? "border-blue-500/20 hover:border-blue-500/30"
                                : "border-cyan-500/20 hover:border-cyan-500/30"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200 ${
                                item.benefit === "high"
                                  ? "bg-emerald-500/10 border border-emerald-500/20"
                                  : item.benefit === "medium"
                                  ? "bg-blue-500/10 border border-blue-500/20"
                                  : "bg-cyan-500/10 border border-cyan-500/20"
                              }`}
                            >
                              <item.icon
                                className={`w-5 h-5 ${
                                  item.benefit === "high"
                                    ? "text-emerald-400"
                                    : item.benefit === "medium"
                                    ? "text-blue-400"
                                    : "text-cyan-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-white/90 text-sm font-medium">
                                {item.text}
                              </div>
                              <div className="text-white/50 text-xs">
                                {item.description}
                              </div>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Enhanced Fade Overlays */}
                    <div className="fade-edge-enhanced-top"></div>
                    <div className="fade-edge-enhanced-bottom"></div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/40 text-xs pointer-events-none">
                      <ChevronDown className="w-3 h-3 scroll-indicator" />
                      <span>Auto-scroll</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="text-center flex flex-col gap-8 pt-24 pb-6"
          >
            {/* Redesigned Header */}
            <SectionHeader
              badge={{
                icon: Rocket,
                text: "Complete Toolkit",
              }}
              title="Everything You Need to Succeed"
              description="Professional-grade features designed for modern teams and workflows"
              useCases={[
                "Rapidly iterate on designs and ideas",
                "Simplify complex project planning",
                "Facilitate engaging remote workshops",
              ]}
              disableAnimation={true}
            />

            <motion.div
              variants={containerVariants}
              className="grid md:grid-cols-3 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                >
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    size="md"
                    variant="centered"
                    className="text-center"
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Minimalistic CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOptions}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="relative overflow-hidden h-[80vh] flex items-center justify-center mt-4"
          >
            {/* Enhanced Dynamic Background with Emerald Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B]/90 via-emerald-600/30 to-[#0F0F10]/90 backdrop-blur-3xl rounded-[2rem]" />

            {/* Enhanced Animated Background Elements with Emerald Glow */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
              <motion.div
                className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-600/30 to-emerald-500/50 blur-3xl"
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [0, 180, 360],
                  x: [0, 40, 0],
                  y: [0, -25, 0],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-600/30 to-emerald-500/50 blur-3xl"
                animate={{
                  scale: [1.15, 1, 1.15],
                  rotate: [360, 180, 0],
                  x: [0, -25, 0],
                  y: [0, 35, 0],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="relative z-10 text-center px-8 lg:px-16 flex flex-col gap-12 lg:gap-16">
              {/* Minimal Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOptions}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-4 sm:gap-6"
                >
                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true }}
                    className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                  >
                    <Zap className="h-3.5 w-3.5 text-emerald-400/80 group-hover:text-emerald-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      Early Access
                    </span>
                  </motion.div>

                  <div className="flex flex-col items-center gap-2">
                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="flex flex-wrap justify-center items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight text-center"
                    >
                      <span>Get Started</span>
                      <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                        Free
                      </span>
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-white/60 text-base max-w-xl mx-auto font-light leading-relaxed text-center"
                    >
                      Create and collaborate for free during early access. No
                      credit card required.
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Minimal CTA with Whiteboard Comparison */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={viewportOptions}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-8 justify-center items-center"
              >
                <CTAButton
                  href="/login"
                  variant="white"
                  size="lg"
                  theme="value-prop"
                  className="px-12 py-5 rounded-full"
                >
                  {LANDING_CONTENT.ctaButtons.benefits}
                </CTAButton>

                {/* Supportive note */}
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
              </motion.div>

              {/* Alternative CTA */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={viewportOptions}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-center"
              >

                <CTAButton
                  variant="ghost"
                  size="lg"
                  icon="play"
                  onClick={openDemo}
                  theme="value-prop"
                  className="px-12"
                >
                  {LANDING_CONTENT.ctaButtons.demo}
                </CTAButton>
              </motion.div>

              {/* Minimal Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={viewportOptions}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20"
              >
                <TrustIndicators />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ValueProposition;
