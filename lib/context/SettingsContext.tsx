"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAppContext } from './AppContext';

// Types
// Security settings removed

// Notifications
export interface NotificationEmailPrefs {
  boardInvitations: boolean;
  activityUpdates: boolean;
  weeklyDigest: boolean;
}

export interface NotificationSlackPrefs {
  boardEvents: boolean;
}

export interface NotificationPreferences {
  email: NotificationEmailPrefs;
  slack: NotificationSlackPrefs;
}

// Display/theme settings removed

interface IntegrationStatus {
  googleDrive: boolean;
  slack: boolean;
  figma: boolean;
}

interface SettingsContextType {
  // Integrations
  integrations: IntegrationStatus;
  toggleIntegration: (service: keyof IntegrationStatus, enable: boolean) => Promise<boolean>;
  
  // Notifications
  notificationPrefs: NotificationPreferences;
  setNotificationPrefs: (prefs: { email?: Partial<NotificationEmailPrefs>; slack?: Partial<NotificationSlackPrefs> }) => void;
  saveNotificationPrefs: () => Promise<boolean>;

  // General settings
  deleteAccount: () => Promise<boolean>;
  exportUserData: () => Promise<string>;
  
  // State management
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { user } = useAppContext(); // Assuming useAppContext provides user information

  // Security state removed

  // Notifications state
  const [notificationPrefs, setNotificationPrefsState] = useState<NotificationPreferences>({
    email: { boardInvitations: true, activityUpdates: true, weeklyDigest: false },
    slack: { boardEvents: true },
  });

  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    googleDrive: false,
    slack: false,
    figma: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) { // Only fetch if user is logged in or if there's a way to identify settings
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }

    // Only mark bootstrapping during the very first fetch
    if (!hasBootstrapped) setIsBootstrapping(true);
    setError(null);
    try {
      const [integrationsRes, notificationsRes] = await Promise.all([
        fetch('/api/settings/integrations', { cache: 'no-store' }),
        fetch('/api/settings/notifications', { cache: 'no-store' }),
      ]);

      if (!integrationsRes.ok) throw new Error(`HTTP error! status: ${integrationsRes.status} from integrations settings`);
      if (!notificationsRes.ok) throw new Error(`HTTP error! status: ${notificationsRes.status} from notifications settings`);

      setIntegrations(await integrationsRes.json());
      setNotificationPrefsState(await notificationsRes.json());

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (!hasBootstrapped) {
        setIsBootstrapping(false);
        setHasBootstrapped(true);
      }
    }
  }, [user, hasBootstrapped]); // Depend on user to refetch if user changes

  useEffect(() => {
    if (user) { // Only fetch settings if user is available
      fetchSettings();
    }
  }, [fetchSettings, user]);

  // Helper function for API calls
  const makeApiCall = useCallback(async <T extends object>(url: string, method: string, body?: T): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      setLastUpdated(new Date());
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Security actions removed

  // changePassword removed for Google-only auth

  // Notifications actions
  const setNotificationPrefs = useCallback((prefs: { email?: Partial<NotificationEmailPrefs>; slack?: Partial<NotificationSlackPrefs> }) => {
    setNotificationPrefsState(prev => ({
      email: { ...prev.email, ...(prefs.email || {}) },
      slack: { ...prev.slack, ...(prefs.slack || {}) },
    }));
  }, []);

  const saveNotificationPrefs = useCallback(async () => {
    return await makeApiCall('/api/settings/notifications', 'PUT', notificationPrefs);
  }, [makeApiCall, notificationPrefs]);

  // Display/theme functionality removed

  // Integrations Actions
  const toggleIntegration = useCallback(async (service: keyof IntegrationStatus, enable: boolean) => {
    const body: Partial<IntegrationStatus> = { [service]: enable } as Partial<IntegrationStatus>;
    const response = await fetch('/api/settings/integrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || 'Failed to update integrations');
      return false;
    }
    if (enable && data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return true;
    }
    // disable path
    setIntegrations(prev => ({ ...prev, [service]: enable }));
    return true;
  }, []);

  // General Actions
  const deleteAccount = useCallback(async () => {
    return makeApiCall('/api/settings/account', 'DELETE');
  }, [makeApiCall]);

  const exportUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/account/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeBoards: true,
          includeSettings: true,
          includeIntegrations: true,
          includeHistory: false,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Assuming the data is JSON for simplicity
      setLastUpdated(new Date());
      return JSON.stringify(data, null, 2);
    } catch (err: any) {
      setError(err.message);
      return ''; // Return empty string on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = {
    integrations,
    toggleIntegration,
    notificationPrefs,
    setNotificationPrefs,
    saveNotificationPrefs,
    deleteAccount,
    exportUserData,
    isLoading,
    isBootstrapping,
    error,
    lastUpdated,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
