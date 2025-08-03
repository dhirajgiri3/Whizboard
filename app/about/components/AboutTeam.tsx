"use client";

import React, { useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Linkedin, Twitter, Mail } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  isActive: boolean;
  order: number;
}

const AboutTeam = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/about/team');
        if (response.ok) {
          const teamData: TeamMember[] = await response.json();
          setTeamMembers(teamData);
        } else {
          // Fallback data if API fails
          setTeamMembers([
            {
              id: "1",
              name: "Sarah Chen",
              role: "CEO & Co-Founder",
              bio: "Former product lead at Google with 10+ years building collaborative tools. Passionate about making remote work seamless.",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              social: {
                linkedin: "https://linkedin.com/in/sarahchen",
                twitter: "https://twitter.com/sarahchen",
                email: "sarah@whizboard.com"
              },
              isActive: true,
              order: 1
            },
            {
              id: "2",
              name: "Marcus Rodriguez",
              role: "CTO & Co-Founder",
              bio: "Ex-engineering manager at Microsoft. Expert in real-time systems and scalable architecture. Loves solving complex technical challenges.",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              social: {
                linkedin: "https://linkedin.com/in/marcusrodriguez",
                twitter: "https://twitter.com/marcusrodriguez",
                email: "marcus@whizboard.com"
              },
              isActive: true,
              order: 2
            },
            {
              id: "3",
              name: "Emily Watson",
              role: "Head of Design",
              bio: "Design leader with experience at Figma and Adobe. Focused on creating intuitive, beautiful user experiences that teams love.",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              social: {
                linkedin: "https://linkedin.com/in/emilywatson",
                twitter: "https://twitter.com/emilywatson",
                email: "emily@whizboard.com"
              },
              isActive: true,
              order: 3
            },
            {
              id: "4",
              name: "David Kim",
              role: "VP of Engineering",
              bio: "Former senior engineer at Slack. Specializes in real-time collaboration systems and building high-performance applications.",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              social: {
                linkedin: "https://linkedin.com/in/davidkim",
                twitter: "https://twitter.com/davidkim",
                email: "david@whizboard.com"
              },
              isActive: true,
              order: 4
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        // Use fallback data
        setTeamMembers([
          {
            id: "1",
            name: "Sarah Chen",
            role: "CEO & Co-Founder",
            bio: "Former product lead at Google with 10+ years building collaborative tools. Passionate about making remote work seamless.",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            social: {
              linkedin: "https://linkedin.com/in/sarahchen",
              twitter: "https://twitter.com/sarahchen",
              email: "sarah@whizboard.com"
            },
            isActive: true,
            order: 1
          },
          {
            id: "2",
            name: "Marcus Rodriguez",
            role: "CTO & Co-Founder",
            bio: "Ex-engineering manager at Microsoft. Expert in real-time systems and scalable architecture. Loves solving complex technical challenges.",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            social: {
              linkedin: "https://linkedin.com/in/marcusrodriguez",
              twitter: "https://twitter.com/marcusrodriguez",
              email: "marcus@whizboard.com"
            },
            isActive: true,
            order: 2
          },
          {
            id: "3",
            name: "Emily Watson",
            role: "Head of Design",
            bio: "Design leader with experience at Figma and Adobe. Focused on creating intuitive, beautiful user experiences that teams love.",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            social: {
              linkedin: "https://linkedin.com/in/emilywatson",
              twitter: "https://twitter.com/emilywatson",
              email: "emily@whizboard.com"
            },
            isActive: true,
            order: 3
          },
          {
            id: "4",
            name: "David Kim",
            role: "VP of Engineering",
            bio: "Former senior engineer at Slack. Specializes in real-time collaboration systems and building high-performance applications.",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            social: {
              linkedin: "https://linkedin.com/in/davidkim",
              twitter: "https://twitter.com/davidkim",
              email: "david@whizboard.com"
            },
            isActive: true,
            order: 4
          }
        ]);
      }
    };

    fetchTeam();
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
            <Users className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">The Talent</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 text-center">
            Meet Our Team
          </h2>
          
          <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
            A passionate group of innovators, designers, and engineers dedicated to transforming the way teams collaborate.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {teamMembers.map((member, index) => (
            <motion.div 
              key={member.id} 
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center flex flex-col items-center"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: `radial-gradient(circle, ${index % 2 === 0 ? 'rgba(37, 99, 235, 0.3)' : 'rgba(124, 58, 237, 0.3)'} 0%, transparent 70%)`,
                filter: 'blur(40px)'
              }}></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full mb-6 overflow-hidden border-2 border-white/10 group-hover:border-blue-500/30 transition-colors duration-300 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt={member.name} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-blue-400 font-medium mb-3 text-sm">{member.role}</p>
                <p className="text-white/60 text-sm mb-5 flex-grow">{member.bio}</p>
                <div className="flex space-x-3">
                  {member.social.linkedin && (
                    <a 
                      href={member.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/60 hover:text-blue-400 hover:border-blue-400/30 hover:bg-white/[0.05] transition-all duration-300"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a 
                      href={member.social.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/60 hover:text-blue-400 hover:border-blue-400/30 hover:bg-white/[0.05] transition-all duration-300"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {member.social.email && (
                    <a 
                      href={`mailto:${member.social.email}`} 
                      className="p-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-white/60 hover:text-blue-400 hover:border-blue-400/30 hover:bg-white/[0.05] transition-all duration-300"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
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

export default AboutTeam; 