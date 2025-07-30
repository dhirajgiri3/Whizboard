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
  Sparkles,
  Target,
  X,
  Star,
  Award
} from "lucide-react";

const ValueProposition = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      icon: Target,
      title: "Precision Drawing",
      description: "Professional-grade drawing tools with pixel-perfect accuracy for detailed designs and technical diagrams.",
      metric: "99.9% accuracy",
      stats: "50k+ drawings daily",
      iconColor: "text-blue-400",
      gradient: "from-blue-600/10 to-blue-400/5"
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live cursors, instant updates, and team presence indicators.",
      metric: "<50ms latency",
      stats: "150k+ active users",
      iconColor: "text-emerald-400",
      gradient: "from-emerald-600/10 to-emerald-400/5"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth drawing even with complex diagrams and large teams.",
      metric: "60fps rendering",
      stats: "2x faster loading",
      iconColor: "text-amber-400",
      gradient: "from-amber-600/10 to-amber-400/5"
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
      className="relative py-16 md:py-24 overflow-hidden bg-[#0A0A0B]"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.015] dot-pattern"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[60px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full filter blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Value Proposition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="h-4 w-4 text-blue-400" />
            </motion.div>
            <span className="text-white/70 text-sm font-medium">Why Choose Whizboard</span>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight text-center">
              Transform Ideas Into
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Actionable Plans
              </span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Stop struggling with scattered thoughts and chaotic brainstorms. Our professional-grade 
              collaborative whiteboard transforms creative chaos into organized, actionable outcomes.
            </p>
          </motion.div>
          
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
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Enterprise ready</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -8 }}
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                {/* Gradient Orb Background */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] group-hover:scale-110 transition-transform duration-500 ${benefit.gradient.includes('amber') ? 'bg-amber-600/20' : benefit.gradient.includes('blue') ? 'bg-blue-600/20' : 'bg-emerald-600/20'}`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`inline-flex p-4 rounded-xl border group-hover:scale-105 transition-all duration-300 ${benefit.gradient.includes('amber') ? 'bg-amber-600/10 border-amber-600/20 group-hover:bg-amber-600/15' : benefit.gradient.includes('blue') ? 'bg-blue-600/10 border-blue-600/20 group-hover:bg-blue-600/15' : 'bg-emerald-600/10 border-emerald-600/20 group-hover:bg-emerald-600/15'}`}>
                      <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                    </div>
                    <span className={`text-xs font-medium bg-white/[0.05] px-3 py-1 rounded-full ${benefit.iconColor}`}>
                      {benefit.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-white transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors mb-4">
                    {benefit.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${benefit.iconColor}`}>{benefit.metric}</span>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Traditional Approach vs Whizboard Solution */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Why Teams Choose{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Whizboard
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-white/70 max-w-3xl mx-auto"
            >
              See the difference between traditional tools and our modern
              approach to collaborative whiteboarding.
            </motion.p>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Traditional Approach */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 h-full hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mr-4">
                    <X className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Traditional Approach
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    "Multiple disconnected tools",
                    "Complex setup and learning curve",
                    "Limited real-time collaboration",
                    "Version control nightmares",
                    "Expensive licensing per user",
                    "Poor mobile experience",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center text-white/70"
                    >
                      <X className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Whizboard Solution */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 h-full hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Whizboard Solution
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    "All-in-one collaborative platform",
                    "Intuitive design, instant productivity",
                    "Real-time collaboration built-in",
                    "Automatic saving and sync",
                    "Free forever plan available",
                    "Perfect on any device",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center text-white/70"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </motion.h3>
          <motion.p
            variants={itemVariants}
            className="text-white/70 text-lg mb-12 max-w-2xl mx-auto"
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
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
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
            <div className="relative z-10">
              <h4 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Workflow?
              </h4>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of teams already collaborating faster and smarter with Whizboard
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-2 min-w-[180px] justify-center"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.a>
                
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12] flex items-center gap-2 min-w-[180px] justify-center"
                >
                  <span>Watch Demo</span>
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