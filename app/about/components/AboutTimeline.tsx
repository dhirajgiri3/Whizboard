"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Target, Heart, Zap, Globe, Award, TrendingUp, Shield, Code, Sparkles, Flame } from "lucide-react";
import api from '@/lib/http/axios';

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
  "Code": Code,
  "Users": Users,
  "Target": Target,
  "Heart": Heart,
  "Zap": Zap,
  "Globe": Globe,
  "Award": Award,
  "TrendingUp": TrendingUp,
  "Clock": Clock,
  "Shield": Shield,
  "Sparkles": Sparkles,
  "Flame": Flame,
};

const AboutTimeline = () => {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const { data } = await api.get('/api/about/timeline');
        if (Array.isArray(data)) {
          setTimelineEvents(data as TimelineEvent[]);
        } else {
          // Fallback data if API fails
          setTimelineEvents([
            {
              id: "1",
              year: "2023",
              title: "The Idea",
              description: "Started with a simple idea: make collaborative whiteboarding accessible to everyone. Built the first prototype in my spare time.",
              icon: "Code",
              isVisible: true,
              order: 1
            },
            {
              id: "2",
              year: "2024",
              title: "First Launch",
              description: "Released the first version with basic drawing tools and real-time collaboration. Gained first 100 users through word of mouth.",
              icon: "Users",
              isVisible: true,
              order: 2
            },
            {
              id: "3",
              year: "2024",
              title: "Product Evolution",
              description: "Added advanced features like frames, sticky notes, and enhanced collaboration tools. Reached 1,000+ active users.",
              icon: "Target",
              isVisible: true,
              order: 3
            },
            {
              id: "4",
              year: "2024",
              title: "Community Growth",
              description: "Built a passionate community of builders and creators. Launched integrations and API for developers.",
              icon: "Globe",
              isVisible: true,
              order: 4
            },
            {
              id: "5",
              year: "2024",
              title: "Future Vision",
              description: "Continuing to build the future of collaborative work. Focused on making remote collaboration seamless and enjoyable.",
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
            year: "2023",
            title: "The Idea",
            description: "Started with a simple idea: make collaborative whiteboarding accessible to everyone. Built the first prototype in my spare time.",
            icon: "Code",
            isVisible: true,
            order: 1
          },
          {
            id: "2",
            year: "2024",
            title: "First Launch",
            description: "Released the first version with basic drawing tools and real-time collaboration. Gained first 100 users through word of mouth.",
            icon: "Users",
            isVisible: true,
            order: 2
          },
          {
            id: "3",
            year: "2024",
            title: "Product Evolution",
            description: "Added advanced features like frames, sticky notes, and enhanced collaboration tools. Reached 1,000+ active users.",
            icon: "Target",
            isVisible: true,
            order: 3
          },
          {
            id: "4",
            year: "2024",
            title: "Community Growth",
            description: "Built a passionate community of builders and creators. Launched integrations and API for developers.",
            icon: "Globe",
            isVisible: true,
            order: 4
          },
          {
            id: "5",
            year: "2024",
            title: "Future Vision",
            description: "Continuing to build the future of collaborative work. Focused on making remote collaboration seamless and enjoyable.",
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
    <section className="relative py-24 overflow-hidden">
      {/* Subtle Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-gray-500/1 to-gray-500/2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      
      {/* Background Grid */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.2 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1, delay: 0.7 }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </motion.div>
      
      {/* Minimal Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
        style={{
          background: 'radial-gradient(circle, rgba(115, 115, 115, 0.1) 0%, rgba(115, 115, 115, 0.02) 50%, transparent 70%)',
          filter: 'blur(50px)'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6"
          >
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Our Journey</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2 
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            Building the <span className="text-blue-400">Future</span>
          </motion.h2>
          
          {/* Description */}
          <motion.p 
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-base text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            From a simple idea to a powerful platform. Here's how we're shaping the future of collaborative work.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <motion.div 
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          transition={{ staggerChildren: 0.15, delayChildren: 0.1 }}
        >
          {/* Timeline Line - Desktop */}
          <motion.div 
            className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-white/[0.1] hidden md:block"
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          
          {/* Timeline Line - Mobile */}
          <motion.div 
            className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/[0.1] md:hidden"
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          
          <div className="space-y-12 md:space-y-16">
            {timelineEvents.map((event, index) => {
              const IconComponent = iconMapping[event.icon as keyof typeof iconMapping];
              const isLeft = index % 2 === 0;

              return (
                <motion.div 
                  key={event.id}
                  className="relative"
                  variants={itemVariants}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Desktop Layout */}
                  <div className="hidden md:flex flex-row items-center w-full">
                    {/* Left Side Card */}
                    <div className="w-5/12 text-center md:text-left md:pr-8">
                      {isLeft && (
                        <motion.div 
                          className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                          whileHover={{ y: -4 }}
                          initial={{ opacity: 0, x: -50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-blue-400 mb-3">
                              {event.year}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{event.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Timeline Node - Desktop */}
                    <div className="w-2/12 flex justify-center z-10">
                      <motion.div 
                        className="p-4 rounded-full bg-blue-500 text-white shadow-lg border-2 border-white/[0.1] group"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {IconComponent && <IconComponent className="h-6 w-6" />}
                      </motion.div>
                    </div>
                    
                    {/* Right Side Card */}
                    <div className="w-5/12 text-center md:text-right md:pl-8">
                      {!isLeft && (
                        <motion.div 
                          className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                          whileHover={{ y: -4 }}
                          initial={{ opacity: 0, x: 50 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-blue-400 mb-3">
                              {event.year}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{event.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden flex items-start space-x-4">
                    {/* Timeline Node - Mobile */}
                    <div className="flex-shrink-0 mt-2">
                      <motion.div 
                        className="p-3 rounded-full bg-blue-500 text-white shadow-lg border-2 border-white/[0.1] group"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {IconComponent && <IconComponent className="h-5 w-5" />}
                      </motion.div>
                    </div>
                    
                    {/* Card - Mobile */}
                    <div className="flex-1">
                      <motion.div 
                        className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                        whileHover={{ y: -2 }}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="relative z-10">
                          <span className="inline-block px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-medium text-blue-400 mb-2">
                            {event.year}
                          </span>
                          <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutTimeline; 