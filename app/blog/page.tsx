"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  User,
  Clock,
  Tag,
  ArrowRight,
  Filter,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Users,
  Zap,
  Star,
  Eye,
  Heart,
  Share2,
  Bookmark,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  publishedDate: string;
  readTime: string;
  featured: boolean;
  views: number;
  likes: number;
  image: string;
  slug: string;
}

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
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

// Blog categories
const blogCategories: BlogCategory[] = [
  {
    id: "productivity",
    name: "Productivity",
    description: "Tips and tricks for better collaboration",
    count: 12,
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "tutorials",
    name: "Tutorials",
    description: "Step-by-step guides and how-tos",
    count: 8,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "case-studies",
    name: "Case Studies",
    description: "Real-world success stories",
    count: 6,
    color: "from-purple-500 to-violet-600"
  },
  {
    id: "updates",
    name: "Product Updates",
    description: "Latest features and improvements",
    count: 15,
    color: "from-orange-500 to-red-600"
  },
  {
    id: "remote-work",
    name: "Remote Work",
    description: "Collaboration in distributed teams",
    count: 10,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "design",
    name: "Design Tips",
    description: "Visual collaboration best practices",
    count: 7,
    color: "from-yellow-500 to-amber-600"
  }
];

// Sample blog posts
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Ways to Boost Team Collaboration with Digital Whiteboards",
    excerpt: "Discover proven strategies to enhance team collaboration using digital whiteboards. From brainstorming sessions to project planning, learn how to make the most of your virtual workspace.",
    content: "Full article content here...",
    author: {
      name: "Sarah Chen",
      avatar: "/api/placeholder/100/100",
      role: "Product Manager"
    },
    category: "productivity",
    tags: ["collaboration", "teamwork", "whiteboards", "productivity"],
    publishedDate: "2024-01-15",
    readTime: "8 min read",
    featured: true,
    views: 2450,
    likes: 128,
    image: "/api/placeholder/600/400",
    slug: "boost-team-collaboration-digital-whiteboards"
  },
  {
    id: "2",
    title: "The Complete Guide to Remote Design Sprints",
    excerpt: "Learn how to conduct effective design sprints in a remote environment. From preparation to execution, we'll cover everything you need to know.",
    content: "Full article content here...",
    author: {
      name: "Marcus Rodriguez",
      avatar: "/api/placeholder/100/100",
      role: "Design Lead"
    },
    category: "tutorials",
    tags: ["design-sprints", "remote-work", "design", "workshops"],
    publishedDate: "2024-01-12",
    readTime: "12 min read",
    featured: true,
    views: 1890,
    likes: 95,
    image: "/api/placeholder/600/400",
    slug: "complete-guide-remote-design-sprints"
  },
  {
    id: "3",
    title: "How TechCorp Increased Team Velocity by 40% with WhizBoard",
    excerpt: "A detailed case study showing how TechCorp transformed their product development process using collaborative whiteboarding tools.",
    content: "Full article content here...",
    author: {
      name: "Alex Kumar",
      avatar: "/api/placeholder/100/100",
      role: "Customer Success"
    },
    category: "case-studies",
    tags: ["case-study", "productivity", "success-story", "teams"],
    publishedDate: "2024-01-10",
    readTime: "6 min read",
    featured: false,
    views: 1560,
    likes: 73,
    image: "/api/placeholder/600/400",
    slug: "techcorp-increased-team-velocity-whizboard"
  },
  {
    id: "4",
    title: "New Features: Advanced Frame Management and Layer Controls",
    excerpt: "Explore the latest updates to WhizBoard's frame management system and enhanced layer controls for better organization.",
    content: "Full article content here...",
    author: {
      name: "Emma Thompson",
      avatar: "/api/placeholder/100/100",
      role: "Product Designer"
    },
    category: "updates",
    tags: ["new-features", "frames", "layers", "product-update"],
    publishedDate: "2024-01-08",
    readTime: "5 min read",
    featured: false,
    views: 2100,
    likes: 112,
    image: "/api/placeholder/600/400",
    slug: "new-features-advanced-frame-management-layer-controls"
  },
  {
    id: "5",
    title: "5 Essential Tips for Effective Remote Brainstorming",
    excerpt: "Master the art of remote brainstorming with these essential tips that will help your team generate better ideas from anywhere.",
    content: "Full article content here...",
    author: {
      name: "David Wilson",
      avatar: "/api/placeholder/100/100",
      role: "UX Researcher"
    },
    category: "remote-work",
    tags: ["brainstorming", "remote-work", "ideation", "workshops"],
    publishedDate: "2024-01-05",
    readTime: "7 min read",
    featured: false,
    views: 1780,
    likes: 89,
    image: "/api/placeholder/600/400",
    slug: "5-essential-tips-effective-remote-brainstorming"
  },
  {
    id: "6",
    title: "Designing for Collaboration: Visual Hierarchy in Digital Whiteboards",
    excerpt: "Learn how to create clear visual hierarchies in your digital whiteboards to improve team understanding and collaboration.",
    content: "Full article content here...",
    author: {
      name: "Lisa Park",
      avatar: "/api/placeholder/100/100",
      role: "Senior Designer"
    },
    category: "design",
    tags: ["design", "visual-hierarchy", "whiteboards", "collaboration"],
    publishedDate: "2024-01-03",
    readTime: "9 min read",
    featured: false,
    views: 1340,
    likes: 67,
    image: "/api/placeholder/600/400",
    slug: "designing-collaboration-visual-hierarchy-digital-whiteboards"
  }
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "title">("date");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort posts
  const filteredPosts = blogPosts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.views - a.views;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      }
    });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
              WhizBoard Blog
            </motion.div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              Insights &{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Inspiration
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover tips, tutorials, and stories from the world of collaborative whiteboarding. 
              Learn how teams are transforming their work with digital collaboration tools.
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
                  placeholder="Search articles, tutorials, and insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
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

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {blogCategories.map((category, index) => (
              <motion.div
                key={category.id}
                variants={fadeInUp}
                className="group cursor-pointer"
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  selectedCategory === category.id ? 'ring-4 ring-blue-300' : ''
                }`}>
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-blue-100 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">{category.count} articles</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="py-8 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {blogCategories.find(c => c.id === selectedCategory)?.name}
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Latest</option>
                <option value="popularity">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Featured Articles</h2>
              <p className="text-slate-600">Our most popular and insightful content</p>
            </motion.div>
            
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid lg:grid-cols-2 gap-8"
            >
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                            Featured
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {blogCategories.find(c => c.id === post.category)?.name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-sm">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {post.author.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{post.author.name}</p>
                              <p className="text-xs text-slate-500">{post.author.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-slate-400 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {searchQuery || selectedCategory ? 'Search Results' : 'Latest Articles'}
            </h2>
            <p className="text-slate-600">
              {regularPosts.length} articles found
            </p>
          </motion.div>
          
          {regularPosts.length > 0 ? (
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {regularPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {blogCategories.find(c => c.id === post.category)?.name}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-sm">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-600 mb-4 line-clamp-3 text-sm">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {post.author.name.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600">{post.author.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-400 text-xs">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No articles found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search criteria or browse all categories</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
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
              Stay Updated
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Get the latest insights, tutorials, and updates delivered to your inbox.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-3">
                No spam, unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 