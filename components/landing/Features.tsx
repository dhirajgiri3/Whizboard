"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  PenTool, 
  Users, 
  Shield, 
  Globe, 
  Layers, 
  Download,
  Share2,
  Palette,
  Type,
  Square,
  MessageSquare,
  Image,
  FileText,
  ArrowRight,
  Play,
  Zap,
  CheckCircle,
  TrendingUp,
  Star,
  Clock,
  Award
} from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 0,
      title: "Drawing & Design",
      description: "Express ideas naturally with customizable tools",
      icon: PenTool,
      color: "from-blue-600 to-blue-500",
      gradient: "from-blue-600/20 to-blue-500/20",
      accent: "blue",
      details: [
        "Professional pen tools with pressure sensitivity",
        "Highlighter and marker options",
        "Customizable brush sizes and styles",
        "Eraser with precision control",
        "Undo/redo with unlimited history"
      ],
      demo: "https://example.com/drawing-demo",
      stats: { users: "50k+", rating: "4.9", time: "2x faster" }
    },
    {
      id: 1,
      title: "Real-Time Collaboration",
      description: "See exactly where teammates are working",
      icon: Users,
      color: "from-blue-500 to-blue-400",
      gradient: "from-blue-500/20 to-blue-400/20",
      accent: "blue",
      details: [
        "Live cursor tracking for all participants",
        "Instant sync across all devices",
        "Zero-conflict editing with operational transformation",
        "Real-time notifications and presence indicators",
        "Role-based permissions and access control"
      ],
      demo: "https://example.com/collaboration-demo",
      stats: { users: "25k+", rating: "4.8", time: "Real-time" }
    },
    {
      id: 2,
      title: "Advanced Canvas",
      description: "Navigate and organize large, complex boards",
      icon: Layers,
      color: "from-blue-600 to-blue-500",
      gradient: "from-blue-600/20 to-blue-500/20",
      accent: "blue",
      details: [
        "Infinite zoom and pan capabilities",
        "Layer management and organization",
        "Presentation mode for client meetings",
        "Auto-save with version history",
        "Grid and snap-to-grid functionality"
      ],
      demo: "https://example.com/canvas-demo",
      stats: { users: "30k+", rating: "4.7", time: "Unlimited" }
    },
    {
      id: 3,
      title: "Cross-Platform",
      description: "Work seamlessly across all devices",
      icon: Globe,
      color: "from-blue-500 to-blue-400",
      gradient: "from-blue-500/20 to-blue-400/20",
      accent: "blue",
      details: [
        "Browser-based with no downloads required",
        "Mobile-optimized touch interface",
        "Keyboard shortcuts for power users",
        "Touch gestures for tablets and phones",
        "Offline mode with sync when reconnected"
      ],
      demo: "https://example.com/platform-demo",
      stats: { users: "40k+", rating: "4.9", time: "Any device" }
    },
    {
      id: 4,
      title: "Security & Compliance",
      description: "Enterprise-grade security you can trust",
      icon: Shield,
      color: "from-blue-600 to-blue-500",
      gradient: "from-blue-600/20 to-blue-500/20",
      accent: "blue",
      details: [
        "SOC 2 Type II compliance",
        "End-to-end encryption",
        "Google OAuth integration",
        "Role-based access control",
        "Audit logs and activity tracking"
      ],
      demo: "https://example.com/security-demo",
      stats: { users: "15k+", rating: "4.9", time: "99.9% uptime" }
    }
  ];

  const tools = [
    { icon: PenTool, name: "Pen Tool", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "Pressure sensitive" },
    { icon: Square, name: "Shapes", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "Perfect geometry" },
    { icon: Type, name: "Text", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "Rich formatting" },
    { icon: MessageSquare, name: "Sticky Notes", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "Quick thoughts" },
    { icon: Image, name: "Images", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "High resolution" },
    { icon: FileText, name: "Documents", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "PDF support" },
    { icon: Palette, name: "Color Picker", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "16M colors" },
    { icon: Share2, name: "Share", color: "text-blue-400", bgColor: "bg-blue-600/10", accent: "blue", description: "One-click" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  const orbAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" as const }
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  return (
    <section ref={ref} className="relative py-16 md:py-24 bg-[#0A0A0B] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Enhanced Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        animate={orbAnimation}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)'
        }}
        animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 2}}}
      />
      
      {/* Additional subtle orbs */}
      <motion.div 
        className="absolute top-3/4 left-1/3 w-64 h-64"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 4}}}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300">
            <Zap className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Professional Toolkit</span>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 text-center">
              Complete Professional Toolkit
            </h2>
            
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Everything you need to create, collaborate, and bring your ideas to life
            </p>
            
            {/* Enhanced stats preview */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm"
            >
              <div className="flex items-center space-x-2 text-white/60">
                <Users className="h-4 w-4 text-blue-400" />
                <span>150k+ users worldwide</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Enterprise ready</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Bento Grid Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex-1 pb-16 lg:pb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[240px]">
            {/* Large Feature Card - Drawing & Design */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="group col-span-1 md:col-span-3 lg:col-span-5 row-span-2 relative p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-20 -right-20 w-40 h-40" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(60px)'
              }}></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-4 sm:space-y-6">
                  <div className="inline-flex p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <PenTool className="h-8 w-8 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      Drawing & Design
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      Express ideas naturally with customizable tools and professional-grade drawing capabilities.
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    {features[0].details.slice(0, 3).map((detail, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/60 text-sm">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Enhanced stats */}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-blue-400" />
                      <span>{features[0].stats.users}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span>{features[0].stats.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      <span>{features[0].stats.time}</span>
                    </div>
                  </div>
                </div>
                
                <motion.a
                  href={features[0].demo}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start"
                >
                  <Play className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  <span>Watch Demo</span>
                </motion.a>
              </div>
            </motion.div>

            {/* Medium Card - Collaboration */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="group col-span-1 md:col-span-3 lg:col-span-4 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      Real-Time Collaboration
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      See exactly where teammates are working with live cursor tracking and instant sync.
                    </p>
                  </div>
                </div>
                
                {/* Mini stats */}
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-blue-400" />
                    <span>{features[1].stats.users}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>{features[1].stats.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small Card - Canvas */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="group col-span-1 md:col-span-3 lg:col-span-3 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-8 -right-8 w-16 h-16" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                filter: 'blur(30px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Layers className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-base font-semibold text-white">
                      Advanced Canvas
                    </h3>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Navigate and organize large, complex boards with infinite zoom and layer management.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medium Card - Cross Platform */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="group col-span-1 md:col-span-3 lg:col-span-4 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Globe className="h-6 w-6 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                      Cross-Platform
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Work seamlessly across all devices with browser-based access and mobile optimization.
                    </p>
                  </div>
                </div>
                
                {/* Mini stats */}
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-blue-400" />
                    <span>{features[3].stats.users}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>{features[3].stats.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small Card - Security */}
            <motion.div
              variants={itemVariants}
              whileHover="hover"
              className="group col-span-1 md:col-span-3 lg:col-span-3 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-8 -right-8 w-16 h-16" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
                filter: 'blur(30px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-base font-semibold text-white">
                      Security & Compliance
                    </h3>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Enterprise-grade security with SOC 2 compliance and end-to-end encryption.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col pb-16 lg:pb-20"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold text-center text-white pb-8 sm:pb-12"
          >
            Professional Drawing Tools
          </motion.h3>
          
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -4,
                  transition: { duration: 0.3, ease: "easeOut" as const }
                }}
                className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm flex flex-col items-center space-y-3"
              >
                <div className={`inline-flex p-3 rounded-lg ${tool.bgColor} border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors`}>
                  <tool.icon className={`h-5 w-5 ${tool.color}`} />
                </div>
                
                <div className="flex flex-col items-center space-y-1 text-center">
                  <h4 className="font-medium text-white text-xs">{tool.name}</h4>
                  <p className="text-white/40 text-xs">{tool.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        >
          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
            <div className="text-2xl font-semibold text-white">5.2k</div>
            <div className="text-white/60 text-sm">Active Users</div>
            <div className="flex items-center text-emerald-400 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% from last month
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
            <div className="text-2xl font-semibold text-white">99.9%</div>
            <div className="text-white/60 text-sm">Uptime</div>
            <div className="flex items-center text-emerald-400 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enterprise reliability
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover="hover"
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
            <div className="text-2xl font-semibold text-white">24/7</div>
            <div className="text-white/60 text-sm">Support</div>
            <div className="flex items-center text-blue-400 text-xs">
              <Users className="w-3 h-3 mr-1" />
              Expert assistance
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
