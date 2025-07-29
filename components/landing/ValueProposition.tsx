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
  Laptop
} from "lucide-react";

const ValueProposition = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description: "Sub-50ms drawing latency with instant sync across all devices. 99.9% uptime guaranteed.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Users,
      title: "True Real-Time Collaboration",
      description: "See every team member's live cursor, get instant notifications, and enjoy zero-conflict editing.",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "SOC 2 compliance, end-to-end encryption, and secure cloud storage using financial-institution standards.",
      color: "from-green-400 to-emerald-500"
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Browser-based, mobile optimized, keyboard shortcuts, touch gestures"
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Full functionality across Chrome, Safari, Firefox, and Edge"
    },
    {
      icon: Laptop,
      title: "Advanced Canvas",
      description: "Infinite zoom, presentation mode, layer management, auto-save"
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
    <section ref={ref} className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Value Proposition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Why Smart Teams Choose{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Whizboard
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Stop wasting time on laggy whiteboard tools. Get instant real-time collaboration 
            with zero downloads, zero delays, and zero compromises.
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.color} mb-6`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Problem-Solution Framework */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 items-center mb-20"
        >
          {/* Problem Side */}
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              The Problem with Traditional Tools
            </h3>
            <div className="space-y-4">
              {[
                "Laggy performance that kills creativity",
                "Limited collaboration features",
                "Complex setup and installation",
                "Poor mobile experience",
                "Security concerns with data"
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-gray-700">{problem}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution Side */}
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              The Whizboard Solution
            </h3>
            <div className="space-y-4">
              {[
                "Lightning-fast performance with sub-50ms latency",
                "True real-time collaboration with live cursors",
                "Zero downloads, works instantly in any browser",
                "Mobile-first design with touch optimization",
                "Enterprise-grade security and compliance"
              ].map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{solution}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Complete Professional Toolkit
          </motion.h3>
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex p-4 rounded-xl bg-white shadow-lg mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span>Start Creating - All Features Free Trial</span>
            <ArrowRight className="h-5 w-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProposition; 