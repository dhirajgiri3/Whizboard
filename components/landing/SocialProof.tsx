"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { gsap, Power3, Power2 } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  Crown
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const metricsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);
  const testimonialContainerRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow",
      content: "Whizboard transformed how our team collaborates. The intuitive interface and powerful features have increased our productivity by 40%.",
      rating: 5,
      avatar: "/avatars/sarah.jpg"
    },
    {
      name: "Marcus Rodriguez",
      role: "Design Lead",
      company: "CreativeStudio",
      content: "The real-time collaboration features are game-changing. Our design process has never been smoother or more efficient.",
      rating: 5,
      avatar: "/avatars/marcus.jpg"
    },
    {
      name: "Emily Watson",
      role: "Engineering Manager",
      company: "DevCorp",
      content: "Whizboard&apos;s integration capabilities saved us countless hours. It&apos;s become an essential part of our development workflow.",
      rating: 5,
      avatar: "/avatars/emily.jpg"
    },
    {
      name: "David Kim",
      role: "Startup Founder",
      company: "InnovateLab",
      content: "As a growing startup, Whizboard scales perfectly with our needs. The pricing is fair and the features are enterprise-grade.",
      rating: 5,
      avatar: "/avatars/david.jpg"
    },
    {
      name: "Lisa Thompson",
      role: "Marketing Director",
      company: "BrandForge",
      content: "The analytics and reporting features give us insights we never had before. Our campaign planning is now data-driven and precise.",
      rating: 5,
      avatar: "/avatars/lisa.jpg"
    },
    {
      name: "Alex Johnson",
      role: "Operations Head",
      company: "LogiFlow",
      content: "Whizboard streamlined our entire operations workflow. The automation features alone have saved us 20+ hours per week.",
      rating: 5,
      avatar: "/avatars/alex.jpg"
    }
  ];

  const metrics = [
    {
      value: "150K+",
      label: "Active Users",
      icon: "Users" as const,
      iconColor: "text-blue-400"
    },
    {
      value: "99.9%",
      label: "Uptime",
      icon: "TrendingUp" as const,
      iconColor: "text-emerald-400"
    },
    {
      value: "4.9/5",
      label: "User Rating",
      icon: "Star" as const,
      iconColor: "text-yellow-400"
    },
    {
      value: "<2min",
      label: "Setup Time",
      icon: "Clock" as const,
      iconColor: "text-blue-400"
    }
  ];

  const companies = [
    { name: "TechFlow", logo: "Building" as const, color: "text-blue-400" },
    { name: "CreativeStudio", logo: "Palette" as const, color: "text-blue-400" },
    { name: "DevCorp", logo: "Target" as const, color: "text-emerald-400" },
    { name: "InnovateLab", logo: "Lightbulb" as const, color: "text-yellow-400" },
    { name: "BrandForge", logo: "Crown" as const, color: "text-emerald-400" },
    { name: "LogiFlow", logo: "Layers" as const, color: "text-cyan-400" }
  ];

  const trustBadges = [
    {
      title: "SOC 2 Certified",
      description: "Enterprise security standards",
      icon: "Shield" as const,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      color: "border-blue-500/30"
    },
    {
      title: "GDPR Compliant",
      description: "Data protection & privacy",
      icon: "CheckCircle" as const,
      gradient: "from-emerald-400/20 to-emerald-600/20",
      iconColor: "text-emerald-400",
      color: "border-emerald-500/30"
    },
    {
      title: "99.9% Uptime",
      description: "Reliable & always available",
      icon: "TrendingUp" as const,
      gradient: "from-gray-500/20 to-blue-400/20",
      iconColor: "text-blue-400",
      color: "border-blue-500/30"
    },
    {
      title: "24/7 Support",
      description: "Expert help when you need it",
      icon: "Heart" as const,
      gradient: "from-red-600/20 to-gray-500/20",
      iconColor: "text-red-600",
      color: "border-red-600/30"
    }
  ];

  useEffect(() => {
    if (!isInView) return;

    const ctx = gsap.context(() => {
      // Enhanced floating cards animation
      if (floatingCardsRef.current) {
        gsap.to(floatingCardsRef.current.children, {
          y: "random(-8, 8)",
          x: "random(-3, 3)",
          rotation: "random(-0.5, 0.5)",
          duration: "random(6, 8)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.4
        });
      }



      // Enhanced metrics counter animation
      if (metricsRef.current) {
        const counters = metricsRef.current.querySelectorAll('.counter');
        counters.forEach((counter) => {
          const target = parseFloat(counter.textContent || "0");
          gsap.fromTo(counter,
            { textContent: 0 },
            {
              textContent: target,
              duration: 2.5,
              ease: "power3.out",
              snap: { textContent: 1 },
              scrollTrigger: {
                trigger: counter,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            }
          );
        });
      }

      // Simple trust badges parallax
      if (trustRef.current) {
        gsap.to(trustRef.current.children, {
          y: (i) => (i % 2 === 0 ? -10 : 10),
          scrollTrigger: {
            trigger: trustRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        });
      }

      // Enhanced Infinite Testimonial Scroll with CSS animation
      if (testimonialContainerRef.current) {
        // The animation is now handled by CSS for smoother performance
        // and better hover pause functionality
      }

    });

    return () => {
      ctx.revert();
    };
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };



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
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.04) 50%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
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
            <div className="text-center flex flex-col gap-12 lg:gap-16">
              <SectionHeader
                badge={{
                  icon: TrendingUp,
                  text: "Trusted by Thousands"
                }}
                title="Numbers That Speak Volumes"
                description="Join a thriving community of professionals who've transformed their workflow with Whizboard. Experience unparalleled productivity gains and see why teams across industries trust us to deliver exceptional results, day after day."
                stats={[
                  { icon: Users, text: "150k+ active users", color: "text-blue-400" },
                  { icon: Star, text: "4.9/5 rating", color: "text-yellow-400" },
                  { icon: Award, text: "Industry leader", color: "text-emerald-400" }
                ]}
                disableAnimation={true}
              />

              <motion.div 
                ref={floatingCardsRef} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    className="group relative"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ 
                      delay: 1.0 + (index * 0.1), 
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -4,
                      scale: 1.02,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 overflow-hidden">
                      {/* Subtle hover glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                      <div className="relative z-10 text-center flex flex-col items-center gap-4">
                        <motion.div
                          className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.06] group-hover:bg-white/[0.06] group-hover:border-white/[0.08] transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {metric.icon === "Users" && (
                            <Users className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`} />
                          )}
                          {metric.icon === "TrendingUp" && (
                            <TrendingUp className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`} />
                          )}
                          {metric.icon === "Star" && (
                            <Star className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`} />
                          )}
                          {metric.icon === "Clock" && (
                            <Clock className={`w-6 h-6 ${metric.iconColor} transition-all duration-300`} />
                          )}
                        </motion.div>

                        <div className="flex flex-col gap-2">
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
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 0.6, duration: 0.9 }}
                className="text-center"
              >
                {/* Redesigned Header - What Our Users Say */}
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
                    <Quote className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      User Feedback
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold text-white leading-[1.1] tracking-tight text-center"
                  >
                    What Our Users Say
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed text-center"
                  >
                    Real feedback from real users who&apos;ve transformed their workflow with Whizboard.
                  </motion.p>
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
                    ref={testimonialContainerRef}
                    className="testimonial-container flex gap-6 absolute"
                    style={{
                      width: `${(testimonials.length * 3) * 320 + (testimonials.length * 3 - 1) * 24}px`
                    }}
                  >
                    {/* Duplicate testimonials for seamless loop */}
                    {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ 
                          delay: 0.8 + (index % testimonials.length) * 0.1,
                          duration: 0.6,
                          ease: "easeOut"
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
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current transition-transform duration-300 group-hover/card:scale-110" />
                            ))}
                          </div>
                          <blockquote className="text-white/80 text-sm leading-relaxed mb-4 group-hover/card:text-white/90 transition-colors duration-300">
                            {testimonial.content}
                          </blockquote>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110">
                              <span className="text-white font-semibold text-sm">
                                {testimonial.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-white/90 font-medium text-sm group-hover/card:text-white transition-colors duration-300">{testimonial.name}</div>
                              <div className="text-white/50 text-xs group-hover/card:text-white/70 transition-colors duration-300">{testimonial.role} at {testimonial.company}</div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced floating particles effect */}
                        <div className="absolute top-4 right-4 w-1 h-1 bg-blue-400/50 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000 animate-pulse"></div>
                        <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-purple-400/50 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-1200 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Trust & Security Section */}
            <div className="text-center flex flex-col gap-16 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 0.7, duration: 0.9 }}
                className="flex flex-col items-center gap-8"
              >
                {/* Redesigned Header - Built for Trust & Security */}
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
                    <Shield className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      Enterprise Security
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight text-center"
                  >
                    Built for
                    <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                      Trust & Security
                    </span>
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-white/60 text-lg max-w-2xl text-center leading-relaxed"
                  >
                    Your data security is our top priority. We maintain the highest standards of protection and compliance.
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Enhanced Trust & Security Cards */}
              <div ref={trustRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Background gradient effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div 
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(16, 185, 129, 0.07) 50%, transparent 70%)'
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                {trustBadges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 50, rotateX: 15 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0, rotateX: 0 } : { opacity: 0, scale: 0.9, y: 50, rotateX: 15 }}
                    transition={{
                      delay: 0.8 + index * 0.12,
                      duration: 0.8,
                      ease: Power3.easeOut
                    }}
                    className="group relative"
                    whileHover={{
                      y: -10,
                      scale: 1.05,
                      rotateY: index % 2 === 0 ? 5 : -5,
                      rotateX: 2,
                      transition: { duration: 0.4, ease: Power2.easeOut }
                    }}
                    style={{ perspective: "1200px" }}
                  >
                    <div className={`relative bg-white/[0.03] backdrop-blur-xl border ${badge.color} rounded-2xl p-8 hover:bg-white/[0.05] hover:border-opacity-70 transition-all duration-500 overflow-hidden shadow-lg shadow-black/5 group-hover:shadow-xl group-hover:shadow-black/10`}>
                      {/* Enhanced hover glow effect */}
                      <div className={`absolute inset-0 ${badge.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl`} />
                      
                      {/* Subtle pattern overlay */}
                      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('/grid-pattern-dark.svg')]"></div>

                      <div className="relative z-10 text-center flex flex-col items-center gap-5">
                        <div className="relative">
                          {/* Glow effect behind icon */}
                          <div className={`absolute inset-0 rounded-xl ${badge.gradient.replace('/20', '/10')} blur-md opacity-70 group-hover:opacity-100 group-hover:blur-lg transition-all duration-500`}></div>
                          
                          <motion.div
                            className={`relative flex items-center justify-center w-16 h-16 rounded-xl bg-white/[0.06] border border-white/[0.12] group-hover:bg-white/[0.09] group-hover:border-white/[0.18] transition-all duration-400 backdrop-blur-sm`}
                            whileHover={{
                              rotate: [0, -5, 5, 0],
                              scale: 1.12
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            {badge.icon === "Shield" && <Shield className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                            {badge.icon === "CheckCircle" && <CheckCircle className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                            {badge.icon === "TrendingUp" && <TrendingUp className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                            {badge.icon === "Heart" && <Heart className={`w-8 h-8 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                            
                            {/* Inner glow effect */}
                            <div className={`absolute inset-0 rounded-xl ${badge.iconColor.replace('text', 'bg')}/5 opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col gap-2">
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
                          className={`w-2 h-2 ${badge.iconColor.replace('text', 'bg')} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600`}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0, 0.8, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 1
                          }}
                        />
                        <motion.div 
                          className={`absolute w-3 h-3 ${badge.iconColor.replace('text', 'bg')}/30 rounded-full opacity-0 group-hover:opacity-80`}
                          animate={{
                            scale: [1, 2.5, 1],
                            opacity: [0, 0.3, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.2
                          }}
                        />
                      </div>

                      {/* Multiple floating particle effects */}
                      <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800" />
                      <div className="absolute bottom-5 right-5 w-0.5 h-0.5 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{animationDelay: '0.3s'}} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Enhanced Companies Showcase */}
            <div className="text-center flex flex-col gap-16 lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-8"
              >
                {/* Redesigned Header - Powering Innovation at Leading Companies */}
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
                    <Globe className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                    <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                      Trusted Globally
                    </span>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight text-center"
                  >
                    Powering Innovation at
                    <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                      Leading Companies
                    </span>
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-white/60 text-lg max-w-2xl text-center leading-relaxed"
                  >
                    From startups to Fortune 500 companies, teams worldwide choose Whizboard for their most important collaborations.
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Premium Company Grid */}
              <div className="relative">
                {/* Animated Background Orb */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-96 h-96 gradient-orb-blue transform -translate-x-1/2 -translate-y-1/2"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
                  {companies.map((company, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{
                        delay: 0.9 + index * 0.1,
                        duration: 0.6,
                        ease: "easeOut"
                      }}
                      className="group relative"
                      whileHover={{
                        y: -8,
                        transition: { duration: 0.3, ease: "easeOut" }
                      }}
                    >
                      <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 overflow-hidden">
                        {/* Subtle Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <motion.div
                            className="p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-300"
                            whileHover={{
                              scale: 1.05
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {company.logo === "Building" && <Building className={`w-6 h-6 ${company.color}`} />}
                            {company.logo === "Palette" && <Palette className={`w-6 h-6 ${company.color}`} />}
                            {company.logo === "Target" && <Target className={`w-6 h-6 ${company.color}`} />}
                            {company.logo === "Lightbulb" && <Lightbulb className={`w-6 h-6 ${company.color}`} />}
                            {company.logo === "Crown" && <Crown className={`w-6 h-6 ${company.color}`} />}
                            {company.logo === "Layers" && <Layers className={`w-6 h-6 ${company.color}`} />}
                          </motion.div>

                          <div className="text-center">
                            <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                              {company.name}
                            </div>
                          </div>
                        </div>

                        {/* Minimal Status Indicator */}
                        <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-70 transition-opacity duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Revolutionary CTA Section */}
            <motion.div
              ref={ctaRef}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
              transition={{ delay: 1.2, duration: 0.8, ease: Power3.easeOut }}
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
                    y: [0, -25, 0]
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/30 to-blue-500/50 blur-3xl"
                  animate={{
                    scale: [1.15, 1, 1.15],
                    rotate: [360, 180, 0],
                    x: [0, -25, 0],
                    y: [0, 35, 0]
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              <div className="relative z-10 text-center px-8 lg:px-16 flex flex-col gap-12 lg:gap-16">
                {/* Minimal Header */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  {/* Redesigned Header - Ready to get started? */}
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
                      <Rocket className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
                      <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                        Get Started
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="flex flex-wrap justify-center items-center gap-3 text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight text-center"
                    >
                      <span>Ready to get</span>
                      <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                        started?
                      </span>
                    </motion.h3>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-white/60 text-xl max-w-2xl mx-auto font-light leading-relaxed text-center"
                    >
                      Join thousands of teams building better together.
                    </motion.p>
                  </motion.div>
                </motion.div>

                {/* Minimal CTA Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                  <motion.button
                    className="bg-white text-black font-medium px-10 py-4 rounded-full transition-all duration-300 hover:bg-white/90"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2 text-lg">
                      <span>Start building</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>

                  <motion.button
                    className="text-white/80 hover:text-white font-medium px-10 py-4 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center gap-2 text-lg">
                      <Play className="w-5 h-5" />
                      <span>View demo</span>
                    </span>
                  </motion.button>
                </motion.div>

                {/* Minimal Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-white/50 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Quick setup</span>
                  </div>
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
