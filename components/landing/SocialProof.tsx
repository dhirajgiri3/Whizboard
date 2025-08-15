"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Star,
  Quote,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Award,
  Heart,
  Zap,
  Rocket,
  Palette,
  Lightbulb,
  Building,
  ArrowRight,
  Play,
  Shield,
  Globe,
  Target,
  Layers,
  Crown,
} from "lucide-react";
import SectionHeader from "@/components/ui/header/SectionHeader";
import { useDemoModal } from "@/components/ui/modal/DemoModalProvider";
import CTAButton from "@/components/ui/buttons/CTAButton";
import TrustIndicators from "@/components/ui/TrustIndicators";
import { LANDING_CONTENT } from "@/lib/landing-content";

// CSS animations for testimonials
const testimonialStyles = `
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .testimonial-container {
    animation: scroll-left 45s linear infinite;
  }
  
  .testimonial-container:hover {
    animation-play-state: paused;
  }
  
  .testimonial-card {
    transition: all 0.3s ease;
  }
  
  .testimonial-card:hover {
    transform: translateY(-4px);
  }
`;

const SocialProof = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { openDemo } = useDemoModal();

  const testimonials = LANDING_CONTENT.socialProof.testimonials;

  const metrics = LANDING_CONTENT.socialProof.metrics;

  const companies = [
    { name: "Design Teams", logo: "Palette" as const, color: "text-blue-400" },
    {
      name: "Engineering Teams",
      logo: "Target" as const,
      color: "text-blue-400",
    },
    {
      name: "Product Teams",
      logo: "Lightbulb" as const,
      color: "text-emerald-400",
    },
    {
      name: "Remote Teams",
      logo: "Globe" as const,
      color: "text-yellow-400",
    },
    {
      name: "Startup Teams",
      logo: "Rocket" as const,
      color: "text-emerald-400",
    },
    {
      name: "Enterprise Teams",
      logo: "Building" as const,
      color: "text-cyan-400",
    },
  ];

  const trustBadges = [
    {
      title: "Best Practices",
      description: "Secure by design",
      icon: "Shield" as const,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      color: "border-blue-500/30",
    },
    {
      title: "Privacy Respect",
      description: "Data protection & privacy",
      icon: "CheckCircle" as const,
      gradient: "from-emerald-400/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      color: "border-emerald-500/30",
    },
    {
      title: "Reliability",
      description: "Built for uptime",
      icon: "TrendingUp" as const,
      gradient: "from-gray-500/20 to-blue-400/20",
      iconColor: "text-blue-400",
      color: "border-blue-500/30",
    },
    {
      title: "Helpful Support",
      description: "We respond during business hours",
      icon: "Heart" as const,
      gradient: "from-red-600/20 to-gray-500/20",
      iconColor: "text-red-600",
      color: "border-red-600/30",
    },
  ];

  // Unified reveal variants (first-time only)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
        ease: "easeOut",
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    },
  } as const;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: testimonialStyles }} />
      <section
        ref={ref}
        className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-[#0A0A0B]"
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/4 via-transparent to-gray-600/3"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-25"></div>
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[60px]"
            style={{
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.04) 50%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col gap-16 lg:gap-20"
          >
            {/* Enhanced Floating Metrics Cards */}
            <div className="text-center flex flex-col gap-8">
              <SectionHeader
                badge={{
                  icon: TrendingUp,
                  text: "Why teams try Whizboard",
                }}
                title="Built for collaborative teams"
                description="We’re launching soon. Here’s what early users like about Whizboard."
                stats={[
                  {
                    icon: Users,
                    text: "Real-time collaboration",
                    color: "text-blue-400",
                  },
                  {
                    icon: Star,
                    text: "Simple, clean UI",
                    color: "text-yellow-400",
                  },
                  {
                    icon: Award,
                    text: "Modern stack",
                    color: "text-emerald-400",
                  },
                ]}
                disableAnimation={true}
              />

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
              >
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    className="group relative h-full"
                    variants={itemVariants}
                    whileHover={{
                      y: -4,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" },
                    }}
                  >
                    <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 overflow-hidden h-full flex flex-col">
                      {/* Subtle hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                      <div className="relative z-10 text-center flex flex-col items-center gap-4 flex-grow">
                        <motion.div
                          className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.06] group-hover:border-white/[0.08] transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {metric.icon === "Users" && (
                            <Users
                              className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`}
                            />
                          )}
                          {metric.icon === "TrendingUp" && (
                            <TrendingUp
                              className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`}
                            />
                          )}
                          {metric.icon === "Star" && (
                            <Star
                              className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`}
                            />
                          )}
                          {metric.icon === "Clock" && (
                            <Clock
                              className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`}
                            />
                          )}
                        </motion.div>

                        <div className="flex flex-col gap-2 flex-grow justify-center">
                          <motion.div
                            className="text-3xl font-bold text-white"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            {metric.value}
                          </motion.div>
                          <div className="text-sm font-medium text-white/70">
                            {metric.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Enhanced Infinite Scrolling Testimonials with Edge Fading */}
            <div className="relative overflow-hidden flex flex-col gap-12">
              <motion.div variants={itemVariants} className="text-center">
                {/* Redesigned Header - What Our Users Say */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center gap-4 sm:gap-6"
                >
                  {/* Badge */}
                  <motion.div
                    variants={itemVariants}
                    className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                  >
                    <Quote className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      User Feedback - Mock Data
                    </span>
                  </motion.div>

                  <div className="flex flex-col items-center gap-1">
                    {/* Title */}
                    <motion.h3
                      variants={itemVariants}
                      className="text-3xl md:text-4xl font-bold text-white leading-[1.1] tracking-tight text-center"
                    >
                      What Our Users Say
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      variants={itemVariants}
                      className="text-white/60 text-base max-w-lg mx-auto leading-relaxed text-center"
                    >
                      Real feedback from teams and professionals who've transformed their collaboration workflow with Whizboard during our beta program.
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Testimonial Container with Infinite Horizontal Scroll */}
              <div className="relative group">
                {/* Left Edge Fade */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>

                {/* Right Edge Fade */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>

                {/* Enhanced Testimonial Cards Container with Infinite Scroll */}
                <div className="relative h-80 overflow-hidden">
                  <div
                    className="testimonial-container flex gap-6 absolute"
                    style={{
                      width: `${
                        testimonials.length * 3 * 320 +
                        (testimonials.length * 3 - 1) * 24
                      }px`,
                    }}
                  >
                    {/* Duplicate testimonials for seamless loop */}
                    {[...testimonials, ...testimonials, ...testimonials].map(
                      (testimonial, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={
                            isInView
                              ? { opacity: 1, y: 0, scale: 1 }
                              : { opacity: 0, y: 20, scale: 0.95 }
                          }
                          transition={{
                            delay: 0.8 + (index % testimonials.length) * 0.1,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                          className="testimonial-card flex-shrink-0 w-80 bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.15] group/card relative overflow-hidden"
                        >
                          {/* Enhanced gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                          {/* Subtle glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 rounded-2xl blur-sm"></div>

                          <div className="relative z-10">
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 text-yellow-400 fill-current transition-transform duration-300 group-hover/card:scale-110"
                                />
                              ))}
                            </div>
                            <blockquote className="text-white/80 text-sm leading-relaxed mb-4 group-hover/card:text-white/90 transition-colors duration-300">
                              {testimonial.content}
                            </blockquote>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110">
                                <span className="text-white font-semibold text-sm">
                                  {testimonial.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <div className="text-white/90 font-medium text-sm group-hover/card:text-white transition-colors duration-300">
                                  {testimonial.name}
                                </div>
                                <div className="text-white/50 text-xs group-hover/card:text-white/70 transition-colors duration-300">
                                  {testimonial.role} at {testimonial.company}
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Enhanced floating particles effect */}
                          <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
                          <div
                            className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-purple-400/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1200 animate-pulse"
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                        </motion.div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Trust & Security Section */}
            <div className="text-center flex flex-col gap-8">
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center gap-8"
              >
                {/* Redesigned Header - Built for Trust & Security */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center gap-4 sm:gap-6"
                >
                  {/* Badge */}
                  <motion.div
                    variants={itemVariants}
                    className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
                  >
                    <Shield className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      Enterprise Security
                    </span>
                  </motion.div>

                  <div className="flex flex-col gap-1 sm:gap-1.5 items-center">
                    {/* Title */}
                    <motion.h3
                      variants={itemVariants}
                      className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight text-center"
                    >
                      Built for
                      <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                        Trust & Security
                      </span>
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      variants={itemVariants}
                      className="text-white/60 text-base max-w-lg text-center leading-relaxed"
                    >
                      Your data security is our top priority. We maintain the
                      highest standards of protection and compliance.
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Enhanced Trust & Security Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Background gradient effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(16, 185, 129, 0.07) 50%, transparent 70%)",
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                {trustBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group relative h-full"
                    whileHover={{
                      y: -10,
                      scale: 1.05,
                      rotateY: index % 2 === 0 ? 5 : -5,
                      rotateX: 2,
                      transition: { duration: 0.4, ease: "easeOut" },
                    }}
                    style={{ perspective: "1200px" }}
                  >
                    <div
                      className={`relative bg-white/[0.03] backdrop-blur-xl border ${badge.color} rounded-2xl p-8 hover:bg-white/[0.05] hover:border-opacity-70 transition-all duration-500 overflow-hidden shadow-lg shadow-black/5 group-hover:shadow-xl group-hover:shadow-black/10 h-full flex flex-col`}
                    >
                      {/* Enhanced hover glow effect */}
                      <div
                        className={`absolute inset-0 ${badge.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl`}
                      />

                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('/grid-pattern-dark.svg')]"></div>

                      <div className="relative z-10 text-center flex flex-col items-center gap-5 flex-grow">
                        <div className="relative">
                          {/* Glow effect behind icon */}
                          <div
                            className={`absolute inset-0 rounded-xl ${badge.gradient.replace(
                              "/20",
                              "/10"
                            )} blur-md opacity-70 group-hover:opacity-100 group-hover:blur-lg transition-all duration-500`}
                          ></div>

                          <motion.div
                            className={`relative flex items-center justify-center w-16 h-16 rounded-xl bg-white/[0.06] border border-white/[0.12] group-hover:bg-white/[0.09] group-hover:border-white/[0.18] transition-all duration-400 backdrop-blur-sm`}
                            whileHover={{
                              rotate: [0, -5, 5, 0],
                              scale: 1.12,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {badge.icon === "Shield" && (
                              <Shield
                                className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`}
                              />
                            )}
                            {badge.icon === "CheckCircle" && (
                              <CheckCircle
                                className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`}
                              />
                            )}
                            {badge.icon === "TrendingUp" && (
                              <TrendingUp
                                className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`}
                              />
                            )}
                            {badge.icon === "Heart" && (
                              <Heart
                                className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`}
                              />
                            )}

                            {/* Inner glow effect */}
                            <div
                              className={`absolute inset-0 rounded-xl ${badge.iconColor.replace(
                                "text",
                                "bg"
                              )}/5 opacity-0 group-hover:opacity-100 transition-all duration-500`}
                            ></div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col gap-2 flex-grow justify-center">
                          <motion.div
                            className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            {badge.title}
                          </motion.div>
                          <motion.div
                            className="text-sm text-white/60 group-hover:text-white/70 leading-relaxed transition-colors duration-300"
                            initial={{ opacity: 0.9 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {badge.description}
                          </motion.div>
                        </div>
                      </div>

                      {/* Enhanced status indicator with animation */}
                      <div className="absolute top-3 right-3 flex items-center justify-center">
                        <motion.div
                          className={`w-2 h-2 ${badge.iconColor.replace(
                            "text",
                            "bg"
                          )} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600`}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0, 0.8, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 1,
                          }}
                        />
                        <motion.div
                          className={`absolute w-3 h-3 ${badge.iconColor.replace(
                            "text",
                            "bg"
                          )}/30 rounded-full opacity-0 group-hover:opacity-80`}
                          animate={{
                            scale: [1, 2.5, 1],
                            opacity: [0, 0.3, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2,
                          }}
                        />
                      </div>

                      {/* Multiple floating particle effects */}
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800" />
                      <div
                        className="absolute bottom-5 right-5 w-0.5 h-0.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Revolutionary CTA Section */}
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden h-[80vh] flex items-center justify-center"
            >
              {/* Enhanced Dynamic Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B]/90 via-blue-600/30 to-[#0F0F10]/90 backdrop-blur-3xl rounded-[2rem] border-none shadow-none outline-none" />
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
                    ease: "easeInOut",
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
                    ease: "easeInOut",
                  }}
                />
              </div>

              <div className="relative z-10 text-center px-8 lg:px-16 flex flex-col gap-12 lg:gap-16">
                {/* Minimal Header */}
                <motion.div variants={itemVariants}>
                  {/* Redesigned Header - Ready to get started? */}
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center gap-4 sm:gap-6"
                  >
                    {/* Badge */}
                    <motion.div
                      variants={itemVariants}
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
                        className="flex flex-wrap justify-center items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight text-center"
                      >
                        <span>Ready to get</span>
                        <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                          started?
                        </span>
                      </motion.h3>

                      {/* Description */}
                      <motion.p
                        variants={itemVariants}
                        className="text-white/60 text-base max-w-xl mx-auto font-light leading-relaxed text-center"
                      >
                        Join thousands of teams worldwide who are transforming
                        their collaboration with Whizboard. Start your journey
                        to better brainstorming, seamless teamwork, and
                        breakthrough innovation today.
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Minimal CTA Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                >
                  <CTAButton
                    href="/login"
                    variant="white"
                    size="lg"
                    theme="social-proof"
                    className="px-12 py-5 rounded-full"
                  >
                    {LANDING_CONTENT.ctaButtons.social}
                  </CTAButton>

                  <CTAButton
                    variant="ghost"
                    size="lg"
                    icon="play"
                    onClick={openDemo}
                    theme="social-proof"
                    className="px-12 py-5"
                  >
                    {LANDING_CONTENT.ctaButtons.seeDemo}
                  </CTAButton>
                </motion.div>

                {/* Minimal Trust Indicators */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 mt-8"
                >
                  <TrustIndicators />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default SocialProof;
