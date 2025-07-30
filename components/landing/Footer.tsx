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
  Sparkles,
  Heart,
  Globe,
  Shield
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
      { name: "API", href: "/api" }
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Contact", href: "/contact" }
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Webinars", href: "/webinars" },
      { name: "Status", href: "/status" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
      { name: "Security", href: "/security" }
    ]
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/whizboard" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/whizboard" },
    { name: "GitHub", icon: Github, href: "https://github.com/whizboard" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/whizboard" }
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <footer ref={ref} className="relative bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-gradient-radial from-blue-500/3 via-transparent to-transparent rounded-full" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-4 gap-12 mb-12"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">W</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Whizboard</span>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-400">Made with love</span>
                </div>
              </div>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Transform chaotic brainstorms into organized action plans with professional-grade 
              collaborative tools that actually work.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="text-xl font-bold text-blue-400">50K+</div>
                <div className="text-xs text-gray-400">Active Users</div>
              </div>
              <div className="text-center p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="text-xl font-bold text-purple-400">99.9%</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400 hover:text-blue-400 transition-colors group">
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <span>hello@whizboard.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-green-400 transition-colors group">
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-green-500/10 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-purple-400 transition-colors group">
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-blue-500/20 rounded-lg">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Product</h3>
            </div>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <motion.li 
                  key={link.name}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <a 
                    href={link.href}
                    className="group flex items-center text-gray-400 hover:text-blue-400 transition-all duration-200"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-purple-500/20 rounded-lg">
                <Heart className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white">Company</h3>
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
                    className="group flex items-center text-gray-400 hover:text-purple-400 transition-all duration-200"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1 bg-green-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Resources</h3>
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
                    className="group flex items-center text-gray-400 hover:text-green-400 transition-all duration-200"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl p-8 mb-12 border border-gray-700 backdrop-blur-sm overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">
                  Stay updated with Whizboard
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">No spam, unsubscribe anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Free resources included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Weekly insights & tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Early access to features</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <div className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                  <span>Subscribe</span>
                </motion.button>
              </div>
              
              {isSubscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 text-green-400 text-sm flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Successfully subscribed!</span>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© 2024 Whizboard. All rights reserved.</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-400" /> in San Francisco
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm">
              {footerLinks.legal.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ y: -1 }}
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
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