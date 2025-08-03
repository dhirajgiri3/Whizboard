"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Sparkles, Users, Target, Heart, Zap, Globe, Award, TrendingUp, Shield } from "lucide-react";

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

// Icon mapping for timeline events
const iconMapping = {
  "Sparkles": Sparkles,
  "Users": Users,
  "Target": Target,
  "Heart": Heart,
  "Zap": Zap,
  "Globe": Globe,
  "Award": Award,
  "TrendingUp": TrendingUp,
  "Clock": Clock,
  "Shield": Shield,
};

const AboutTimeline = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch('/api/about/timeline');
        if (response.ok) {
          const timelineData: TimelineEvent[] = await response.json();
          setTimelineEvents(timelineData);
        } else {
          // Fallback data if API fails
          setTimelineEvents([
            {
              id: "1",
              year: "2020",
              title: "The Beginning",
              description: "Founded with a vision to revolutionize remote collaboration through intuitive whiteboarding tools.",
              icon: "Sparkles",
              isVisible: true,
              order: 1
            },
            {
              id: "2",
              year: "2021",
              title: "First Product Launch",
              description: "Released our first collaborative whiteboard with real-time drawing and basic collaboration features.",
              icon: "Users",
              isVisible: true,
              order: 2
            },
            {
              id: "3",
              year: "2022",
              title: "Enterprise Adoption",
              description: "Reached 10,000+ users and launched enterprise features with advanced security and compliance.",
              icon: "Shield",
              isVisible: true,
              order: 3
            },
            {
              id: "4",
              year: "2023",
              title: "Global Expansion",
              description: "Expanded to 45+ countries and introduced advanced AI-powered features for smarter collaboration.",
              icon: "Globe",
              isVisible: true,
              order: 4
            },
            {
              id: "5",
              year: "2024",
              title: "Industry Recognition",
              description: "Achieved 4.9/5 rating from 150,000+ users and received multiple industry awards for innovation.",
              icon: "Award",
              isVisible: true,
              order: 5
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
        // Use fallback data
        setTimelineEvents([
          {
            id: "1",
            year: "2020",
            title: "The Beginning",
            description: "Founded with a vision to revolutionize remote collaboration through intuitive whiteboarding tools.",
            icon: "Sparkles",
            isVisible: true,
            order: 1
          },
          {
            id: "2",
            year: "2021",
            title: "First Product Launch",
            description: "Released our first collaborative whiteboard with real-time drawing and basic collaboration features.",
            icon: "Users",
            isVisible: true,
            order: 2
          },
          {
            id: "3",
            year: "2022",
            title: "Enterprise Adoption",
            description: "Reached 10,000+ users and launched enterprise features with advanced security and compliance.",
            icon: "Shield",
            isVisible: true,
            order: 3
          },
          {
            id: "4",
            year: "2023",
            title: "Global Expansion",
            description: "Expanded to 45+ countries and introduced advanced AI-powered features for smarter collaboration.",
            icon: "Globe",
            isVisible: true,
            order: 4
          },
          {
            id: "5",
            year: "2024",
            title: "Industry Recognition",
            description: "Achieved 4.9/5 rating from 150,000+ users and received multiple industry awards for innovation.",
            icon: "Award",
            isVisible: true,
            order: 5
          }
        ]);
      }
    };

    fetchTimeline();
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300">
            <Clock className="h-4 w-4 text-indigo-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Our History</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 text-center">
            Our Journey
          </h2>
          
          <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
            From a bold idea to a thriving platform, here's how we've grown.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line - Glowing Effect */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-indigo-500/80 via-blue-500/50 to-purple-500/80 z-0 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.45)] hidden md:block">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-indigo-500 to-transparent opacity-40 blur-sm"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-t from-purple-500 to-transparent opacity-40 blur-sm"></div>
          </div>
          
          <div className="space-y-12 md:space-y-24">
            {timelineEvents.map((event, index) => {
              const IconComponent = iconMapping[event.icon as keyof typeof iconMapping];
              const isEven = index % 2 === 0;
              const gradientColors = [
                'from-blue-500/20 to-indigo-500/20',
                'from-indigo-500/20 to-purple-500/20',
                'from-purple-500/20 to-blue-500/20',
                'from-blue-400/20 to-cyan-500/20',
              ];
              const gradientColor = gradientColors[index % gradientColors.length];

              return (
                <motion.div 
                  key={event.id}
                  className={`flex flex-col md:flex-row items-center w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeInUp}
                >
                  <div className="md:w-5/12 text-right md:pr-10">
                    {isEven && (
                      <motion.div 
                        variants={fadeInUp} 
                        className="relative overflow-hidden bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-sm group hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                        whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" as const } }}
                      >
                        {/* Enhanced Gradient Orb Background */}
                        <div className="absolute -top-10 -right-10 w-32 h-32" style={{
                          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)',
                          filter: 'blur(40px)'
                        }}></div>
                        
                        <div className="relative z-10">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm font-medium text-indigo-400 mb-3">{event.year}</span>
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-white/60">{event.description}</p>
                          
                          {/* Subtle gradient overlay on hover */}
                          <div className={`absolute inset-0 bg-gradient-to-tr ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="md:w-1/12 flex justify-center z-10">
                    <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 border-2 border-white/10 transform scale-110 group">
                      {IconComponent && <IconComponent className="h-8 w-8 group-hover:scale-110 transition-transform duration-300" />}
                      <div className="absolute w-16 h-16 bg-indigo-500/20 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                    </div>
                  </div>
                  <div className="md:w-5/12 text-left md:pl-10 mt-6 md:mt-0">
                    {!isEven && (
                      <motion.div 
                        variants={fadeInUp} 
                        className="relative overflow-hidden bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl backdrop-blur-sm group hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
                        whileHover={{ y: -5, transition: { duration: 0.3, ease: "easeOut" as const } }}
                      >
                        {/* Enhanced Gradient Orb Background */}
                        <div className="absolute -top-10 -right-10 w-32 h-32" style={{
                          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
                          filter: 'blur(40px)'
                        }}></div>
                        
                        <div className="relative z-10">
                          <span className="inline-block px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm font-medium text-indigo-400 mb-3">{event.year}</span>
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-white/60">{event.description}</p>
                          
                          {/* Subtle gradient overlay on hover */}
                          <div className={`absolute inset-0 bg-gradient-to-tr ${gradientColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
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

export default AboutTimeline; 