"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  ArrowRight,
  CheckCircle,
  Send,
  Heart,
  Globe,
  Shield,
  Users,
  Star,
  Clock,
  Building2,
  BookOpen,
  Zap,
} from "lucide-react";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter subscription
    setIsSubscribed(true);
    setEmail("");
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Templates", href: "#templates" },
      { name: "Integrations", href: "#integrations" },
      { name: "API", href: "/api" },
    ],
    company: [
              { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Webinars", href: "/webinars" },
      { name: "Status", href: "/status" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Security", href: "/security" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/whizboard" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/whizboard",
    },
    { name: "GitHub", icon: Github, href: "https://github.com/whizboard" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/whizboard" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <footer
      ref={ref}
      id="footer"
      className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>

        {/* Optimized gradient orbs for better performance */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full blur-[40px]"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.08) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full blur-[50px]"
          style={{
            background:
              "radial-gradient(circle, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.03) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Enhanced Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 lg:mb-16"
        >
          {/* Enhanced Company Info */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Whizboard
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-400">Made with love</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed text-sm sm:text-base">
              Transform chaotic brainstorms into organized action plans with
              professional-grade collaborative tools that actually work.
            </p>
            {/* Enhanced Stats */}
            <div className="flex gap-4 mb-8 justify-center items-start">
              <div className="text-center p-3 sm:p-4 bg-white/[0.02] rounded-lg border border-white/[0.05] backdrop-blur-sm flex-1">
                <div className="text-lg sm:text-xl font-bold text-blue-400">
                  50K+
                </div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white/[0.02] rounded-lg border border-white/[0.05] backdrop-blur-sm flex-1">
                <div className="text-lg sm:text-xl font-bold text-emerald-400">
                  99.9%
                </div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>

              {/* Enhanced Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 bg-white/[0.02] rounded-lg group-hover:bg-blue-500/10 transition-colors border border-white/[0.05]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-sm">hello@whizboard.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-emerald-400 transition-colors group">
                  <div className="p-2 bg-white/[0.02] rounded-lg group-hover:bg-emerald-500/10 transition-colors border border-white/[0.05]">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors group">
                  <div className="p-2 bg-white/[0.02] rounded-lg group-hover:bg-blue-500/10 transition-colors border border-white/[0.05]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Footer Links */}
          <motion.div variants={itemVariants} className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-blue-500/20 rounded-lg">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                Product
              </h3>
            </div>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-400" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-blue-500/20 rounded-lg">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                Company
              </h3>
            </div>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-400" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-blue-500/20 rounded-lg">
                <BookOpen className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">
                Resources
              </h3>
            </div>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <a
                    href={link.href}
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-all duration-200 text-sm"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-blue-400" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Enhanced Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative bg-white/[0.02] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-12 lg:mb-16 border border-white/[0.05] backdrop-blur-sm overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300"
        >
          {/* Background gradient orb */}
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 sm:w-96 h-24 sm:h-32 rounded-full blur-[40px] sm:blur-[60px]"
            style={{
              background:
                "radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10">
            <div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4 sm:mb-6">
                <Mail className="h-3 w-3 mr-1" />
                Newsletter
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Stay updated with Whizboard
              </h3>
              <p className="text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
                Get the latest updates, tips, and insights delivered to your
                inbox.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    No spam, unsubscribe anytime
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">Free resources included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">Weekly insights & tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-gray-300">
                    Early access to features
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="relative">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 sm:py-4 bg-white/[0.02] border border-white/[0.08] rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg border border-blue-500/20 rounded-lg text-sm sm:text-base min-h-[44px]"
                >
                  <Send className="h-4 w-4" />
                  <span>Get Free Updates</span>
                </motion.button>
              </div>

              {isSubscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-3 text-emerald-400 text-sm flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Successfully subscribed!</span>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Enhanced Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-white/[0.05] pt-8 lg:pt-12 relative"
        >
          <div className="flex flex-col space-y-6 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 relative z-10">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-400 text-sm">
              <span>© 2024 Whizboard. All rights reserved.</span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400" /> in San
                Francisco
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8 text-sm">
              {footerLinks.legal.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ y: -1 }}
                  className="text-gray-400 hover:text-blue-400 transition-all duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Enhanced Social Links */}
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group p-2.5 sm:p-3 bg-white/[0.02] backdrop-blur-sm rounded-lg sm:rounded-xl text-gray-400 hover:text-white border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform group-hover:text-blue-400" />
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
