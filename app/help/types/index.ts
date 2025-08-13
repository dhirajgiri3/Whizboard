export interface HelpArticle {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeToRead: string;
  tags: string[];
  featured?: boolean;
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  articles: HelpArticle[];
}

export interface SearchResult {
  article: HelpArticle;
  category: string;
  relevance: number;
}

export interface QuickStartGuide {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
}

export interface SupportOption {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  cta: string;
  color: string;
} 