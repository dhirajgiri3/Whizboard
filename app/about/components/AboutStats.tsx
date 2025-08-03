"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp, Users, Star, Award } from "lucide-react";

interface CompanyStat {
  id: string;
  name: string;
  value: string;
  description: string;
  prefix?: string;
  suffix?: string;
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
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const AboutStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [companyStats, setCompanyStats] = useState<CompanyStat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/about/stats');
        if (response.ok) {
          const statsData: CompanyStat[] = await response.json();
          setCompanyStats(statsData);
        } else {
          // Fallback data if API fails
          setCompanyStats([
            {
              id: "1",
              name: "Active Users",
              value: "150000",
              description: "Teams worldwide trust WhizBoard",
              suffix: "+",
              isVisible: true,
              order: 1
            },
            {
              id: "2", 
              name: "Countries",
              value: "45",
              description: "Global reach and impact",
              suffix: "+",
              isVisible: true,
              order: 2
            },
            {
              id: "3",
              name: "Uptime",
              value: "99.9",
              description: "Enterprise-grade reliability",
              suffix: "%",
              isVisible: true,
              order: 3
            },
            {
              id: "4",
              name: "Customer Rating",
              value: "4.9",
              description: "Out of 5 stars from users",
              suffix: "/5",
              isVisible: true,
              order: 4
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Use fallback data
        setCompanyStats([
          {
            id: "1",
            name: "Active Users",
            value: "150000",
            description: "Teams worldwide trust WhizBoard",
            suffix: "+",
            isVisible: true,
            order: 1
          },
          {
            id: "2", 
            name: "Countries",
            value: "45",
            description: "Global reach and impact",
            suffix: "+",
            isVisible: true,
            order: 2
          },
          {
            id: "3",
            name: "Uptime",
            value: "99.9",
            description: "Enterprise-grade reliability",
            suffix: "%",
            isVisible: true,
            order: 3
          },
          {
            id: "4",
            name: "Customer Rating",
            value: "4.9",
            description: "Out of 5 stars from users",
            suffix: "/5",
            isVisible: true,
            order: 4
          }
        ]);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
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

  const orbAnimation = {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.6, 0.4],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <section ref={ref} className="py-16 md:py-24 relative z-10">
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
          background: 'radial-gradient(circle, rgba(107, 114, 128, 0.3) 0%, rgba(107, 114, 128, 0.08) 50%, transparent 70%)',
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300">
            <TrendingUp className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Growing Fast</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Our Achievements
          </h2>
          
          <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
            Milestones that showcase our commitment to excellence and innovation
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {companyStats.map((stat) => (
            <motion.div 
              key={stat.id} 
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center flex flex-col items-center justify-center"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="text-5xl sm:text-6xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                  <AnimatedCounter 
                    end={parseInt(stat.value)} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{stat.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

export default AboutStats; 