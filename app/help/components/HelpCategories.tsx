"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Star,
  BookOpen
} from "lucide-react";
import { helpCategories } from "../data/helpData";

const HelpCategories = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial="initial"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm mb-4 sm:mb-6"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
            <span className="text-white/70 text-xs sm:text-sm font-medium">Documentation</span>
          </motion.div>

          {/* Header */}
          <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2">
              Browse by Category
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 sm:px-6">
              Find detailed guides and tutorials organized by topic and difficulty level
            </p>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-4 sm:space-y-6"
        >
          {helpCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <motion.div
                key={category.id}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300"
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-4 sm:p-6 text-left hover:bg-white/[0.05] transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">{category.title}</h3>
                        <p className="text-white/70 text-xs sm:text-sm line-clamp-2">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-white/50 hidden sm:block">{category.articles.length} articles</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/[0.08]"
                    >
                      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {category.articles.map((article) => (
                          <div
                            key={article.id}
                            className="group p-3 sm:p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/[0.1]"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                                  {article.featured && (
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(article.difficulty)} flex-shrink-0`}>
                                    {article.difficulty}
                                  </span>
                                  <span className="text-xs sm:text-sm text-white/50">{article.timeToRead}</span>
                                </div>
                                <h4 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2">{article.title}</h4>
                                <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-3">{article.description}</p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {article.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-white/[0.05] text-white/60 rounded-lg text-xs border border-white/[0.08]">
                                      {tag}
                                    </span>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-white/[0.05] text-white/60 rounded-lg text-xs border border-white/[0.08]">
                                      +{article.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 ml-2 sm:ml-4 group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HelpCategories; 