"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Globe,
  Smartphone,
  Laptop,
  Clock,
  Lock,
  Sparkles
} from "lucide-react";

const ValueProposition = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description: "Sub-50ms drawing latency with instant sync across all devices. 99.9% uptime guaranteed.",
      gradient: "from-yellow-400/20 to-orange-500/20",
      iconColor: "text-yellow-400",
      stats: "<50ms latency"
    },
    {
      icon: Users,
      title: "True Real-Time Collaboration",
      description: "See every team member's live cursor, get instant notifications, and enjoy zero-conflict editing.",
      gradient: "from-blue-400/20 to-purple-500/20",
      iconColor: "text-blue-400",
      stats: "Unlimited users"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "SOC 2 compliance, end-to-end encryption, and secure cloud storage using financial-institution standards.",
      gradient: "from-green-400/20 to-emerald-500/20",
      iconColor: "text-green-400",
      stats: "SOC 2 Certified"
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "Instant Access",
      description: "No downloads, no installations. Start collaborating in seconds with any modern browser.",
      highlight: "Zero Setup"
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "End-to-end encryption, secure cloud storage, and enterprise compliance standards.",
      highlight: "256-bit Encryption"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Features",
      description: "Smart shape recognition, auto-formatting, and intelligent collaboration suggestions.",
      highlight: "Coming Soon"
    }
  ];

  const problems = [
    "Laggy performance that kills creativity",
    "Limited collaboration features",
    "Complex setup and installation",
    "Poor mobile experience",
    "Security concerns with data"
  ];

  const solutions = [
    "Lightning-fast performance with sub-50ms latency",
    "True real-time collaboration with live cursors",
    "Zero downloads, works instantly in any browser",
    "Mobile-first design with touch optimization",
    "Enterprise-grade security and compliance"
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
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
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.02) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Main Value Proposition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-24"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Why Choose Whizboard</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
          >
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed"
          >
            Stop wasting time on laggy whiteboard tools. Experience instant real-time collaboration 
            with zero downloads, zero delays, and zero compromises. Built for the way teams work today.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 mb-24"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex p-3 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                      <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-white/60 bg-white/[0.05] px-3 py-1 rounded-full">
                      {benefit.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-white transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors">
                    {benefit.description}
                  </p>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Problem-Solution Framework */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 mb-24 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full blur-3xl"></div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            {/* Problem Side */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="text-3xl font-bold text-white">
                  Traditional Tools Fall Short
                </h3>
              </div>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    <span className="text-white/80">{problem}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solution Side */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center space-x-3 mb-8">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="text-3xl font-bold text-white">
                  The Whizboard Advantage
                </h3>
              </div>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/80">{solution}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-24"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </motion.h3>
          <motion.p
            variants={itemVariants}
            className="text-white/70 text-lg mb-16 max-w-2xl mx-auto"
          >
            Professional-grade features designed for modern teams and workflows
          </motion.p>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 text-center overflow-hidden">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex p-4 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-blue-400" />
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <h4 className="text-xl font-semibold text-white">
                        {feature.title}
                      </h4>
                      <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    
                    <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-50"></div>
            
            <div className="relative z-10">
              <h4 className="text-2xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h4>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already collaborating faster and smarter with Whizboard
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-3"
                >
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.a>
                
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white/80 hover:text-white hover:bg-white/5 font-medium px-8 py-4 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  Watch Demo
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition;