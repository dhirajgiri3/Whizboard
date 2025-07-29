"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Play,
  FileText,
  Video,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  Zap,
  Users,
  Settings,
  Palette,
  MousePointer,
  Keyboard,
  Share2,
  Download,
  Upload,
  Lock,
  Shield,
  HelpCircle,
  MessageCircle,
  Mail,
  Star,
  Clock,
  TrendingUp,
  Bookmark,
  Filter,
  X,
} from "lucide-react";

// Types
interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToRead: string;
  tags: string[];
  featured?: boolean;
}

interface SearchResult {
  article: HelpArticle;
  category: string;
  relevance: number;
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

// Help categories and articles data
const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of WhizBoard and create your first board",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    articles: [
      {
        id: "create-first-board",
        title: "Create Your First Board",
        description: "Step-by-step guide to creating and setting up your first collaborative whiteboard",
        difficulty: "beginner",
        timeToRead: "5 min",
        tags: ["setup", "basics", "first-time"],
        featured: true
      },
      {
        id: "invite-collaborators",
        title: "Invite Team Members",
        description: "Learn how to invite colleagues and start collaborating in real-time",
        difficulty: "beginner",
        timeToRead: "3 min",
        tags: ["collaboration", "invite", "team"]
      },
      {
        id: "basic-tools",
        title: "Using Basic Tools",
        description: "Master the essential drawing, text, and shape tools",
        difficulty: "beginner",
        timeToRead: "8 min",
        tags: ["tools", "drawing", "text", "shapes"]
      }
    ]
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description: "Unlock the full potential of WhizBoard with advanced tools",
    icon: Zap,
    color: "from-purple-500 to-violet-600",
    articles: [
      {
        id: "frames-and-layers",
        title: "Frames and Layer Management",
        description: "Organize your work with frames and master layer management",
        difficulty: "intermediate",
        timeToRead: "12 min",
        tags: ["frames", "layers", "organization"]
      },
      {
        id: "templates",
        title: "Using Templates",
        description: "Save time with pre-built templates and create your own",
        difficulty: "intermediate",
        timeToRead: "6 min",
        tags: ["templates", "productivity", "workflow"]
      },
      {
        id: "integrations",
        title: "Third-party Integrations",
        description: "Connect WhizBoard with your favorite tools and services",
        difficulty: "advanced",
        timeToRead: "10 min",
        tags: ["integrations", "api", "automation"]
      }
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description: "Work together effectively with real-time collaboration features",
    icon: Users,
    color: "from-green-500 to-emerald-600",
    articles: [
      {
        id: "real-time-sync",
        title: "Real-time Synchronization",
        description: "Understand how real-time collaboration works and best practices",
        difficulty: "beginner",
        timeToRead: "7 min",
        tags: ["sync", "real-time", "collaboration"]
      },
      {
        id: "permissions",
        title: "Managing Permissions",
        description: "Control who can view, edit, or manage your boards",
        difficulty: "intermediate",
        timeToRead: "5 min",
        tags: ["permissions", "security", "access"]
      },
      {
        id: "comments-feedback",
        title: "Comments and Feedback",
        description: "Use comments to provide feedback and track changes",
        difficulty: "intermediate",
        timeToRead: "4 min",
        tags: ["comments", "feedback", "review"]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Solve common issues and get back to creating",
    icon: HelpCircle,
    color: "from-orange-500 to-red-600",
    articles: [
      {
        id: "connection-issues",
        title: "Connection Problems",
        description: "Fix connectivity issues and sync problems",
        difficulty: "beginner",
        timeToRead: "6 min",
        tags: ["connection", "sync", "troubleshooting"]
      },
      {
        id: "performance-optimization",
        title: "Performance Optimization",
        description: "Tips to improve WhizBoard performance on your device",
        difficulty: "intermediate",
        timeToRead: "8 min",
        tags: ["performance", "optimization", "speed"]
      },
      {
        id: "data-recovery",
        title: "Data Recovery",
        description: "Recover lost work and restore previous versions",
        difficulty: "intermediate",
        timeToRead: "5 min",
        tags: ["recovery", "backup", "version-control"]
      }
    ]
  }
];

// Quick start guides
const quickStartGuides = [
  {
    title: "5-Minute Setup",
    description: "Get up and running in just 5 minutes",
    icon: Clock,
    href: "#",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Play,
    href: "#",
    color: "from-purple-500 to-violet-600"
  },
  {
    title: "Keyboard Shortcuts",
    description: "Master productivity with keyboard shortcuts",
    icon: Keyboard,
    href: "#",
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "Best Practices",
    description: "Learn from the pros with expert tips",
    icon: Star,
    href: "#",
    color: "from-orange-500 to-red-600"
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      const results: SearchResult[] = [];
      const searchLower = query.toLowerCase();

      helpCategories.forEach(category => {
        category.articles.forEach(article => {
          const relevance = 
            (article.title.toLowerCase().includes(searchLower) ? 3 : 0) +
            (article.description.toLowerCase().includes(searchLower) ? 2 : 0) +
            (article.tags.some(tag => tag.toLowerCase().includes(searchLower)) ? 1 : 0);

          if (relevance > 0) {
            results.push({
              article,
              category: category.title,
              relevance
            });
          }
        });
      });

      results.sort((a, b) => b.relevance - a.relevance);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            >
              <BookOpen className="w-4 h-4" />
              Help & Documentation
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              How Can We{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Help You?
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Find answers to your questions, learn new features, and master WhizBoard 
              with our comprehensive documentation and tutorials.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, tutorials, or features..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-slate-600">
                {isSearching ? "Searching..." : `${searchResults.length} results found`}
              </p>
            </motion.div>

            {!isSearching && searchResults.length > 0 && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                className="space-y-4"
              >
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.category}-${result.article.id}`}
                    variants={fadeInUp}
                    className="bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-blue-600">{result.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.article.difficulty)}`}>
                            {result.article.difficulty}
                          </span>
                          <span className="text-sm text-slate-500">{result.article.timeToRead}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{result.article.title}</h3>
                        <p className="text-slate-600 mb-3">{result.article.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.article.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 ml-4" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isSearching && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">No results found</h3>
                <p className="text-slate-600 mb-6">Try different keywords or browse our categories below</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Quick Start Guides */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Quick Start Guides
            </h2>
            <p className="text-xl text-slate-600">
              Get up to speed quickly with these essential guides
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {quickStartGuides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <motion.div
                  key={guide.title}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <Link href={guide.href}>
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 h-full">
                      <div className={`w-12 h-12 bg-gradient-to-br ${guide.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{guide.title}</h3>
                      <p className="text-slate-600 text-sm">{guide.description}</p>
                      
                      <div className="flex items-center gap-2 mt-4 text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Browse by Category
            </h2>
            <p className="text-xl text-slate-600">
              Find detailed guides and tutorials organized by topic
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.has(category.id);
              
              return (
                <motion.div
                  key={category.id}
                  variants={fadeInUp}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 mb-1">{category.title}</h3>
                          <p className="text-slate-600">{category.description}</p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-6 space-y-4">
                        {category.articles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-start justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {article.featured && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                                  {article.difficulty}
                                </span>
                                <span className="text-sm text-slate-500">{article.timeToRead}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 mb-1">{article.title}</h4>
                              <p className="text-slate-600 text-sm mb-2">{article.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {article.tags.map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 ml-4" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Can't find what you're looking for? Our support team is here to help.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <Link
                href="/contact"
                className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors"
              >
                <MessageCircle className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Live Chat</h3>
                <p className="text-slate-600 text-sm mb-4">Get instant help from our support team</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Start Chat →
                </span>
              </Link>

              <Link
                href="mailto:support@whizboard.com"
                className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors"
              >
                <Mail className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Email Support</h3>
                <p className="text-slate-600 text-sm mb-4">Send us a detailed message</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Send Email →
                </span>
              </Link>

              <Link
                href="/contact"
                className="group bg-slate-50 rounded-xl p-6 hover:bg-slate-100 transition-colors"
              >
                <HelpCircle className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-bold text-slate-800 mb-2">Request Feature</h3>
                <p className="text-slate-600 text-sm mb-4">Suggest new features or improvements</p>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Submit Request →
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 