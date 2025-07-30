"use client";

import { motion, useInView } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Target,
  Heart,
  Zap,
  Globe,
  Award,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Play,
  Linkedin,
  Twitter,
  Mail,
  Star,
  CheckCircle,
  Layers,
  PenTool,
  Github
} from "lucide-react";

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

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }
};

const orbAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" as const }
};

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

export default function AboutPage() {
  const [companyStats, setCompanyStats] = useState<CompanyStat[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, teamRes, timelineRes] = await Promise.all([
          fetch('/api/about/stats'),
          fetch('/api/about/team'),
          fetch('/api/about/timeline'),
        ]);

        if (!statsRes.ok) throw new Error(`HTTP error! status: ${statsRes.status} from stats`);
        if (!teamRes.ok) throw new Error(`HTTP error! status: ${teamRes.status} from team`);
        if (!timelineRes.ok) throw new Error(`HTTP error! status: ${timelineRes.status} from timeline`);

        const statsData: CompanyStat[] = await statsRes.json();
        const teamData: TeamMember[] = await teamRes.json();
        const timelineData: TimelineEvent[] = await timelineRes.json();

        setCompanyStats(statsData);
        setTeamMembers(teamData);
        setTimelineEvents(timelineData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
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
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0.08) 50%, transparent 70%)',
          filter: 'blur(80px)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: 2
          }
        }}
      />
      
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-[70vh] flex items-center justify-center text-center overflow-hidden"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="relative z-10 p-6 max-w-4xl">
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300 mb-6"
          >
            <Zap className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
            <span className="text-white/70 text-sm font-medium">Our Story</span>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
            variants={fadeInUp}
          >
            About WhizBoard
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            We're building the future of collaborative whiteboarding. Learn about our journey, values, and the people behind the innovation.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-white/10 text-base font-medium rounded-full text-white bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-sm transition-all duration-300 group hover:border-blue-500/40 hover:scale-105">
              Contact Us
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
            variants={staggerContainer}
          >
            {companyStats.map((stat) => (
              <motion.div 
                key={stat.id} 
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center flex flex-col items-center justify-center"
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
              >
                {/* Enhanced Gradient Orb Background */}
                <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                  filter: 'blur(40px)'
                }}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-5xl sm:text-6xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    <AnimatedCounter end={parseInt(stat.value)} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{stat.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{stat.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm group/badge hover:scale-105 transition-transform duration-300">
              <Heart className="h-4 w-4 text-blue-400 group-hover/badge:animate-pulse" />
              <span className="text-white/70 text-sm font-medium">Our Core Values</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 text-center">
              Our Mission & Values
            </h2>
            
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              At WhizBoard, we believe in empowering teams to innovate and collaborate without limits.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm flex flex-col items-center text-center"
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="inline-flex p-4 rounded-xl bg-blue-600/10 border border-blue-600/20 group-hover:bg-blue-600/15 transition-colors mb-6">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Clear Vision</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                To revolutionize remote collaboration by providing an intuitive, powerful, and seamless whiteboarding experience for teams worldwide.
              </p>
            </motion.div>

            <motion.div 
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm flex flex-col items-center text-center"
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="inline-flex p-4 rounded-xl bg-purple-600/10 border border-purple-600/20 group-hover:bg-purple-600/15 transition-colors mb-6">
                <Heart className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">User-Centric Design</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                We put our users first, constantly listening to feedback and iterating to build features that genuinely solve their problems.
              </p>
            </motion.div>

            <motion.div 
              className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm flex flex-col items-center text-center"
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" as const } }}
            >
              {/* Enhanced Gradient Orb Background */}
              <div className="absolute -top-10 -right-10 w-20 h-20" style={{
                background: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}></div>
              
              <div className="inline-flex p-4 rounded-xl bg-yellow-600/10 border border-yellow-600/20 group-hover:bg-yellow-600/15 transition-colors mb-6">
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Innovation & Agility</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                We embrace new technologies and agile methodologies to deliver cutting-edge features and adapt quickly to market needs.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={member.id} 
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 backdrop-blur-sm text-center flex flex-col items-center"
                variants={fadeInUp}
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

      {/* Timeline Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-purple-500 to-transparent opacity-40 blur-sm"></div>
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Enhanced Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(79, 70, 229, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(-50%, -50%)'
          }}></div>
          
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)',
            filter: 'blur(70px)',
            transform: 'translate(50%, 50%)'
          }}></div>
          
          <motion.div
            className="max-w-3xl mx-auto relative"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6 group/badge hover:scale-105 transition-transform duration-300">
              <Zap className="h-4 w-4 text-purple-400 group-hover/badge:animate-pulse" />
              <span className="text-white/70 text-sm font-medium">Get Started</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              Ready to Transform Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">Collaboration</span>?
            </h2>
            
            <p className="text-base sm:text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of teams who are already using WhizBoard to innovate faster.
            </p>
            
            <Link 
              href="/signup" 
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Start Collaborating Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </motion.div>
        </div>
        
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] bg-repeat opacity-[0.02] pointer-events-none"></div>
      </section>
    </div>
  );
}
