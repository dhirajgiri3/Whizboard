"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Star, X } from "lucide-react";

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

interface SearchResultsProps {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  onClearSearch: () => void;
}

const SearchResults = ({ searchQuery, searchResults, isSearching, onClearSearch }: SearchResultsProps) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (!searchQuery) return null;

  return (
    <section className="py-12 sm:py-16 bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Search Results
              </h2>
              <p className="text-white/60 text-sm sm:text-base">
                {isSearching ? "Searching..." : `${searchResults.length} results found for "${searchQuery}"`}
              </p>
            </div>
            <button
              onClick={onClearSearch}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white/60 hover:text-white/80 transition-colors duration-200 self-start sm:self-auto"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Clear</span>
            </button>
          </div>
        </motion.div>

        {!isSearching && searchResults.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3 sm:space-y-4"
          >
            {searchResults.map((result) => (
              <motion.div
                key={`${result.category}-${result.article.id}`}
                variants={fadeInUp}
                className="group p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
                      <span className="text-xs sm:text-sm font-medium text-blue-400 bg-blue-400/10 px-2 sm:px-3 py-1 rounded-full border border-blue-400/20 flex-shrink-0">
                        {result.category}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(result.article.difficulty)} flex-shrink-0`}>
                        {result.article.difficulty}
                      </span>
                      <span className="text-xs sm:text-sm text-white/50">{result.article.timeToRead}</span>
                      {result.article.featured && (
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 line-clamp-2">{result.article.title}</h3>
                    <p className="text-white/70 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">{result.article.description}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {result.article.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="px-2 sm:px-3 py-1 bg-white/[0.05] text-white/60 rounded-lg text-xs border border-white/[0.08]">
                          {tag}
                        </span>
                      ))}
                      {result.article.tags.length > 4 && (
                        <span className="px-2 sm:px-3 py-1 bg-white/[0.05] text-white/60 rounded-lg text-xs border border-white/[0.08]">
                          +{result.article.tags.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/40 ml-2 sm:ml-4 group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isSearching && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6 sm:mb-8">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No results found</h3>
            <p className="text-white/60 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-lg px-4">
              Try different keywords or browse our categories below for more help articles
            </p>
            <button
              onClick={onClearSearch}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 text-sm sm:text-base"
            >
              Clear Search
            </button>
          </motion.div>
        )}

        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/[0.03] border border-white/[0.08] rounded-full mb-6 sm:mb-8">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Searching...</h3>
            <p className="text-white/60 max-w-md mx-auto text-sm sm:text-lg px-4">
              Looking through our help articles and documentation
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SearchResults; 