"use client";

import React, { useState, useRef, useCallback } from "react";
import BackButton from "@/components/ui/BackButton";
import HelpHero from "./components/HelpHero";
import SearchResults from "./components/SearchResults";
import QuickStartGuides from "./components/QuickStartGuides";
import HelpCategories from "./components/HelpCategories";
import ContactSupport from "./components/ContactSupport";
import { helpCategories } from "./data/helpData";
import { SearchResult } from "./types";
import { semanticSearch } from "./utils/nluSearch";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleSearch = useCallback((query: string) => {
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
      const results: SearchResult[] = semanticSearch(query, helpCategories);
      setSearchResults(results);
      setIsSearching(false);
    }, 250);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      <HelpHero 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onClearSearch={handleClearSearch}
      />

      {searchQuery && (
        <SearchResults 
          searchQuery={searchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onClearSearch={handleClearSearch}
        />
      )}

      <QuickStartGuides />
      <HelpCategories />
      <ContactSupport />
    </div>
  );
} 