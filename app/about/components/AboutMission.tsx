"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Target, Flame } from "lucide-react";

const AboutMission = () => {
  const values = [
    {
      icon: Target,
      title: "Clear Vision",
      description: "To revolutionize remote collaboration by providing an intuitive, powerful, and seamless whiteboarding experience for teams worldwide.",
      iconColor: "text-blue-400",
      gradient: "from-blue-600/10 to-blue-400/5"
    },
    {
      icon: Heart,
      title: "User-Centric Design",
      description: "We put our users first, constantly listening to feedback and iterating to build features that genuinely solve their problems.",
      iconColor: "text-purple-400",
      gradient: "from-purple-600/10 to-purple-400/5"
    },
    {
      icon: Flame,
      title: "Innovation & Agility",
      description: "We embrace new technologies and agile methodologies to deliver cutting-edge features and adapt quickly to market needs.",
      iconColor: "text-orange-400",
      gradient: "from-orange-600/10 to-orange-400/5"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 md:py-24 relative z-10">
      {/* Background Elements */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}></div>
      </motion.div>
      
      {/* Enhanced Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)',
          filter: 'blur(60px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
      
      {/* Additional subtle orbs */}
      <motion.div 
        className="absolute top-3/4 left-1/3 w-64 h-64"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div 
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300"
          >
            <Heart className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Our Core Values</span>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 text-center"
          >
            Our Mission & Values
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-base text-white/80 max-w-2xl text-center leading-relaxed"
          >
            At WhizBoard, we believe in empowering teams to innovate and collaborate without limits.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
        >
          {values.map((value, index) => (
            <motion.div 
              key={index}
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm flex flex-col items-center text-center"
              variants={itemVariants}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <motion.div 
                className="absolute -top-10 -right-10 w-20 h-20" 
                style={{
                  background: index === 0 ? 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)' :
                           index === 1 ? 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)' :
                           'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 1, delay: 0.3 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
              
              <motion.div 
                className={`inline-flex p-4 rounded-xl border group-hover:scale-105 transition-all duration-300 mb-6 ${
                  index === 0 ? 'bg-blue-600/10 border-blue-600/20 group-hover:bg-blue-600/15' :
                  index === 1 ? 'bg-purple-600/10 border-purple-600/20 group-hover:bg-purple-600/15' :
                  'bg-orange-600/10 border-orange-600/20 group-hover:bg-orange-600/15'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <value.icon className={`h-8 w-8 ${value.iconColor}`} />
              </motion.div>
              <motion.h3 
                className="text-xl font-semibold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {value.title}
              </motion.h3>
              <motion.p 
                className="text-white/60 leading-relaxed text-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {value.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMission; 