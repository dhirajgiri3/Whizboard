"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect, useState } from "react";
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
  BarChart3,
  Crown,
  Infinity
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SocialProof = () => {
  const ref = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);
  const stackingCardsRef = useRef<HTMLDivElement>(null);
  
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [scrollPosition, setScrollPosition] = useState(0);

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
      content: "Whizboard's integration capabilities saved us countless hours. It's become an essential part of our development workflow.",
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
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
      description: "Professionals worldwide"
    },
    {
      value: "99.9%",
      label: "Uptime",
      icon: "TrendingUp" as const,
      gradient: "from-emerald-400 to-emerald-600",
      iconColor: "text-emerald-400",
      description: "Reliable performance"
    },
    {
      value: "4.9/5",
      label: "User Rating",
      icon: "Star" as const,
      gradient: "from-yellow-400 to-orange-500",
      iconColor: "text-yellow-400",
      description: "Customer satisfaction"
    },
    {
      value: "<2min",
      label: "Setup Time",
      icon: "Clock" as const,
      gradient: "from-gray-500 to-blue-400",
      iconColor: "text-blue-400",
      description: "Quick onboarding"
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
      // Floating cards animation with improved easing
      if (floatingCardsRef.current) {
        gsap.to(floatingCardsRef.current.children, {
          y: "random(-15, 15)",
          x: "random(-8, 8)",
          rotation: "random(-3, 3)",
          duration: "random(4, 6)",
          repeat: 999999,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.3
        });
      }

      // Enhanced stacking cards scroll animation
      if (stackingCardsRef.current) {
        const cards = stackingCardsRef.current.children;
        gsap.set(cards, { y: (i) => i * 15 });
        
        gsap.to(cards, {
          y: (i) => -i * 80,
          scale: (i) => 1 - i * 0.03,
          scrollTrigger: {
            trigger: stackingCardsRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
          }
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

      // Enhanced trust badges parallax
      if (trustRef.current) {
        gsap.to(trustRef.current.children, {
          y: (i) => (i % 2 === 0 ? -25 : 25),
          scrollTrigger: {
            trigger: trustRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            toggleActions: "play none none reverse"
          }
        });
      }

      // Improved Infinite Testimonial Scroll
      const testimonialContainer = document.querySelector('.testimonial-scroll-container');
      const testimonialWidth = 352;
      const totalTestimonialsWidth = testimonialWidth * testimonials.length;

      gsap.to(testimonialContainer, {
        x: `-=${totalTestimonialsWidth}`,
        ease: "none",
        duration: 25,
        repeat: -1,
        modifiers: {
          x: gsap.utils.wrap(-totalTestimonialsWidth, 0)
        }
      });

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
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.7,
        ease: Power3.easeOut
      }
    }
  };

  const testimonialVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20, rotateX: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.7,
        ease: Power3.easeOut
      }
    }
  };

  return (
    <section 
      ref={ref} 
      className="relative py-24 md:py-32 overflow-hidden bg-[#0A0A0B]"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/4 via-transparent to-gray-600/3"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-25"></div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: 999999,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: 999999,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-32"
        >
          {/* Enhanced Floating Metrics Cards */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.2, duration: 0.9 }}
              className="flex flex-col items-center space-y-8 mb-20"
            >
              <motion.div 
                className="inline-flex items-center space-x-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full px-6 py-3"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: 999999, 
                    ease: "easeInOut" 
                  }}
                >
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                </motion.div>
                <span className="text-white/70 text-sm font-medium">Trusted by Thousands</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Numbers That
                <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Speak Volumes
                </span>
              </h2>
              
              <p className="text-white/60 text-lg md:text-xl max-w-3xl text-center leading-relaxed">
                Join a thriving community of professionals who've transformed their workflow with Whizboard. 
                <span className="text-white/80 font-medium">See why teams choose us for their most important projects.</span>
              </p>
            </motion.div>

            {/* Enhanced Floating Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute top-20 left-10 w-32 h-32 rounded-full blur-[40px] bg-gradient-to-r from-blue-500/15 to-cyan-500/15"
                animate={{
                  x: [0, 80, 0],
                  y: [0, -40, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{
                  duration: 18,
                  repeat: 999999,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute bottom-20 right-10 w-24 h-24 rounded-full blur-[30px] bg-gradient-to-r from-gray-500/15 to-blue-400/15"
                animate={{
                  x: [0, -60, 0],
                  y: [0, 50, 0],
                  scale: [1.05, 1, 1.05]
                }}
                transition={{
                  duration: 15,
                  repeat: 999999,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div ref={floatingCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 50 }}
                  transition={{ 
                    delay: 0.4 + index * 0.12, 
                    duration: 0.8,
                    ease: Power3.easeOut
                  }}
                  className="group relative"
                  whileHover={{ 
                    y: -12, 
                    scale: 1.03,
                    rotateY: 3,
                    rotateX: 2,
                    transition: { duration: 0.4, ease: Power2.easeOut }
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <div className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 overflow-hidden">
                    {/* Enhanced glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-700 rounded-3xl`} />
                    
                    <div className="relative z-10 text-center space-y-5">
                      <motion.div 
                        className={`inline-flex p-4 rounded-2xl bg-white/[0.08] border border-white/[0.12] group-hover:scale-105 transition-transform duration-400`}
                        whileHover={{ 
                          rotate: [0, -8, 8, 0],
                          scale: 1.15
                        }}
                        transition={{ duration: 0.6 }}
                      >
                        {metric.icon === "Users" && <Users className={`w-8 h-8 ${metric.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {metric.icon === "TrendingUp" && <TrendingUp className={`w-8 h-8 ${metric.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {metric.icon === "Star" && <Star className={`w-8 h-8 ${metric.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {metric.icon === "Clock" && <Clock className={`w-8 h-8 ${metric.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                      </motion.div>
                      
                      <div>
                        <div className="text-4xl font-bold text-white mb-2 counter">
                          {metric.value}
                        </div>
                        <div className="text-lg font-semibold text-white/90 mb-1">
                          {metric.label}
                        </div>
                        <div className="text-sm text-white/50">
                          {metric.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced floating particles */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-white/15 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Infinite Scrolling Testimonials */}
          <div className="relative overflow-hidden py-16">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.6, duration: 0.9 }}
              className="text-center mb-16"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                What Our Users Say
              </h3>
              <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                Real feedback from real users who've transformed their workflow with Whizboard.
              </p>
            </motion.div>

            <div className="relative h-80 overflow-hidden">
              <div
                className="flex space-x-6 absolute testimonial-scroll-container"
              >
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={testimonialVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.8 + (index % testimonials.length) * 0.1 }}
                    className="flex-shrink-0 w-80 bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-400"
                    whileHover={{ scale: 1.02, y: -3 }}
                  >
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-white/80 text-sm leading-relaxed mb-4">
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-white/90 font-medium text-sm">{testimonial.name}</div>
                        <div className="text-white/50 text-xs">{testimonial.role} at {testimonial.company}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Trust & Security Section */}
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.7, duration: 0.9 }}
              className="flex flex-col items-center space-y-8 mb-20"
            >
              <motion.div 
                className="inline-flex items-center space-x-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full px-6 py-3"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: 999999, 
                    ease: "easeInOut" 
                  }}
                >
                  <Shield className="h-5 w-5 text-emerald-400" />
                </motion.div>
                <span className="text-white/70 text-sm font-medium">Enterprise Security</span>
              </motion.div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                Built for
                <span className="block bg-gradient-to-r from-emerald-400 via-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Trust & Security
                </span>
              </h3>
              
              <p className="text-white/60 text-lg max-w-2xl text-center leading-relaxed">
                Your data security is our top priority. We maintain the highest standards of protection and compliance.
              </p>
            </motion.div>

            {/* Enhanced Stacking Trust Cards */}
            <div ref={stackingCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 50 }}
                  transition={{ 
                    delay: 0.8 + index * 0.12, 
                    duration: 0.7,
                    ease: Power3.easeOut
                  }}
                  className="group relative"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    rotateY: 5,
                    rotateX: 3,
                    transition: { duration: 0.4, ease: Power2.easeOut }
                  }}
                  style={{ perspective: "1000px" }}
                >
                  <div className={`relative bg-white/[0.02] backdrop-blur-xl border ${badge.color} rounded-2xl p-6 hover:bg-white/[0.04] hover:border-opacity-60 transition-all duration-500 overflow-hidden`}>
                    {/* Enhanced hover glow effect */}
                    <div className={`absolute inset-0 ${badge.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl`} />
                    
                    <div className="relative z-10 text-center space-y-4">
                      <motion.div 
                        className={`inline-flex p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] group-hover:scale-105 transition-transform duration-400`}
                        whileHover={{ 
                          rotate: [0, -5, 5, 0],
                          scale: 1.12
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {badge.icon === "Shield" && <Shield className={`w-6 h-6 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {badge.icon === "CheckCircle" && <CheckCircle className={`w-6 h-6 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {badge.icon === "TrendingUp" && <TrendingUp className={`w-6 h-6 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                        {badge.icon === "Heart" && <Heart className={`w-6 h-6 ${badge.iconColor} group-hover:scale-110 transition-transform duration-300`} />}
                      </motion.div>
                      
                      <div>
                        <div className="text-lg font-semibold text-white/90 mb-2">
                          {badge.title}
                        </div>
                        <div className="text-sm text-white/50">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced status indicator */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
                    
                    {/* Enhanced floating particle effect */}
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-white/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Companies Showcase */}
          <div className="text-center mb-28">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: 0.8, duration: 0.9 }}
              className="flex flex-col items-center space-y-8 mb-20"
            >
              <motion.div 
                className="inline-flex items-center space-x-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-full px-6 py-3"
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: 999999, 
                    ease: "easeInOut" 
                  }}
                >
                  <Globe className="h-5 w-5 text-blue-400" />
                </motion.div>
                <span className="text-white/70 text-sm font-medium">Trusted Globally</span>
              </motion.div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                Powering Innovation at
                <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Leading Companies
                </span>
              </h3>
              
              <p className="text-white/60 text-lg max-w-2xl text-center leading-relaxed">
                From startups to Fortune 500 companies, teams worldwide choose Whizboard for their most important collaborations.
              </p>
            </motion.div>

            {/* Enhanced Floating Company Grid */}
            <div className="relative">
              {/* Enhanced background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[60px] bg-gradient-to-r from-blue-500/8 to-blue-400/8 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 25,
                    repeat: 999999,
                    ease: "linear"
                  }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {companies.map((company, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 50 }}
                    transition={{ 
                      delay: 0.9 + index * 0.12, 
                      duration: 0.7,
                      ease: Power3.easeOut
                    }}
                    className="group relative"
                    whileHover={{ 
                      y: -10, 
                      scale: 1.05,
                      rotateY: 8,
                      rotateX: 4,
                      transition: { duration: 0.4, ease: Power2.easeOut }
                    }}
                    style={{ perspective: "1000px" }}
                  >
                    <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 overflow-hidden">
                      {/* Enhanced hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-blue-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-600 rounded-2xl" />
                      
                      <div className="relative z-10 flex flex-col items-center space-y-4">
                        <motion.div 
                          className="p-4 rounded-xl bg-white/[0.06] border border-white/[0.1] group-hover:scale-105 transition-transform duration-400"
                          whileHover={{ 
                            rotate: [0, -8, 8, 0],
                            scale: 1.15
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          {company.logo === "Building" && <Building className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                          {company.logo === "Palette" && <Palette className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                          {company.logo === "Target" && <Target className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                          {company.logo === "Lightbulb" && <Lightbulb className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                          {company.logo === "Crown" && <Crown className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                          {company.logo === "Layers" && <Layers className={`w-8 h-8 ${company.color} group-hover:scale-110 transition-transform duration-300`} />}
                        </motion.div>
                        
                        <div className="text-center">
                          <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                            {company.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced subtle particle effect */}
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600" />
                      <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-500/25 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-800" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Revolutionary CTA Section */}
          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 1.2, duration: 1.1, ease: Power3.easeOut }}
            className="relative overflow-hidden"
          >
            {/* Enhanced Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B]/60 via-blue-600/20 to-[#0F0F10]/60 backdrop-blur-3xl rounded-[2rem] border border-white/[0.06]" />
            
            {/* Enhanced Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
              <motion.div 
                className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/15 to-blue-400/15 blur-3xl"
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [0, 180, 360],
                  x: [0, 40, 0],
                  y: [0, -25, 0]
                }}
                transition={{
                  duration: 18,
                  repeat: 999999,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-400/15 to-blue-500/15 blur-3xl"
                animate={{
                  scale: [1.15, 1, 1.15],
                  rotate: [360, 180, 0],
                  x: [0, -25, 0],
                  y: [0, 35, 0]
                }}
                transition={{
                  duration: 15,
                  repeat: 999999,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div className="relative z-10 text-center p-16 lg:p-20">
              {/* Enhanced Header Section */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={isInView ? { opacity: 1, y: 0 } : { y: 40, opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.9 }}
                className="mb-16"
              >
                <motion.div 
                  className="inline-flex items-center space-x-3 bg-white/[0.06] border border-white/[0.1] rounded-full px-6 py-3 mb-10 backdrop-blur-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: 999999, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Zap className="h-5 w-5 text-blue-400" />
                  </motion.div>
                  <span className="text-white/80 text-sm font-medium">Transform Your Workflow</span>
                </motion.div>
                
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                  Ready to
                  <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                    Revolutionize
                  </span>
                  Your Team?
                </h3>
                
                <p className="text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
                  Join over 50,000+ teams who've transformed their collaboration with Whizboard. 
                  <span className="text-white/80 font-medium">Start your journey to seamless productivity today.</span>
                </p>
              </motion.div>
              
              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                transition={{ delay: 1.6, duration: 0.9 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              >
                {/* Enhanced Primary CTA */}
                <motion.button
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-12 py-6 rounded-2xl transition-all duration-500 shadow-2xl"
                  whileHover={{ 
                    scale: 1.03, 
                    y: -3,
                    boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center space-x-3 text-lg">
                    <span>Start Free Trial</span>
                    <motion.div
                      className="group-hover:translate-x-1 transition-transform duration-300"
                      whileHover={{ x: 3 }}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </span>
                  
                  {/* Enhanced animated border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-600 blur-sm" />
                  <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700" />
                </motion.button>
                
                {/* Enhanced Secondary CTA */}
                <motion.button
                  className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-white font-semibold px-12 py-6 rounded-2xl transition-all duration-500 backdrop-blur-xl"
                  whileHover={{ 
                    scale: 1.03, 
                    y: -3,
                    boxShadow: "0 20px 40px -12px rgba(255, 255, 255, 0.08)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center space-x-3 text-lg">
                    <Play className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    <span>Watch Demo</span>
                  </span>
                </motion.button>
              </motion.div>
              
              {/* Enhanced Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ delay: 1.8, duration: 0.9 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                {[
                  { icon: CheckCircle, text: "No credit card required", color: "text-emerald-400" },
                  { icon: Shield, text: "Enterprise-grade security", color: "text-blue-400" },
                  { icon: Zap, text: "Setup in under 5 minutes", color: "text-yellow-400" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-center space-x-3 text-white/60 group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`${item.color} group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>
                    <span className="font-medium group-hover:text-white/80 transition-colors duration-300">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
