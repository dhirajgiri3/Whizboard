"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAppContext } from './AppContext';
import { Sparkles, Users, Shield, Zap } from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  isActive: boolean;
  order: number;
}

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
  isVisible: boolean;
  order: number;
}

interface CompanyStat {
  id: string;
  name: string;
  value: string;
  description: string;
  prefix?: string;
  suffix?: string;
  isVisible: boolean;
  order: number;
}

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  isLatest: boolean;
}

interface ContactOffice {
  id: string;
  city: string;
  address: string;
  coordinates: string;
  timezone: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface ContentContextType {
  // About Page
  teamMembers: TeamMember[];
  timelineEvents: TimelineEvent[];
  companyStats: CompanyStat[];
  
  // Legal Documents
  privacyPolicy: LegalDocument | null;
  termsOfService: LegalDocument | null;
  
  // Contact Info
  contactOffices: ContactOffice[];
  
  // Help & FAQ
  faqItems: FaqItem[];
  
  // Loading & error states
  isLoading: boolean;
  error: string | null;
  
  // Data fetching functions
  fetchTeamMembers: () => Promise<void>;
  fetchTimelineEvents: () => Promise<void>;
  fetchCompanyStats: () => Promise<void>;
  fetchPrivacyPolicy: () => Promise<void>;
  fetchTermsOfService: () => Promise<void>;
  fetchContactOffices: () => Promise<void>;
  fetchFaqItems: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

export function ContentProvider({ children }: ContentProviderProps) {
  const { addError } = useAppContext();
  
  // State variables for all content
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStat[]>([]);
  const [privacyPolicy, setPrivacyPolicy] = useState<LegalDocument | null>(null);
  const [termsOfService, setTermsOfService] = useState<LegalDocument | null>(null);
  const [contactOffices, setContactOffices] = useState<ContactOffice[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/about/team');
      
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
      addError({
        message: 'Could not load team information',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch timeline events
  const fetchTimelineEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/about/timeline');
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline events');
      }
      
      const data = await response.json();
      setTimelineEvents(data);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      setError('Failed to load company timeline');
      addError({
        message: 'Could not load company timeline',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch company stats
  const fetchCompanyStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/about/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch company stats');
      }
      
      const data = await response.json();
      setCompanyStats(data);
    } catch (error) {
      console.error('Error fetching company stats:', error);
      setError('Failed to load company statistics');
      addError({
        message: 'Could not load company statistics',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch privacy policy
  const fetchPrivacyPolicy = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/legal/privacy');
      
      if (!response.ok) {
        throw new Error('Failed to fetch privacy policy');
      }
      
      const data = await response.json();
      setPrivacyPolicy(data);
    } catch (error) {
      console.error('Error fetching privacy policy:', error);
      setError('Failed to load privacy policy');
      addError({
        message: 'Could not load privacy policy',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch terms of service
  const fetchTermsOfService = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/legal/terms');
      
      if (!response.ok) {
        throw new Error('Failed to fetch terms of service');
      }
      
      const data = await response.json();
      setTermsOfService(data);
    } catch (error) {
      console.error('Error fetching terms of service:', error);
      setError('Failed to load terms of service');
      addError({
        message: 'Could not load terms of service',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch contact offices
  const fetchContactOffices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact/offices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch contact offices');
      }
      
      const data = await response.json();
      setContactOffices(data);
    } catch (error) {
      console.error('Error fetching contact offices:', error);
      setError('Failed to load office locations');
      addError({
        message: 'Could not load office locations',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Fetch FAQ items
  const fetchFaqItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/help/faq');
      
      if (!response.ok) {
        throw new Error('Failed to fetch FAQ items');
      }
      
      const data = await response.json();
      setFaqItems(data);
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      setError('Failed to load FAQ items');
      addError({
        message: 'Could not load FAQ information',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);
  
  // Load initial data when component mounts
  useEffect(() => {
    // Fetch about page data
    fetchTeamMembers();
    fetchTimelineEvents();
    fetchCompanyStats();
  }, [fetchTeamMembers, fetchTimelineEvents, fetchCompanyStats]);
  
  // Provide context value
  const value: ContentContextType = {
    teamMembers,
    timelineEvents,
    companyStats,
    privacyPolicy,
    termsOfService,
    contactOffices,
    faqItems,
    isLoading,
    error,
    fetchTeamMembers,
    fetchTimelineEvents,
    fetchCompanyStats,
    fetchPrivacyPolicy,
    fetchTermsOfService,
    fetchContactOffices,
    fetchFaqItems
  };
  
  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContentContext() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContentContext must be used within a ContentProvider');
  }
  return context;
}
