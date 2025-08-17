"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/http/axios';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

interface AppTheme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
}

interface AppPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  autoSave: boolean;
  tooltips: boolean;
}

interface GlobalError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  action?: () => void;
  actionText?: string;
}

interface AppContextType {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  refreshUserProfilePicture: () => Promise<void>;
  
  // Theme and preferences
  theme: AppTheme;
  setTheme: (theme: Partial<AppTheme>) => void;
  preferences: AppPreferences;
  setPreferences: (preferences: Partial<AppPreferences>) => void;
  
  // Global loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingText?: string;
  setLoadingText: (text?: string) => void;
  
  // Global errors and notifications
  errors: GlobalError[];
  addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  
  // Utility functions
  logout: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<AppPreferences>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

// Default values
const defaultTheme: AppTheme = {
  mode: 'system',
  primaryColor: '#3b82f6',
  accentColor: '#6366f1'
};

const defaultPreferences: AppPreferences = {
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/dd/yyyy',
  autoSave: true,
  tooltips: true
};

export function AppProvider({ children }: AppProviderProps) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<AppTheme>(defaultTheme);
  const [preferences, setPreferencesState] = useState<AppPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<GlobalError[]>([]);

  // Check for saved theme and preferences in localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('whizboard_theme');
        if (savedTheme) {
          setThemeState({ ...theme, ...JSON.parse(savedTheme) });
        }
        
        const savedPreferences = localStorage.getItem('whizboard_preferences');
        if (savedPreferences) {
          setPreferencesState({ ...preferences, ...JSON.parse(savedPreferences) });
        }
      } catch (error) {
        console.error('Error loading saved preferences:', error);
      }
    }
  }, []);

  // Save theme changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('whizboard_theme', JSON.stringify(theme));
    }
  }, [theme]);

  // Save preferences changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('whizboard_preferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  // Set partial theme (only updating the provided properties)
  const setTheme = useCallback((newTheme: Partial<AppTheme>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  }, []);

  // Set partial preferences (only updating the provided properties)
  const setPreferences = useCallback((newPreferences: Partial<AppPreferences>) => {
    setPreferencesState(prev => ({ ...prev, ...newPreferences }));
  }, []);

  // Error management
  const addError = useCallback((error: Omit<GlobalError, 'id' | 'timestamp'>) => {
    const newError: GlobalError = {
      ...error,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setErrors(prev => [...prev, newError]);

    // Auto-remove error after 5 seconds if it's not an "error" type
    if (error.type !== 'error') {
      setTimeout(() => {
        removeError(newError.id);
      }, 5000);
    }
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Sync NextAuth session user to AppContext user state
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log('[AppContext] Session authenticated:', { 
        email: session.user.email, 
        name: session.user.name,
        hasImage: !!session.user.image 
      });
      
      setUser(prevUser => {
        if (prevUser && prevUser.id === session.user?.id) {
          // If user ID hasn't changed, return existing user object to prevent unnecessary re-renders
          return prevUser;
        }
        return {
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          avatar: session.user.image || undefined,
          role: 'user', // Default role, adjust as per your app's logic
          createdAt: prevUser?.createdAt || new Date().toISOString(), // Keep existing createdAt if available
          updatedAt: new Date().toISOString(), // Always update updatedAt on session change
        };
      });
      
      // After base session sync, try to load DB profile image if present
      (async () => {
        try {
          console.log('[AppContext] Loading database profile data...');
          const { data } = await api.get('/api/settings/account', { headers: { 'Cache-Control': 'no-store' } });
          const dbImage = data?.user?.image || null;
          
          if (data?.warning) {
            console.warn('[AppContext] Profile data warning:', data.warning);
          }
          
          if (dbImage) {
            console.log('[AppContext] Found database image, updating user avatar');
            setUser(prev => prev ? { ...prev, avatar: dbImage } : prev);
          } else {
            console.log('[AppContext] No database image found, using session image');
          }
        } catch (error) {
          console.error('[AppContext] Failed to load database profile data:', error);
        }
      })();
    } else if (status === "unauthenticated") {
      console.log('[AppContext] Session unauthenticated, clearing user');
      setUser(null);
    } else if (status === "loading") {
      console.log('[AppContext] Session loading...');
    }
  }, [session, status]);

  const refreshUserProfilePicture = useCallback(async () => {
    try {
      const { data } = await api.get('/api/settings/account', { headers: { 'Cache-Control': 'no-store' } });
      const dbImage = data?.user?.image || null;
      setUser(prev => prev ? { ...prev, avatar: dbImage || undefined } : prev);
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/signout');
      
      // Clear user and session data
      setUser(null);
      
      // Optionally redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      addError({
        message: 'Could not sign out properly',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const updateUserPreferences = useCallback(async (newPreferences: Partial<AppPreferences>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await api.put('/api/settings/preferences', newPreferences);
      
      // Update local state
      setPreferences(newPreferences);
      
      addError({
        message: 'Preferences updated successfully',
        type: 'info',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      addError({
        message: 'Could not update preferences',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, addError, setPreferences]);

  // Calculate isAuthenticated based on user state
  const isAuthenticated = !!user;

  const value: AppContextType = {
    // User state
    user,
    setUser,
    isAuthenticated,
    refreshUserProfilePicture,
    
    // Theme and preferences
    theme,
    setTheme,
    preferences,
    setPreferences,
    
    // Global loading states
    isLoading,
    setIsLoading,
    loadingText,
    setLoadingText,
    
    // Global errors and notifications
    errors,
    addError,
    removeError,
    clearErrors,
    
    // Utility functions
    logout,
    updateUserPreferences,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
