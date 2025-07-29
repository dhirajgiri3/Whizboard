"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAppContext } from './AppContext';

// Types
interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string | null;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

interface NotificationSettings {
  email: {
    announcements: boolean;
    updates: boolean;
    security: boolean;
    mentions: boolean;
    boardInvites: boolean;
  };
  inApp: {
    mentions: boolean;
    comments: boolean;
    boardChanges: boolean;
    teamEvents: boolean;
    systemAlerts: boolean;
  };
}

interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  colorMode: 'default' | 'colorblind' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  defaultViewMode: 'edit' | 'view' | 'present';
}

interface IntegrationStatus {
  googleDrive: boolean;
  slack: boolean;
  microsoft: boolean;
  github: boolean;
  figma: boolean;
}

interface SettingsContextType {
  // Security
  securitySettings: SecuritySettings;
  updateSecuritySettings: (newSettings: Partial<SecuritySettings>) => Promise<boolean>;
  enableTwoFactor: () => Promise<boolean>;
  disableTwoFactor: () => Promise<boolean>;
  revokeAllSessions: () => Promise<boolean>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  
  // Notifications
  notificationSettings: NotificationSettings;
  updateEmailNotifications: (settings: Partial<NotificationSettings['email']>) => Promise<boolean>;
  updateInAppNotifications: (settings: Partial<NotificationSettings['inApp']>) => Promise<boolean>;
  
  // Display
  displaySettings: DisplaySettings;
  updateDisplaySettings: (settings: Partial<DisplaySettings>) => Promise<boolean>;
  
  // Integrations
  integrations: IntegrationStatus;
  toggleIntegration: (service: keyof IntegrationStatus, enable: boolean) => Promise<boolean>;
  
  // General settings
  deleteAccount: (password: string) => Promise<boolean>;
  exportUserData: () => Promise<string>;
  
  // State management
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { user } = useAppContext(); // Assuming useAppContext provides user information

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: null,
    activeSessions: [],
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      announcements: true,
      updates: true,
      security: true,
      mentions: true,
      boardInvites: true,
    },
    inApp: {
      mentions: true,
      comments: true,
      boardChanges: true,
      teamEvents: true,
      systemAlerts: true,
    },
  });

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: 'system',
    colorMode: 'default',
    fontSize: 'medium',
    reducedMotion: false,
    defaultViewMode: 'edit',
  });

  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    googleDrive: false,
    slack: false,
    microsoft: false,
    github: false,
    figma: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) { // Only fetch if user is logged in or if there's a way to identify settings
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [securityRes, notificationRes, displayRes, integrationsRes] = await Promise.all([
        fetch('/api/settings/security'),
        fetch('/api/settings/notifications'),
        fetch('/api/settings/display'),
        fetch('/api/settings/integrations'),
      ]);

      if (!securityRes.ok) throw new Error(`HTTP error! status: ${securityRes.status} from security settings`);
      if (!notificationRes.ok) throw new Error(`HTTP error! status: ${notificationRes.status} from notification settings`);
      if (!displayRes.ok) throw new Error(`HTTP error! status: ${displayRes.status} from display settings`);
      if (!integrationsRes.ok) throw new Error(`HTTP error! status: ${integrationsRes.status} from integrations settings`);

      setSecuritySettings(await securityRes.json());
      setNotificationSettings(await notificationRes.json());
      setDisplaySettings(await displayRes.json());
      setIntegrations(await integrationsRes.json());

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]); // Depend on user to refetch if user changes

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

  // Security Actions
  const updateSecuritySettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    const success = await makeApiCall('/api/settings/security', 'PUT', newSettings);
    if (success) setSecuritySettings(prev => ({ ...prev, ...newSettings }));
    return success;
  }, [makeApiCall]);

  const enableTwoFactor = useCallback(async () => {
    return updateSecuritySettings({ twoFactorEnabled: true });
  }, [updateSecuritySettings]);

  const disableTwoFactor = useCallback(async () => {
    return updateSecuritySettings({ twoFactorEnabled: false });
  }, [updateSecuritySettings]);

  const revokeAllSessions = useCallback(async () => {
    const success = await makeApiCall('/api/settings/security/sessions/revoke-all', 'POST');
    if (success) setSecuritySettings(prev => ({ ...prev, activeSessions: [] }));
    return success;
  }, [makeApiCall]);

  const revokeSession = useCallback(async (sessionId: string) => {
    const success = await makeApiCall(`/api/settings/security/sessions/${sessionId}`, 'DELETE');
    if (success) setSecuritySettings(prev => ({ ...prev, activeSessions: prev.activeSessions.filter(s => s.id !== sessionId) }));
    return success;
  }, [makeApiCall]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    return makeApiCall('/api/settings/security/password', 'PUT', { oldPassword, newPassword });
  }, [makeApiCall]);

  // Notification Actions
  const updateEmailNotifications = useCallback(async (settings: Partial<NotificationSettings['email']>) => {
    const success = await makeApiCall('/api/settings/notifications/email', 'PUT', settings);
    if (success) setNotificationSettings(prev => ({ ...prev, email: { ...prev.email, ...settings } }));
    return success;
  }, [makeApiCall]);

  const updateInAppNotifications = useCallback(async (settings: Partial<NotificationSettings['inApp']>) => {
    const success = await makeApiCall('/api/settings/notifications/inapp', 'PUT', settings);
    if (success) setNotificationSettings(prev => ({ ...prev, inApp: { ...prev.inApp, ...settings } }));
    return success;
  }, [makeApiCall]);

  // Display Actions
  const updateDisplaySettings = useCallback(async (settings: Partial<DisplaySettings>) => {
    const success = await makeApiCall('/api/settings/display', 'PUT', settings);
    if (success) setDisplaySettings(prev => ({ ...prev, ...settings }));
    return success;
  }, [makeApiCall]);

  // Integrations Actions
  const toggleIntegration = useCallback(async (service: keyof IntegrationStatus, enable: boolean) => {
    const success = await makeApiCall(`/api/settings/integrations/${service}`, 'PUT', { enable });
    if (success) setIntegrations(prev => ({ ...prev, [service]: enable }));
    return success;
  }, [makeApiCall]);

  // General Actions
  const deleteAccount = useCallback(async (password: string) => {
    return makeApiCall('/api/settings/account', 'DELETE', { password });
  }, [makeApiCall]);

  const exportUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings/account/export', {
        method: 'GET',
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
    securitySettings,
    updateSecuritySettings,
    enableTwoFactor,
    disableTwoFactor,
    revokeAllSessions,
    revokeSession,
    changePassword,
    notificationSettings,
    updateEmailNotifications,
    updateInAppNotifications,
    displaySettings,
    updateDisplaySettings,
    integrations,
    toggleIntegration,
    deleteAccount,
    exportUserData,
    isLoading,
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
