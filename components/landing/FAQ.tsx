"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { 
  ChevronDown, 
  Search, 
  HelpCircle,
  Users,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  Sparkles,
  MessageCircle,
  BookOpen
} from "lucide-react";

const FAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "Can multiple people edit simultaneously without conflicts?",
      answer: "Yes! Advanced operational transformation ensures smooth collaboration with unlimited concurrent users and live cursor visibility. Our technology prevents conflicts and maintains data integrity even with dozens of simultaneous editors.",
      category: "collaboration",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-400",
      highlight: "Real-time collaboration"
    },
    {
      question: "Any software to install?",
      answer: "No downloads required. Runs entirely in your browser with full functionality across Chrome, Safari, Firefox, and Edge. Just open the website and start collaborating immediately.",
      category: "setup",
      icon: Globe,
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-400",
      highlight: "Zero installation"
    },
    {
      question: "How secure is our project data?",
      answer: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and secure cloud storage using financial-institution standards. Your data is protected with the same level of security used by banks.",
      category: "security",
      icon: Shield,
      gradient: "from-purple-500 to-violet-500",
      iconColor: "text-purple-400",
      highlight: "Bank-level security"
    },
    {
      question: "Integration with existing tools?",
      answer: "Native integrations with Slack, Microsoft Teams, Google Workspace, plus powerful API for custom workflow integrations. Connect Whizboard to your existing tools seamlessly.",
      category: "integrations",
      icon: Globe,
      gradient: "from-orange-500 to-red-500",
      iconColor: "text-orange-400",
      highlight: "Seamless integrations"
    },
    {
      question: "What's the performance like with large teams?",
      answer: "Lightning-fast performance with sub-50ms latency even with 100+ simultaneous users. Our optimized architecture scales effortlessly to handle enterprise teams.",
      category: "performance",
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      iconColor: "text-yellow-400",
      highlight: "Sub-50ms latency"
    },
    {
      question: "Can I export my work to other formats?",
      answer: "Yes! Export to PNG, SVG, PDF, and more. Pro plans include advanced export options and custom branding capabilities.",
      category: "export",
      icon: Globe,
      gradient: "from-indigo-500 to-blue-500",
      iconColor: "text-indigo-400",
      highlight: "Multiple formats"
    },
    {
      question: "Is there a mobile app?",
      answer: "No app needed! Whizboard works perfectly on mobile browsers with touch-optimized interface. Full functionality across all devices without downloads.",
      category: "mobile",
      icon: Globe,
      gradient: "from-pink-500 to-rose-500",
      iconColor: "text-pink-400",
      highlight: "Mobile optimized"
    },
    {
      question: "What happens if I lose my internet connection?",
      answer: "Offline mode allows you to continue working, and changes sync automatically when you reconnect. Never lose your work due to connectivity issues.",
      category: "offline",
      icon: Zap,
      gradient: "from-teal-500 to-cyan-500",
      iconColor: "text-teal-400",
      highlight: "Offline support"
    },
    {
      question: "Can I use my own domain and branding?",
      answer: "Enterprise plans include custom domain support and white-label branding options. Make Whizboard your own with your company's look and feel.",
      category: "branding",
      icon: Shield,
      gradient: "from-violet-500 to-purple-500",
      iconColor: "text-violet-400",
      highlight: "Custom branding"
    },
    {
      question: "How do I get support?",
      answer: "Free plans include email support, while Pro and Enterprise plans include priority support, dedicated success managers, and training sessions.",
      category: "support",
      icon: HelpCircle,
      gradient: "from-emerald-500 to-green-500",
      iconColor: "text-emerald-400",
      highlight: "24/7 support"
    }
  ];

  const categories = [
    { name: "All", value: "all" },
    { name: "Collaboration", value: "collaboration" },
    { name: "Security", value: "security" },
    { name: "Performance", value: "performance" },
    { name: "Setup", value: "setup" }
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

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
    <section ref={ref} className="relative py-24 bg-[#0A0A0B] overflow-hidden">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/grid-pattern-dark.svg)',
          backgroundSize: 'cover',
        }}
      ></div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
        animate={{ x: ['0%', '50%', '0%'], y: ['0%', '50%', '0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      ></motion.div>
      <motion.div
        className="absolute top-1/2 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
        animate={{ x: ['0%', '-50%', '0%'], y: ['0%', '-50%', '0%'] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      ></motion.div>
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
        animate={{ x: ['0%', '50%', '0%'], y: ['0%', '-50%', '0%'] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      ></motion.div>
      
      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.1] rounded-full text-blue-300 text-sm font-medium mb-6 shadow-lg shadow-blue-500/10"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">Frequently Asked Questions</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Everything You Need to Know
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get instant answers to common questions. Can't find what you're looking for? 
            <a href="#contact" className="text-blue-400 hover:text-blue-300 font-semibold ml-1 transition-colors">
              Contact our support team
            </a>
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-full bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/40 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all duration-300 shadow-inner shadow-black/20"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${activeCategory === category.value
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/[0.02] text-gray-300 hover:text-white border border-white/[0.05] hover:border-blue-500/30'}
                `}
              >
                {activeCategory !== category.value && (
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                )}
                <span className="relative z-10">{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                layout
                whileHover={{ y: -2 }}
                className="group bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.05] overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-white/[0.03] transition-colors duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${faq.gradient} bg-opacity-10 border border-white/[0.1] group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20`}>
                      <faq.icon className={`h-5 w-5 ${faq.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {faq.question}
                        </h3>
                        {faq.highlight && (
                          <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 hidden sm:inline-block">
                            {faq.highlight}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-blue-400 transition-colors ${openItems.includes(index) ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/[0.05] pt-4">
                          <p className="text-white/70 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="p-4 rounded-full bg-gray-800/50 border border-gray-700 w-fit mx-auto mb-4">
              <HelpCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No questions found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </motion.button>
          </motion.div>
        )}

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl p-12 border border-gray-700 backdrop-blur-sm overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl blur-xl" />
            
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">
                  Still have questions?
                </h3>
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-xl mb-8 text-gray-300">
                Our support team is here to help you get the most out of Whizboard
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Contact Support
                </motion.a>
                <motion.a
                  href="/docs"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-600 text-white rounded-xl font-semibold text-lg hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  View Documentation
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;