"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Search,
  ArrowLeft,
  HelpCircle,
  Mail,
  MapPin,
  Users,
  Settings,
  FileText,
  Globe,
  Zap,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

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

// Quick navigation options
const quickNavOptions = [
  {
    title: "Home",
    description: "Return to the main page",
    icon: Home,
    href: "/",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Help Center",
    description: "Find answers and support",
    icon: HelpCircle,
    href: "/help",
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Contact Us",
    description: "Get in touch with our team",
    icon: Mail,
    href: "/contact",
    color: "from-purple-500 to-violet-600"
  },
  {
    title: "About",
    description: "Learn more about WhizBoard",
    icon: Users,
    href: "/about",
    color: "from-orange-500 to-red-600"
  }
];

// Popular pages
const popularPages = [
  {
    title: "Privacy Policy",
    description: "How we protect your data",
    href: "/privacy"
  },
  {
    title: "Terms of Service",
    description: "Our terms and conditions",
    href: "/terms"
  },
  {
    title: "My Boards",
    description: "Access your whiteboards",
    href: "/my-boards"
  },
  {
    title: "Settings",
    description: "Manage your account",
    href: "/profile"
  }
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center">
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="mb-8"
          >
            <h1 className="text-9xl lg:text-[12rem] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-none">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl hover:bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              Quick Navigation
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickNavOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <motion.div
                    key={option.title}
                    variants={fadeInUp}
                    className="group"
                  >
                    <Link href={option.href}>
                      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 h-full">
                        <div className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{option.title}</h4>
                        <p className="text-slate-600 text-sm mb-4">{option.description}</p>
                        
                        <div className="flex items-center gap-2 text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                          Visit Page
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Popular Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              Popular Pages
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularPages.map((page, index) => (
                <Link
                  key={page.title}
                  href={page.href}
                  className="group bg-white/60 backdrop-blur-sm rounded-xl p-4 hover:bg-white hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-slate-300"
                >
                  <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {page.title}
                  </h4>
                  <p className="text-slate-600 text-sm">{page.description}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Can't find what you're looking for?</h3>
                <p className="text-slate-600">Try searching our help center or contact our support team.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/help"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <HelpCircle className="w-4 h-4" />
                Search Help Center
              </Link>
              
              <Link
                href="/contact"
                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 