"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -20]);
  
  // Hardcoded data with vibrant multi-color gradients
  const [companyStats] = useState<CompanyStat[]>([
    {
      id: "1",
      name: "Active Users",
      value: "150000",
      description: "Teams worldwide trust WhizBoard for their collaborative needs",
      suffix: "+",
      icon: Users,
      color: "blue",
      gradientColors: ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"],
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
      gradientColors: ["#10B981", "#8B5CF6", "#F59E0B", "#EF4444"],
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
      gradientColors: ["#22C55E", "#EC4899", "#3B82F6", "#F59E0B"],
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
      gradientColors: ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981"],
      isVisible: true,
      order: 4
    }
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  };

  const orbAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-600/10 border-blue-600/20 text-blue-400",
      emerald: "bg-emerald-600/10 border-emerald-600/20 text-emerald-400",
      green: "bg-green-600/10 border-green-600/20 text-green-400",
      yellow: "bg-yellow-600/10 border-yellow-600/20 text-yellow-400",
      purple: "bg-purple-600/10 border-purple-600/20 text-purple-400",
      orange: "bg-orange-600/10 border-orange-600/20 text-orange-400"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section ref={ref} className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Primary Background */}
        <div className="absolute inset-0 bg-gray-950" />
        
        {/* Grid Pattern - Enhanced visibility */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Optimized Gradient Orbs - Reduced blur for performance */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)',
            filter: 'blur(40px)',
            willChange: 'transform'
          }}
          animate={orbAnimation}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
          style={{
            background: 'radial-gradient(circle, rgba(115, 115, 115, 0.15) 0%, rgba(115, 115, 115, 0.03) 50%, transparent 70%)',
            filter: 'blur(50px)',
            willChange: 'transform'
          }}
          animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 4}} as const}
        />

        {/* Additional subtle orb */}
        <motion.div 
          className="absolute top-3/4 left-1/3 w-32 h-32 sm:w-40 sm:h-40"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)',
            filter: 'blur(40px)',
            willChange: 'transform'
          }}
          animate={{...orbAnimation, transition: {...orbAnimation.transition, delay: 8}} as const}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Clean and minimal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ y: parallaxY }}
          className="text-center space-y-3 mb-12 lg:mb-16"
        >
          {/* Badge - Minimal styling */}
          <div className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm">
            <TrendingUp className="h-3 w-3 text-blue-400" />
            <span className="text-white/70 text-xs font-medium">Growing Fast</span>
          </div>
          
          {/* Title - Clean typography */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
            Our{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Achievements
            </span>
          </h2>
          
          {/* Description - Concise */}
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
            Milestones that showcase our commitment to excellence
          </p>
        </motion.div>
        
        {/* Stats Grid - Clean and minimal */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {companyStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div 
                key={stat.id} 
                className="group relative p-5 sm:p-6 rounded-2xl border border-white/[0.08] overflow-hidden transition-all duration-300 backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.01, 
                  y: -2,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
              >
                {/* Primary Multi-Color Gradient Background */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(45deg, ${stat.gradientColors.join(', ')})`,
                    backgroundSize: '300% 300%',
                    filter: 'blur(60px)',
                    opacity: 0.4
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    transition: {
                      duration: 15,
                      repeat: Infinity,
                      ease: "linear" as const,
                      delay: index * 1.5
                    }
                  } as const}
                />
                
                {/* Secondary Multi-Color Gradient Layer */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${stat.gradientColors.slice(1).concat(stat.gradientColors[0]).join(', ')})`,
                    backgroundSize: '250% 250%',
                    filter: 'blur(40px)',
                    opacity: 0.25
                  }}
                  animate={{
                    backgroundPosition: ["100% 0%", "0% 100%", "100% 0%"],
                    transition: {
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear" as const,
                      delay: index * 1.5 + 0.5
                    }
                  } as const}
                />

                {/* Tertiary Gradient Layer for Extra Depth */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(225deg, ${stat.gradientColors.slice(2).concat(stat.gradientColors.slice(0, 2)).join(', ')})`,
                    backgroundSize: '200% 200%',
                    filter: 'blur(30px)',
                    opacity: 0.15
                  }}
                  animate={{
                    backgroundPosition: ["0% 100%", "100% 0%", "0% 100%"],
                    transition: {
                      duration: 18,
                      repeat: Infinity,
                      ease: "linear" as const,
                      delay: index * 1.5 + 1
                    }
                  } as const}
                />

                {/* Additional Glow Layer */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, ${stat.gradientColors[0]}40, transparent 50%), radial-gradient(circle at 70% 80%, ${stat.gradientColors[1]}30, transparent 50%)`,
                    filter: 'blur(20px)',
                    opacity: 0.2
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    transition: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut" as const,
                      delay: index * 0.5
                    }
                  } as const}
                />

                {/* Card content - Clean and minimal */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon - Premium styling with white color */}
                  <div className="inline-flex p-2.5 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 self-start mb-4 group-hover:scale-105 group-hover:bg-white/10">
                    {IconComponent && (
                      <IconComponent className="h-5 w-5 text-white/90" />
                    )}
                  </div>
                  
                  {/* Stats - Premium typography with white color */}
                  <div className="space-y-2 mb-3">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                      <AnimatedCounter 
                        end={parseInt(stat.value)} 
                        prefix={stat.prefix} 
                        suffix={stat.suffix} 
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white/90">{stat.name}</h3>
                  </div>
                  
                  {/* Description - Premium styling */}
                  <p className="text-white/70 text-sm leading-relaxed font-medium">
                    {stat.description}
                  </p>


                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Indicators - Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 mt-12 lg:mt-16"
        >
          {[
            { icon: Zap, text: "Fast", color: "text-blue-400" },
            { icon: Shield, text: "Secure", color: "text-green-400" },
            { icon: Heart, text: "User First", color: "text-red-400" },
            { icon: Award, text: "Award Winning", color: "text-yellow-400" }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className={`flex items-center space-x-1.5 text-white/50 text-xs ${item.color}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
            >
              <item.icon className="h-3 w-3" />
              <span className="font-medium">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutStats; 