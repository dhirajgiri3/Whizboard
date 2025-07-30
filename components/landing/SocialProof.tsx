"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect, useState } from "react";
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
  Play
} from "lucide-react";

const SocialProof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [scrollPosition, setScrollPosition] = useState(0);

  const testimonials = [
    {
      quote: "Our design review meetings went from 2-hour sessions to 30-minute collaborative breakthroughs. We're shipping features 40% faster.",
      author: "Sarah Chen",
      role: "Design Lead",
      company: "TechFlow",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "40% faster shipping"
    },
    {
      quote: "Finally, a whiteboard tool that doesn't crash during our most important client calls. Whizboard saved our biggest deal this quarter.",
      author: "Marcus Rodriguez",
      role: "Creative Director",
      company: "Creative Studios",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "Saved biggest deal"
    },
    {
      quote: "The real-time collaboration is game-changing. Our remote team feels like we're in the same room, even across time zones.",
      author: "Emily Johnson",
      role: "Product Manager",
      company: "InnovateCorp",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "Game-changing"
    },
    {
      quote: "We've reduced our design iteration time by 60%. The visual feedback and real-time collaboration are incredible.",
      author: "Alex Thompson",
      role: "UX Director",
      company: "DesignHub",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "60% faster iterations"
    },
    {
      quote: "Whizboard transformed how we brainstorm. Our team is more creative and productive than ever before.",
      author: "Lisa Wang",
      role: "Innovation Manager",
      company: "StartupXYZ",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "More creative & productive"
    },
    {
      quote: "The enterprise features are exactly what we needed. SSO integration and advanced security make it perfect for our organization.",
      author: "David Kim",
      role: "CTO",
      company: "Enterprise Inc",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      highlight: "Perfect for enterprise"
    }
  ];

  const metrics = [
    {
      number: "67%",
      label: "Faster decision-making",
      icon: TrendingUp,
      description: "Teams make decisions faster with visual collaboration"
    },
    {
      number: "45%",
      label: "Reduction in revision cycles",
      icon: Clock,
      description: "Less back-and-forth with real-time feedback"
    },
    {
      number: "89%",
      label: "Improvement in team engagement",
      icon: Users,
      description: "Higher participation in collaborative sessions"
    },
    {
      number: "150k+",
      label: "Active users worldwide",
      icon: Heart,
      description: "Growing community of creative professionals"
    }
  ];

  const companies = [
    { name: "TechFlow", logo: Rocket },
    { name: "Creative Studios", logo: Palette },
    { name: "InnovateCorp", logo: Lightbulb },
    { name: "DesignHub", logo: Building },
    { name: "StartupXYZ", logo: Zap },
    { name: "Enterprise Inc", logo: Building }
  ];

  const trustBadges = [
    {
      icon: Award,
      title: "SOC 2 Certified",
      description: "Enterprise security standards"
    },
    {
      icon: Zap,
      title: "99.9% Uptime",
      description: "Reliable performance guarantee"
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliant",
      description: "Data protection compliance"
    }
  ];

  // Infinite scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition(prev => prev + 1);
    }, 30); // Adjust speed here

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const testimonialVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section 
      ref={ref} 
      className="relative py-16 md:py-24 overflow-hidden bg-[#0A0A0B]"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
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
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users className="h-4 w-4 text-blue-400" />
            </motion.div>
            <span className="text-white/70 text-sm font-medium">Trusted by Teams Worldwide</span>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white leading-tight font-semibold tracking-tight text-center">
              Loved by
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                150,000+ Users
              </span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Join thousands of teams who have transformed their collaboration with Whizboard. 
              See what makes us the #1 choice for professional teams.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm">
            <div className="flex items-center space-x-2 text-white/60">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>4.9/5 average rating</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>98% customer satisfaction</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <Award className="h-4 w-4 text-blue-400" />
              <span>Industry leader</span>
            </div>
          </div>
        </motion.div>

        {/* Infinite Scrolling Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative mb-16"
        >
          {/* Fade Effects */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0A0A0B] to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Container */}
          <div className="overflow-hidden">
            <div 
              className="flex space-x-6"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                width: `${testimonials.length * 2 * 400}px`, // Double the content for seamless loop
              }}
            >
              {/* First set of testimonials */}
              {testimonials.map((testimonial, index) => (
                <div
                  key={`first-${index}`}
                  className="w-[380px] flex-shrink-0"
                >
                  <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden h-full">
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="relative">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.author}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-400/30 transition-colors"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                            <CheckCircle className="w-2 h-2 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{testimonial.author}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-white/60">{testimonial.role} at {testimonial.company}</p>
                        </div>
                      </div>
                      <blockquote className="text-white/80 leading-relaxed mb-4">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Verified review</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {testimonials.map((testimonial, index) => (
                <div
                  key={`second-${index}`}
                  className="w-[380px] flex-shrink-0"
                >
                  <div className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden h-full">
                    <div className="relative z-10">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="relative">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.author}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-400/30 transition-colors"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                            <CheckCircle className="w-2 h-2 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{testimonial.author}</h4>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-white/60">{testimonial.role} at {testimonial.company}</p>
                        </div>
                      </div>
                      <blockquote className="text-white/80 leading-relaxed mb-4">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>Verified review</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden h-[200px] flex flex-col justify-between">
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <metric.icon className="h-8 w-8 text-blue-400" />
                  </div>
                  
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {metric.number}
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {metric.label}
                  </h4>
                </div>
                
                <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors relative z-10">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-16"
        >
          {/* Trust badges */}
          <div className="text-center mb-12">
            <div className="flex flex-col items-center space-y-6 mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Enterprise Ready</span>
              </div>
              <h3 className="text-3xl font-semibold text-white">Trusted & Secure</h3>
              <p className="text-white/70 text-sm max-w-md text-center">Enterprise-grade security and compliance standards you can trust</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                  className="group relative"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden h-[180px] flex flex-col justify-between">
                    <div className="relative z-10">
                      <div className="inline-flex p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <badge.icon className="h-8 w-8 text-blue-400" />
                      </div>
                      
                      <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {badge.title}
                      </h4>
                    </div>
                    
                    <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors relative z-10">
                      {badge.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Companies Section */}
          <div className="text-center">
            <div className="flex flex-col items-center space-y-6 mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
                <Building className="h-4 w-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Global Trust</span>
              </div>
              <h3 className="text-3xl font-semibold text-white">
                Trusted by Leading Companies
              </h3>
              <p className="text-white/70 text-sm max-w-md text-center">Join thousands of companies worldwide who trust Whizboard</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {companies.map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                  className="group relative"
                  whileHover={{ y: -4, scale: 1.05 }}
                >
                  <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <company.logo className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                          {company.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <motion.div 
                className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <Rocket className="h-4 w-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Ready to Start?</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Team Collaboration?
              </h3>
              <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
                Join 150,000+ professionals who've already transformed their workflow. 
                Everything you need to create, collaborate, and convert ideas into action.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
                >
                  <span className="relative z-10">Get Started Free - No Credit Card Required</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.a>
                
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Book a Personalized Demo</span>
                </motion.a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Free migration from other tools</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Dedicated onboarding for teams</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
