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
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/3 via-transparent to-gray-600/2"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern-dark.svg')] opacity-30"></div>
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[60px]"
          style={{
            background: 'radial-gradient(circle, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full blur-[40px]"
          style={{
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col items-center space-y-4 sm:space-y-6 pb-16 lg:pb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <HelpCircle className="h-4 w-4 text-blue-400" />
            </motion.div>
            <span className="text-white/70 text-sm font-medium">FAQ</span>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight font-semibold tracking-tight text-center">
              Frequently Asked
              <span className="block bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-base text-white/80 max-w-2xl text-center leading-relaxed">
              Everything you need to know about our platform. Can't find the answer you're looking for? 
              <a href="#contact" className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-blue-400/30 hover:decoration-blue-300/50">Contact our support team</a>.
            </p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-30" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.12]"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === category.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-500/30'
                    : 'bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-4 mb-16"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                {/* Gradient Orb Background */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div 
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 70%)'
                    }}
                  />
                </div>

                <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 group-hover:scale-[1.01]">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between group-hover:bg-white/[0.02] transition-all duration-300"
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
                    <motion.div
                      animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openItems.includes(index) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 pt-2">
                          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
                          <p className="text-white/80 leading-relaxed text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-2xl p-12 backdrop-blur-sm overflow-hidden">
                {/* Background Orb */}
                <div className="absolute inset-0">
                  <motion.div 
                    className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full blur-[60px] transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">No Results Found</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    We couldn't find any FAQs matching your search. Try different keywords or browse our categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 border border-blue-500/30 shadow-lg hover:shadow-xl"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
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
          <div className="relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-3xl p-12 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <motion.div 
                className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 70%)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm mb-6">
                <MessageCircle className="h-4 w-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Need Help?</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Still have questions?
              </h3>
              <p className="text-base text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.08] border border-white/[0.12] text-white rounded-lg font-medium hover:bg-white/[0.12] hover:border-white/[0.16] transition-all duration-300 backdrop-blur-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Support
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.a>
                <motion.a
                  href="/docs"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/[0.08] text-white/90 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 font-medium rounded-lg backdrop-blur-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  View Documentation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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