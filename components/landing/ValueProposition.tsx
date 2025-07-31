"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { gsap, Power3, Power2 } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Zap, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Globe,
  Smartphone,
  Laptop,
  Clock,
  Lock,
  Sparkles,
  Target,
  X,
  Star,
  Award,
  Link,
  BookOpen,
  UserCheck,
  FolderOpen,
  DollarSign,
  Monitor,
  Rocket,
  Zap as Lightning,
  RefreshCw,
  Save,
  Gift,
  Smartphone as Mobile,
  TrendingUp,
  Award as Trophy,
  CheckCircle2,
  Cloud,
  HelpCircle,
  Play,
  ChevronDown,
  ChevronUp
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Enhanced scrollbar styles with momentum-based physics
const enhancedScrollbarStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .infinite-scroll-container {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  
  .fade-edge-top {
    mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
  }
  
  .fade-edge-bottom {
    mask-image: linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%);
    -webkit-mask-image: linear-gradient(to top, transparent 0%, black 20%, black 80%, transparent 100%);
  }
  
  .scroll-indicator {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

// Custom hook for infinite scroll with momentum
const useInfiniteScroll = (containerRef: React.RefObject<HTMLDivElement>, items: any[], itemHeight: number = 80) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastScrollTop = 0;
    let velocity = 0;
    const friction = 0.95;

    const handleScroll = () => {
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      velocity = scrollTop - lastScrollTop;
      lastScrollTop = scrollTop;
      
      setScrollPosition(scrollTop);
      setIsScrolling(true);
      
      // Clear existing timeout
      clearTimeout((container as any).scrollTimeout);
      
      // Set timeout to stop scrolling indicator
      (container as any).scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    const animateScroll = () => {
      if (Math.abs(velocity) > 0.1) {
        container.scrollTop += velocity;
        velocity *= friction;
        animationFrameId = requestAnimationFrame(animateScroll);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start momentum animation when scroll ends
    container.addEventListener('scrollend', () => {
      if (Math.abs(velocity) > 1) {
        animationFrameId = requestAnimationFrame(animateScroll);
      }
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [containerRef]);

  return { scrollPosition, isScrolling };
};

const ValueProposition = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const traditionalScrollRef = useRef<HTMLDivElement>(null);
  const whizboardScrollRef = useRef<HTMLDivElement>(null);

  const benefits = [
    {
      icon: Target,
      title: "Precision Drawing",
      description: "Professional-grade drawing tools with pixel-perfect accuracy for detailed designs and technical diagrams.",
      metric: "99.9% accuracy",
      stats: "50k+ drawings daily",
      iconColor: "text-blue-400",
      gradient: "from-blue-600/10 to-blue-400/5"
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live cursors, instant updates, and team presence indicators.",
      metric: "<50ms latency",
      stats: "150k+ active users",
      iconColor: "text-emerald-400",
      gradient: "from-emerald-600/10 to-emerald-400/5"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth drawing even with complex diagrams and large teams.",
      metric: "60fps rendering",
      stats: "2x faster loading",
      iconColor: "text-amber-400",
      gradient: "from-amber-600/10 to-amber-400/5"
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "Instant Access",
      description: "No downloads, no installations. Start collaborating in seconds with any modern browser.",
      highlight: "Zero Setup"
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "End-to-end encryption, secure cloud storage, and enterprise compliance standards.",
      highlight: "256-bit Encryption"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Features",
      description: "Smart shape recognition, auto-formatting, and intelligent collaboration suggestions.",
      highlight: "Coming Soon"
    }
  ];

  // Enhanced traditional approach items with professional icons
  const traditionalItems = [
    { text: "Multiple disconnected tools", icon: Link, description: "Switching between apps constantly", severity: "high" },
    { text: "Complex setup and learning curve", icon: BookOpen, description: "Weeks of training required", severity: "high" },
    { text: "Limited real-time collaboration", icon: UserCheck, description: "Delayed team updates", severity: "medium" },
    { text: "Version control nightmares", icon: FolderOpen, description: "Lost work and conflicts", severity: "high" },
    { text: "Expensive licensing per user", icon: DollarSign, description: "High monthly costs", severity: "medium" },
    { text: "Poor mobile experience", icon: Mobile, description: "Limited functionality", severity: "medium" },
    { text: "No cloud synchronization", icon: Cloud, description: "Work stuck on devices", severity: "high" },
    { text: "Outdated user interface", icon: Monitor, description: "Clunky and slow", severity: "medium" },
    { text: "Limited integration options", icon: Link, description: "Isolated from other tools", severity: "medium" },
    { text: "Poor customer support", icon: HelpCircle, description: "Slow response times", severity: "high" },
    { text: "No real-time analytics", icon: TrendingUp, description: "Missing insights", severity: "medium" },
    { text: "Security vulnerabilities", icon: Shield, description: "Outdated protocols", severity: "high" }
  ];

  // Enhanced Whizboard solution items with professional icons
  const whizboardItems = [
    { text: "All-in-one collaborative platform", icon: Rocket, description: "Everything you need in one place", benefit: "high" },
    { text: "Intuitive design, instant productivity", icon: Lightning, description: "Zero learning curve", benefit: "high" },
    { text: "Real-time collaboration built-in", icon: RefreshCw, description: "Live updates and cursors", benefit: "high" },
    { text: "Automatic saving and sync", icon: Save, description: "Never lose your work", benefit: "high" },
    { text: "Free forever plan available", icon: Gift, description: "Start using immediately", benefit: "medium" },
    { text: "Perfect on any device", icon: Mobile, description: "Responsive design", benefit: "high" },
    { text: "Cloud-first architecture", icon: Cloud, description: "Access from anywhere", benefit: "high" },
    { text: "Modern, fast interface", icon: Monitor, description: "Smooth performance", benefit: "high" },
    { text: "Rich integration ecosystem", icon: Link, description: "Connects with your tools", benefit: "medium" },
    { text: "24/7 customer support", icon: HelpCircle, description: "Always here to help", benefit: "high" },
    { text: "Advanced analytics dashboard", icon: TrendingUp, description: "Deep insights", benefit: "medium" },
    { text: "Enterprise-grade security", icon: Shield, description: "SOC 2 compliant", benefit: "high" }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
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

  // Enhanced scroll animations
  const scrollVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: enhancedScrollbarStyles }} />
      <section 
        ref={ref} 
        className="relative py-16 md:py-24 overflow-hidden bg-[#0A0A0B]"
      >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.015] dot-pattern"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-[60px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full filter blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Value Proposition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="h-4 w-4 text-blue-400" />
            </motion.div>
            <span className="text-white/70 text-sm font-medium">Why Choose Whizboard</span>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight text-center">
              Transform Ideas Into
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Actionable Plans
              </span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Stop struggling with scattered thoughts and chaotic brainstorms. Our professional-grade 
              collaborative whiteboard transforms creative chaos into organized, actionable outcomes.
            </p>
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm"
          >
            <div className="flex items-center space-x-2 text-white/60">
              <Users className="h-4 w-4 text-blue-400" />
              <span>150k+ users worldwide</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Enterprise ready</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -8 }}
            >
              <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                {/* Gradient Orb Background */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] group-hover:scale-110 transition-transform duration-500 ${benefit.gradient.includes('amber') ? 'bg-amber-600/20' : benefit.gradient.includes('blue') ? 'bg-blue-600/20' : 'bg-emerald-600/20'}`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`inline-flex p-4 rounded-xl border group-hover:scale-105 transition-all duration-300 ${benefit.gradient.includes('amber') ? 'bg-amber-600/10 border-amber-600/20 group-hover:bg-amber-600/15' : benefit.gradient.includes('blue') ? 'bg-blue-600/10 border-blue-600/20 group-hover:bg-blue-600/15' : 'bg-emerald-600/10 border-emerald-600/20 group-hover:bg-emerald-600/15'}`}>
                      <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                    </div>
                    <span className={`text-xs font-medium bg-white/[0.05] px-3 py-1 rounded-full ${benefit.iconColor}`}>
                      {benefit.stats}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-white transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors mb-4">
                    {benefit.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm ${benefit.iconColor}`}>{benefit.metric}</span>
                    <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Traditional Approach & Whizboard Solution */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Why Teams Choose{" "}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Whizboard
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-white/70 max-w-3xl mx-auto"
            >
              See the difference between traditional tools and our modern
              approach to collaborative whiteboarding.
            </motion.p>
          </div>

          {/* Enhanced Comparison Grid - Bento Style with Infinite Scroll */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[500px]">
            {/* Traditional Approach - Large Card with Infinite Scroll */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="lg:col-span-5 group"
            >
              <div className="relative h-full bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden">
                {/* Subtle Gradient Orb Background */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full filter blur-[60px] opacity-20 group-hover:scale-110 transition-transform duration-500"
                     style={{
                       background: 'radial-gradient(circle, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.1) 50%, transparent 70%)'
                     }}>
                </div>
                
                {/* Enhanced Header */}
                <div className="relative z-10 flex items-center mb-8">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mr-6 border border-red-500/20 group-hover:scale-105 transition-transform duration-300">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Traditional Approach
                    </h3>
                    <p className="text-white/60 text-sm font-medium">Outdated, fragmented tools</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-red-400/80 text-xs font-medium">Inefficient workflow</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Infinite Vertical Scroll Container with Fading Edges */}
                <div className="relative z-10 h-80 overflow-hidden">
                  {/* Top Fade Effect */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/[0.02] to-transparent z-20 pointer-events-none"></div>
                  
                  {/* Scrollable Content with Enhanced Styling */}
                  <div 
                    ref={traditionalScrollRef}
                    className="h-full overflow-y-auto scrollbar-hide infinite-scroll-container fade-edge-top fade-edge-bottom"
                  >
                    <div className="space-y-3 pb-4">
                      {traditionalItems.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          viewport={{ once: true }}
                          className={`flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200 group/item ${
                            item.severity === 'high' ? 'border-red-500/20 hover:border-red-500/30' : 
                            item.severity === 'medium' ? 'border-orange-500/20 hover:border-orange-500/30' : 
                            'border-yellow-500/20 hover:border-yellow-500/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200 ${
                            item.severity === 'high' ? 'bg-red-500/10 border border-red-500/20' : 
                            item.severity === 'medium' ? 'bg-orange-500/10 border border-orange-500/20' : 
                            'bg-yellow-500/10 border border-yellow-500/20'
                          }`}>
                            <item.icon className={`w-5 h-5 ${
                              item.severity === 'high' ? 'text-red-400' : 
                              item.severity === 'medium' ? 'text-orange-400' : 
                              'text-yellow-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="text-white/90 text-sm font-medium">{item.text}</div>
                            <div className="text-white/50 text-xs">{item.description}</div>
                          </div>
                          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bottom Fade Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/[0.02] to-transparent z-20 pointer-events-none"></div>
                  
                  {/* Scroll Indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/40 text-xs">
                    <ChevronDown className="w-3 h-3 scroll-indicator" />
                    <span>Scroll</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* VS Divider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:col-span-2 flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-white/[0.05] rounded-full flex items-center justify-center border border-white/[0.1] backdrop-blur-sm">
                  <span className="text-white/60 font-bold text-xl">VS</span>
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-500/10 animate-pulse"></div>
              </div>
            </motion.div>

            {/* Whizboard Solution - Large Card with Infinite Scroll */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="lg:col-span-5 group"
            >
              <div className="relative h-full bg-white/[0.02] backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                {/* Subtle Gradient Orb Background */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full filter blur-[60px] opacity-20 group-hover:scale-110 transition-transform duration-500"
                     style={{
                       background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                     }}>
                </div>
                
                {/* Enhanced Header */}
                <div className="relative z-10 flex items-center mb-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mr-6 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                    <CheckCircle2 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Whizboard Solution
                    </h3>
                    <p className="text-blue-400/80 text-sm font-medium">Modern, unified platform</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400/80 text-xs font-medium">Streamlined workflow</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Infinite Vertical Scroll Container with Fading Edges */}
                <div className="relative z-10 h-80 overflow-hidden">
                  {/* Top Fade Effect */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/[0.02] to-transparent z-20 pointer-events-none"></div>
                  
                  {/* Scrollable Content with Enhanced Styling */}
                  <div 
                    ref={whizboardScrollRef}
                    className="h-full overflow-y-auto scrollbar-hide infinite-scroll-container fade-edge-top fade-edge-bottom"
                  >
                    <div className="space-y-3 pb-4">
                      {whizboardItems.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                          viewport={{ once: true }}
                          className={`flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200 group/item ${
                            item.benefit === 'high' ? 'border-emerald-500/20 hover:border-emerald-500/30' : 
                            item.benefit === 'medium' ? 'border-blue-500/20 hover:border-blue-500/30' : 
                            'border-cyan-500/20 hover:border-cyan-500/30'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform duration-200 ${
                            item.benefit === 'high' ? 'bg-emerald-500/10 border border-emerald-500/20' : 
                            item.benefit === 'medium' ? 'bg-blue-500/10 border border-blue-500/20' : 
                            'bg-cyan-500/10 border border-cyan-500/20'
                          }`}>
                            <item.icon className={`w-5 h-5 ${
                              item.benefit === 'high' ? 'text-emerald-400' : 
                              item.benefit === 'medium' ? 'text-blue-400' : 
                              'text-cyan-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="text-white/90 text-sm font-medium">{item.text}</div>
                            <div className="text-white/50 text-xs">{item.description}</div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bottom Fade Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/[0.02] to-transparent z-20 pointer-events-none"></div>
                  
                  {/* Scroll Indicator */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/40 text-xs">
                    <ChevronDown className="w-3 h-3 scroll-indicator" />
                    <span>Scroll</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { 
                title: "Time Saved", 
                value: "85%", 
                description: "Faster than traditional tools",
                icon: Clock,
                color: "text-blue-400"
              },
              { 
                title: "User Satisfaction", 
                value: "4.9/5", 
                description: "Average rating from users",
                icon: Star,
                color: "text-yellow-400"
              },
              { 
                title: "Cost Reduction", 
                value: "60%", 
                description: "Lower than enterprise solutions",
                icon: Shield,
                color: "text-emerald-400"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 overflow-hidden">
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-white/70 text-sm font-medium">{stat.title}</div>
                      <div className="text-white/50 text-xs">{stat.description}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Feature Highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "visible"}
          className="text-center mb-16"
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </motion.h3>
          <motion.p
            variants={itemVariants}
            className="text-white/70 text-lg mb-12 max-w-2xl mx-auto"
          >
            Professional-grade features designed for modern teams and workflows
          </motion.p>
          
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 text-center overflow-hidden">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex p-4 rounded-xl bg-white/[0.05] border border-white/[0.1] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-blue-400" />
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <h4 className="text-xl font-semibold text-white">
                        {feature.title}
                      </h4>
                      <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                        {feature.highlight}
                      </span>
                    </div>
                    
                    <p className="text-white/70 leading-relaxed group-hover:text-white/80 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced CTA Section - Following Pricing Section Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 lg:p-16 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full filter blur-[80px] opacity-20"
                   style={{
                     background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                   }}>
              </div>
              <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full filter blur-[80px] opacity-20"
                   style={{
                     background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
                   }}>
              </div>
            </div>
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center space-x-2 bg-white/[0.05] border border-white/[0.1] rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
              >
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span className="text-white/80 text-sm font-medium">Ready to Transform Your Workflow?</span>
              </motion.div>
              
              <motion.h4
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Start Building Better{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Together
                </span>
              </motion.h4>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-white/70 text-lg lg:text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Join thousands of teams already collaborating faster and smarter with Whizboard. 
                No credit card required, start free today.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6"
              >
                <motion.a
                  href="/signup"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-3 min-w-[200px] justify-center"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.a>
                
                <motion.a
                  href="#demo"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.12] flex items-center gap-3 min-w-[200px] justify-center"
                >
                  <span>Watch Demo</span>
                  <Play className="w-5 h-5" />
                </motion.a>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/50"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  <span>Setup in 2 minutes</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default ValueProposition;