"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingUp, Users, Star, Award, Globe, Zap, Shield, Heart, Target, Rocket, Activity, Sparkles } from "lucide-react";

interface CompanyStat {
  id: string;
  name: string;
  value: string;
  description: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
  gradientColors: string[];
  isVisible: boolean;
  order: number;
}

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: DOMHighResTimeStamp | null = null;
    const startCount = 0;

    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(startCount + (end - startCount) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums font-bold">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const AboutStats = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -20]);
  
  // Enhanced data with refined gradients and better descriptions
  const [companyStats] = useState<CompanyStat[]>([
    {
      id: "1",
      name: "Active Users",
      value: "150000",
      description: "Teams worldwide trust WhizBoard for their collaborative needs",
      suffix: "+",
      icon: Users,
      color: "blue",
      gradientColors: ["#3B82F6", "#8B5CF6", "#EC4899"],
      isVisible: true,
      order: 1
    },
    {
      id: "2", 
      name: "Countries",
      value: "45",
      description: "Global reach and impact across diverse markets",
      suffix: "+",
      icon: Globe,
      color: "emerald",
      gradientColors: ["#10B981", "#8B5CF6", "#F59E0B"],
      isVisible: true,
      order: 2
    },
    {
      id: "3",
      name: "Uptime",
      value: "99.9",
      description: "Enterprise-grade reliability and performance",
      suffix: "%",
      icon: Shield,
      color: "green",
      gradientColors: ["#22C55E", "#EC4899", "#3B82F6"],
      isVisible: true,
      order: 3
    },
    {
      id: "4",
      name: "Customer Rating",
      value: "4.9",
      description: "Out of 5 stars from satisfied users worldwide",
      suffix: "/5",
      icon: Star,
      color: "yellow",
      gradientColors: ["#F59E0B", "#EC4899", "#8B5CF6"],
      isVisible: true,
      order: 4
    }
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const backgroundVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <section className="relative py-20 md:py-28 lg:py-32 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Primary Background */}
        <div className="absolute inset-0 bg-gray-950" />
        
        {/* Refined Grid Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-15"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.15 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
        </motion.div>

        {/* Optimized Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)',
            filter: 'blur(50px)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
            willChange: 'transform'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: parallaxY }}
          className="text-center space-y-4 mb-16 lg:mb-20"
        >
          {/* Enhanced Badge */}
          <motion.div 
            variants={badgeVariants}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm"
          >
            <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-white/80 text-sm font-medium">Growing Fast</span>
          </motion.div>
          
          {/* Enhanced Title */}
          <motion.h2 
            variants={headerVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Achievements
            </span>
          </motion.h2>
          
          {/* Enhanced Description */}
          <motion.p 
            variants={headerVariants}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Milestones that showcase our commitment to excellence and innovation
          </motion.p>
        </motion.div>
        
        {/* Enhanced Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
        >
          {companyStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={stat.id} 
                className="group relative p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all duration-500 backdrop-blur-sm hover:border-white/[0.12] hover:bg-white/[0.04]"
                variants={itemVariants}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  scale: 1.02, 
                  y: -4,
                  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                }}
              >
                {/* Enhanced Gradient Background */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradientColors.join(', ')})`,
                    backgroundSize: '200% 200%',
                    filter: 'blur(80px)',
                    opacity: 0.3
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    transition: {
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 2
                    }
                  }}
                />
                
                {/* Additional Glow Layer */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, ${stat.gradientColors[0]}30, transparent 50%), radial-gradient(circle at 70% 80%, ${stat.gradientColors[1]}20, transparent 50%)`,
                    filter: 'blur(30px)',
                    opacity: 0.15
                  }}
                  animate={{
                    opacity: [0.15, 0.3, 0.15],
                    transition: {
                      duration: 10,
                      repeat: Infinity,
                      ease: [0.22, 1, 0.36, 1],
                      delay: index * 0.5
                    }
                  }}
                />

                {/* Enhanced Card Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Enhanced Icon */}
                  <div className="inline-flex p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 self-start mb-6 group-hover:scale-110 group-hover:bg-white/10 group-hover:border-white/20">
                    {IconComponent && (
                      <IconComponent className="h-6 w-6 text-white/90" />
                    )}
                  </div>
                  
                  {/* Enhanced Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="text-3xl font-semibold text-white">
                      <AnimatedCounter 
                        end={parseInt(stat.value)} 
                        prefix={stat.prefix} 
                        suffix={stat.suffix} 
                      />
                    </div>
                    <h3 className="text-xl sm:text-lg font-semibold text-white/90">{stat.name}</h3>
                  </div>
                  
                  {/* Enhanced Description */}
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed font-medium">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced Trust Indicators */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          transition={{ staggerChildren: 0.1, delayChildren: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 mt-16 lg:mt-20"
        >
          {[
            { icon: Zap, text: "Lightning Fast", color: "text-blue-400" },
            { icon: Shield, text: "Enterprise Secure", color: "text-green-400" },
            { icon: Heart, text: "User First", color: "text-red-400" },
            { icon: Award, text: "Award Winning", color: "text-yellow-400" }
          ].map((item, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center space-x-2 text-white/60 text-sm ${item.color} hover:text-white/80 transition-colors duration-200`}
              whileHover={{ scale: 1.05 }}
            >
              <item.icon className="h-4 w-4" />
              <span className="font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutStats; 