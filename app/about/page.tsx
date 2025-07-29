"use client";

import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800">
      {/* Hero Section */}
      <motion.section 
        className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden bg-white shadow-sm"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-blue-500/10 to-transparent opacity-50"></div>
        <div className="relative z-10 p-6 max-w-4xl">
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight"
            variants={fadeInUp}
          >
            About <span className="text-blue-600">WhizBoard</span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-8"
            variants={fadeInUp}
          >
            We're building the future of collaborative whiteboarding. Learn about our journey, values, and the people behind the innovation.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-lg">
              Contact Us
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            Our Achievements
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {companyStats.map((stat) => (
              <motion.div key={stat.id} className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-xl p-8 shadow-xl border border-white border-opacity-20 text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300 ease-out"
                variants={fadeInUp}
              >
                <div className="text-6xl font-bold mb-3 text-white">
                  <AnimatedCounter end={parseInt(stat.value)} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-white">{stat.name}</h3>
                <p className="text-blue-100 text-opacity-80 leading-relaxed">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Our Mission & Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">At WhizBoard, we believe in empowering teams to innovate and collaborate without limits.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <motion.div 
              className="bg-gray-50 rounded-xl p-8 shadow-md flex flex-col items-center text-center group hover:shadow-lg transition-shadow duration-300"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-6 transition-transform duration-300 group-hover:scale-110">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Clear Vision</h3>
              <p className="text-gray-600 leading-relaxed">To revolutionize remote collaboration by providing an intuitive, powerful, and seamless whiteboarding experience for teams worldwide.</p>
            </motion.div>

            <motion.div 
              className="bg-gray-50 rounded-xl p-8 shadow-md flex flex-col items-center text-center group hover:shadow-lg transition-shadow duration-300"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <div className="p-4 rounded-full bg-green-100 text-green-600 mb-6 transition-transform duration-300 group-hover:scale-110">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">User-Centric Design</h3>
              <p className="text-gray-600 leading-relaxed">We put our users first, constantly listening to feedback and iterating to build features that genuinely solve their problems.</p>
            </motion.div>

            <motion.div 
              className="bg-gray-50 rounded-xl p-8 shadow-md flex flex-col items-center text-center group hover:shadow-lg transition-shadow duration-300"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mb-6 transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Innovation & Agility</h3>
              <p className="text-gray-600 leading-relaxed">We embrace new technologies and agile methodologies to deliver cutting-edge features and adapt quickly to market needs.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A passionate group of innovators, designers, and engineers dedicated to transforming the way teams collaborate.</p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            {teamMembers.map((member) => (
              <motion.div key={member.id} className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col items-center group hover:shadow-xl transition-shadow duration-300"
                variants={fadeInUp}
              >
                <div className="relative w-32 h-32 rounded-full mb-6 overflow-hidden border-4 border-blue-200 group-hover:border-blue-400 transition-colors duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt={member.name} className="object-cover w-full h-full" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{member.bio}</p>
                <div className="flex space-x-4">
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors duration-300">
                      <Linkedin className="h-6 w-6" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}
                  {member.social.email && (
                    <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                      <Mail className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Journey/Timeline Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From a bold idea to a thriving platform, here's how we've grown.</p>
          </motion.div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200 hidden md:block"></div>
            
            <div className="space-y-12 md:space-y-24">
              {timelineEvents.map((event, index) => {
                const IconComponent = iconMapping[event.icon as keyof typeof iconMapping];
                const isEven = index % 2 === 0;

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
                        <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl shadow-lg p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.year}: {event.title}</h3>
                          <p className="text-gray-600">{event.description}</p>
                        </motion.div>
                      )}
                    </div>
                    <div className="md:w-1/12 flex justify-center z-10">
                      <div className="p-4 rounded-full bg-blue-600 text-white shadow-xl border-4 border-white transform scale-110">
                        {IconComponent && <IconComponent className="h-8 w-8" />}
                      </div>
                    </div>
                    <div className="md:w-5/12 text-left md:pl-10 mt-6 md:mt-0">
                      {!isEven && (
                        <motion.div variants={fadeInUp} className="bg-gray-50 rounded-xl shadow-lg p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.year}: {event.title}</h3>
                          <p className="text-gray-600">{event.description}</p>
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
      <section className="py-16 md:py-24 bg-blue-600 text-white text-center">
        <motion.div 
          className="max-w-4xl mx-auto px-6 lg:px-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to Transform Your Collaboration?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">Join thousands of teams who are already using WhizBoard to innovate faster.</p>
          <Link href="/signup" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-base font-medium rounded-full text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-300 shadow-lg group">
            Start Collaborating Today
            <Star className="ml-3 h-5 w-5 fill-blue-600 group-hover:fill-blue-700 transition-colors duration-300" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
