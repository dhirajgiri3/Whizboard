"use client";

import React from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
import SectionHeader from "@/components/ui/header/SectionHeader";
import DemoVideoModal from "@/components/ui/modal/DemoVideoModal";

const Features = () => {
  // Unified reveal-on-scroll animation (first time only)
  const viewportOnce = { once: true, amount: 0.2 } as const;

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
        "Professional pen tools with customizable options",
        "Highlighter and marker tools",
        "Adjustable brush sizes and styles",
        "Eraser with precision control",
        "Undo/redo functionality"
      ],
      demo: "#",
      stats: { users: "—", rating: "—", time: "—" }
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
        "Real-time sync across all devices",
        "Conflict-free editing with operational transformation",
        "Real-time notifications and presence indicators",
        "Basic permissions and access control"
      ],
      demo: "#",
      stats: { users: "—", rating: "—", time: "Real-time" }
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
        "Smooth zoom and pan capabilities",
        "Layer management and organization",
        "Presentation mode for meetings",
        "Auto-save functionality",
        "Grid and snap-to-grid functionality"
      ],
      demo: "#",
      stats: { users: "—", rating: "—", time: "Unlimited" }
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
        "Cross-platform compatibility"
      ],
      demo: "#",
      stats: { users: "—", rating: "—", time: "Any device" }
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
        "Secure authentication",
        "Data handling best practices",
        "Google OAuth integration",
        "Basic access control",
        "Activity tracking"
      ],
      demo: "#",
      stats: { users: "—", rating: "—", time: "High availability" }
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
      transition: { staggerChildren: 0.06, delayChildren: 0.04 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const }
    }
  } as const;

  const orbAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const hoverLift = { y: -8, transition: { duration: 0.25, ease: "easeOut" as const } } as const;

  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-[#0A0A0B] overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8 lg:gap-12">
        {/* Header */}
        <SectionHeader
          badge={{
            icon: Zap,
            text: "Professional Toolkit"
          }}
          title="Complete Professional Toolkit"
          description="Everything you need to create, collaborate, and bring your ideas to life"
           stats={[
            { icon: Users, text: "Real-time collaboration", color: "text-blue-400" },
            { icon: Star, text: "Simple, clean UI", color: "text-yellow-400" },
            { icon: Award, text: "Modern stack", color: "text-emerald-400" }
          ]}
          disableAnimation={true}
        />

        {/* Enhanced Bento Grid Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="flex-shrink-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 sm:gap-6 auto-rows-[240px]">
            {/* Large Feature Card - Drawing & Design */}
            <motion.div
              variants={itemVariants}
              whileHover={hoverLift}
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
                  <div className="inline-flex p-3 sm:p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:space-y-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                      Drawing & Design
                    </h3>
                    <p className="text-white/70 leading-[1.6]">
                      Express ideas naturally with customizable tools and professional-grade drawing capabilities.
                    </p>
                  </div>
                  
                  <motion.div
                    variants={containerVariants}
                    className="flex flex-col space-y-3"
                  >
                    {features[0].details.slice(0, 3).map((detail, index) => (
                      <motion.div key={index} variants={itemVariants} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/60 text-sm leading-[1.5]">{detail}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                  
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
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDemoOpen(true)}
                  className="inline-flex items-center space-x-2 text-blue-400 font-medium hover:text-blue-300 transition-colors group/link self-start focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <Play className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  <span>Watch 3-Min Demo</span>
                </motion.button>

                <DemoVideoModal
                  isOpen={isDemoOpen}
                  onClose={() => setIsDemoOpen(false)}
                  videoUrl="https://res.cloudinary.com/dgak25skk/video/upload/v1755180328/whizboard-3_qyofjn.mp4"
                  title="Watch 3‑Min Demo"
                  description="Explore how the features come together in the whiteboard."
                />
              </div>
            </motion.div>

            {/* Medium Card - Collaboration */}
            <motion.div
              variants={itemVariants}
              whileHover={hoverLift}
              className="group col-span-1 md:col-span-3 lg:col-span-4 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Real-Time Collaboration
                    </h3>
                    <p className="text-white/60 text-sm leading-[1.6]">
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
              whileHover={hoverLift}
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
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      Advanced Canvas
                    </h3>
                    <p className="text-white/60 text-xs leading-[1.5]">
                      Navigate and organize large, complex boards with infinite zoom and layer management.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Medium Card - Cross Platform */}
            <motion.div
              variants={itemVariants}
              whileHover={hoverLift}
              className="group col-span-1 md:col-span-3 lg:col-span-4 row-span-1 relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors self-start">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold text-white">
                      Cross-Platform
                    </h3>
                    <p className="text-white/60 text-sm leading-[1.6]">
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
              whileHover={hoverLift}
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
                    <h3 className="text-sm sm:text-base font-semibold text-white">
                      Security & Compliance
                    </h3>
                    <p className="text-white/60 text-xs leading-[1.5]">
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
          whileInView="visible"
          viewport={viewportOnce}
          className="flex flex-col gap-6 sm:gap-8"
        >
          {/* Redesigned Header - Professional Drawing Tools */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-3 sm:gap-4"
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
            >
              <Palette className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
              <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
                Professional Tools
              </span>
            </motion.div>

            {/* Title */}
            <motion.h3
              variants={itemVariants}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.1] tracking-tight text-center"
            >
              Professional Drawing Tools
            </motion.h3>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-white/70 max-w-2xl leading-[1.6] text-sm sm:text-base text-center"
            >
              Everything you need to create, collaborate, and bring your ideas to life with precision and ease.
            </motion.p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6"
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
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={hoverLift}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
             <div className="text-2xl font-semibold text-white">Fast</div>
             <div className="text-white/60 text-sm">Real-time collaboration</div>
             <div className="flex items-center text-emerald-400 text-xs">
               <TrendingUp className="w-3 h-3 mr-1" />
               Built for teams
             </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={hoverLift}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
             <div className="text-2xl font-semibold text-white">Secure</div>
             <div className="text-white/60 text-sm">Privacy-first</div>
             <div className="flex items-center text-emerald-400 text-xs">
               <CheckCircle className="w-3 h-3 mr-1" />
               Thoughtful defaults
             </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={hoverLift}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 flex flex-col space-y-3"
          >
             <div className="text-2xl font-semibold text-white">Helpful</div>
             <div className="text-white/60 text-sm">Support</div>
             <div className="flex items-center text-blue-400 text-xs">
               <Users className="w-3 h-3 mr-1" />
               Business hours
             </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
