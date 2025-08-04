"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, Code, Coffee, Rocket, Terminal, Palette, Megaphone } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
  isActive: boolean;
  order: number;
}

const AboutTeam = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('/api/about/team');
        if (response.ok) {
          const teamData: TeamMember[] = await response.json();
          setTeamMembers(teamData);
        } else {
          // Solo founder data with enhanced content
          setTeamMembers([
            {
              id: "1",
              name: "Dhiraj Giri",
              role: "Solo Founder & Full-Stack Architect",
              bio: "Building the future of collaborative whiteboarding, one line of code at a time. Former corporate escapee turned indie hacker. When I'm not crafting pixel-perfect interfaces or debugging at 3 AM, you'll find me explaining complex algorithms to my rubber duck collection.",
              avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1754345951/dhiraj-st3-mini_eq3fmn.png",
              social: {
                linkedin: "https://linkedin.com/in/dhirajgiri",
                twitter: "https://twitter.com/dhirajgiri",
                github: "https://github.com/dhirajgiri",
                email: "dhiraj@whizboard.com"
              },
              isActive: true,
              order: 1
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        // Solo founder fallback data
        setTeamMembers([
          {
            id: "1",
            name: "Dhiraj Giri",
            role: "Solo Founder & Full-Stack Architect",
            bio: "Building the future of collaborative whiteboarding, one line of code at a time. Former corporate escapee turned indie hacker. When I'm not crafting pixel-perfect interfaces or debugging at 3 AM, you'll find me explaining complex algorithms to my rubber duck collection.",
            avatar: "https://res.cloudinary.com/dgak25skk/image/upload/v1754345951/dhiraj-st3-mini_eq3fmn.png",
            social: {
              linkedin: "https://linkedin.com/in/dhirajgiri",
              twitter: "https://twitter.com/dhirajgiri",
              github: "https://github.com/dhirajgiri",
              email: "dhiraj@whizboard.com"
            },
            isActive: true,
            order: 1
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
        staggerChildren: 0.15,
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
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const skillIcons = [
    { icon: Code, label: "Full-Stack", color: "text-blue-400" },
    { icon: Palette, label: "Design", color: "text-gray-400" },
    { icon: Megaphone, label: "Marketing", color: "text-gray-400" },
    { icon: Terminal, label: "DevOps", color: "text-gray-400" }
  ];

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-gray-500/1 to-gray-500/2"></div>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      {/* Minimal Gradient Orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80"
        style={{
          background: 'radial-gradient(circle, rgba(115, 115, 115, 0.1) 0%, rgba(115, 115, 115, 0.02) 50%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      
      {/* Light Silver Orb */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
        style={{
          background: 'radial-gradient(circle, rgba(192, 192, 192, 0.2) 0%, rgba(192, 192, 192, 0.05) 50%, transparent 70%)',
          filter: 'blur(30px)'
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6"
          >
            <Rocket className="h-4 w-4 text-blue-400" />
            <span className="text-white/70 text-sm font-medium">Solo Builder</span>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            The <span className="text-blue-400">One-Man</span> Army
          </motion.h2>
          
          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
          >
            Meet the solo founder who's redefining what it means to build a product from scratch. 
            <br />
            <span className="text-blue-400 font-medium">No committees, no meetings, just pure execution and relentless iteration.</span>
          </motion.p>

          {/* Skill Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {skillIcons.map((skill, index) => (
              <motion.div
                key={skill.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-2 text-white/60 text-sm"
              >
                <skill.icon className={`h-4 w-4 ${skill.color}`} />
                <span>{skill.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Team Member Card */}
        <motion.div 
          className="flex justify-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {teamMembers.map((member, index) => (
            <motion.div 
              key={member.id} 
              className="group relative p-8 sm:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm text-center flex flex-col items-center max-w-2xl"
              variants={itemVariants}
              whileHover={{ y: -4 }}
              onHoverStart={() => setHoveredMember(member.id)}
              onHoverEnd={() => setHoveredMember(null)}
            >
              {/* Subtle Background Orb */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 sm:w-48 sm:h-48"
                style={{
                  background: `radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)`,
                  filter: 'blur(50px)'
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-8">
                  <motion.div 
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/[0.1] bg-white/[0.02] p-1"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </motion.div>
                  
                  {/* Coffee Cup */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                    <Coffee className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Name & Role */}
                <motion.h3 
                  className="text-3xl font-bold text-white mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {member.name}
                </motion.h3>
                <motion.p 
                  className="text-blue-400 font-semibold text-lg mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {member.role}
                </motion.p>
                
                {/* Bio */}
                <motion.p 
                  className="text-gray-300 text-base leading-relaxed mb-8 max-w-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {member.bio}
                </motion.p>

                {/* Stats Grid */}
                <motion.div 
                  className="grid grid-cols-3 gap-6 mb-8 w-full max-w-md"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="text-center group/stat">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      ∞
                    </div>
                    <div className="text-xs text-gray-400 group-hover/stat:text-gray-300 transition-colors">
                      Coffee Cups
                    </div>
                  </div>
                  <div className="text-center group/stat">
                    <div className="text-3xl font-bold text-gray-400 mb-1">
                      3AM
                    </div>
                    <div className="text-xs text-gray-400 group-hover/stat:text-gray-300 transition-colors">
                      Debug Sessions
                    </div>
                  </div>
                  <div className="text-center group/stat">
                    <div className="text-3xl font-bold text-gray-400 mb-1">
                      100%
                    </div>
                    <div className="text-xs text-gray-400 group-hover/stat:text-gray-300 transition-colors">
                      Builder Energy
                    </div>
                  </div>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                  className="flex space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  {member.social.github && (
                    <motion.a
                      href={member.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 group/social"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github className="w-5 h-5 text-gray-300 group-hover/social:text-white transition-colors" />
                    </motion.a>
                  )}
                  {member.social.linkedin && (
                    <motion.a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 group/social"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-5 h-5 text-gray-300 group-hover/social:text-white transition-colors" />
                    </motion.a>
                  )}
                  {member.social.twitter && (
                    <motion.a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 group/social"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-5 h-5 text-gray-300 group-hover/social:text-white transition-colors" />
                    </motion.a>
                  )}
                  {member.social.email && (
                    <motion.a
                      href={`mailto:${member.social.email}`}
                      className="p-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-white/[0.2] transition-all duration-200 group/social"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail className="w-5 h-5 text-gray-300 group-hover/social:text-white transition-colors" />
                    </motion.a>
                  )}
                </motion.div>
              </div>

              {/* Subtle Hover Effect */}
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-4 text-gray-400 text-lg max-w-2xl mx-auto p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <Code className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <span className="italic">
              "Building solo doesn't mean building alone. It means building exactly what you want, when you want it, with zero compromises."
            </span>
            <Code className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutTeam; 