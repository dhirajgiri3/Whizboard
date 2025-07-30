"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote, TrendingUp, Users, Clock, CheckCircle, Award, Heart, Zap } from "lucide-react";

const SocialProof = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    }
  ];

  const metrics = [
    {
      number: "67%",
      label: "Faster decision-making",
      icon: TrendingUp,
      gradient: "from-green-400/20 to-emerald-500/20",
      iconColor: "text-green-400",
      description: "Teams make decisions faster with visual collaboration"
    },
    {
      number: "45%",
      label: "Reduction in revision cycles",
      icon: Clock,
      gradient: "from-blue-400/20 to-purple-500/20",
      iconColor: "text-blue-400",
      description: "Less back-and-forth with real-time feedback"
    },
    {
      number: "89%",
      label: "Improvement in team engagement",
      icon: Users,
      gradient: "from-orange-400/20 to-red-500/20",
      iconColor: "text-orange-400",
      description: "Higher participation in collaborative sessions"
    },
    {
      number: "150k+",
      label: "Active users worldwide",
      icon: Heart,
      gradient: "from-purple-400/20 to-pink-500/20",
      iconColor: "text-purple-400",
      description: "Growing community of creative professionals"
    }
  ];

  const companies = [
    { name: "TechFlow", logo: "🚀" },
    { name: "Creative Studios", logo: "🎨" },
    { name: "InnovateCorp", logo: "💡" },
    { name: "DesignHub", logo: "✨" },
    { name: "StartupXYZ", logo: "⚡" },
    { name: "Enterprise Inc", logo: "🏢" }
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

  return (
    <section 
      ref={ref} 
      className="relative py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0B 0%, #0F0F10 25%, #141416 50%, #1A1A1C 75%, #0A0A0B 100%)",
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.02) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-8"
          >
            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Loved by Teams Worldwide</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Real Results from{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Real Teams
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Join 150,000+ professionals who've transformed their collaboration and accelerated their success with Whizboard
          </p>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden h-full">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* Rating and highlight */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
                      {testimonial.highlight}
                    </span>
                  </div>

                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-blue-400 mb-6 opacity-60" />
                  
                  {/* Testimonial text */}
                  <p className="text-white/80 leading-relaxed mb-8 text-lg group-hover:text-white/90 transition-colors">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-white/60">{testimonial.role} at {testimonial.company}</p>
                    </div>
                  </div>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-4 gap-8 mb-24"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group text-center"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <metric.icon className={`h-8 w-8 ${metric.iconColor}`} />
                  </div>
                  
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {metric.number}
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {metric.label}
                  </h4>
                  
                  <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                    {metric.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-24"
        >
          {/* Trust badges */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex p-3 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-4">
                  <badge.icon className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  {badge.title}
                </h4>
                <p className="text-white/60 text-sm">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Companies */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-8">
              Trusted by Leading Companies
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {companies.map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="flex items-center space-x-3 bg-white/[0.02] border border-white/[0.08] rounded-lg px-6 py-3 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                >
                  <span className="text-2xl">{company.logo}</span>
                  <span className="text-lg font-medium text-white/80">{company.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span className="relative z-10">Get Started Free - No Credit Card Required</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center justify-center"
                >
                  Book a Personalized Demo
                </motion.a>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Free migration from other tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
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
