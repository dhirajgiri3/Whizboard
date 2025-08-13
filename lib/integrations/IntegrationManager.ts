import axios from 'axios';
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'slack' | 'google' | 'microsoft' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error';
}

export interface SlackConfig {
  webhookUrl?: string;
  channel?: string;
  notifications: {
    boardCreated: boolean;
    boardShared: boolean;
    comments: boolean;
  };
}

export interface GoogleConfig {
  calendarId?: string;
  driveFolderId?: string;
  autoSync: boolean;
  permissions: string[];
}

export interface MicrosoftConfig {
  teamsWebhookUrl?: string;
  sharepointSite?: string;
  autoSync: boolean;
  permissions: string[];
}

export interface CustomIntegration {
  name: string;
  endpoint: string;
  apiKey?: string;
  events: string[];
  config: Record<string, any>;
}

class IntegrationManager {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private customIntegrations: Map<string, CustomIntegration> = new Map();

  constructor() {
    this.initializeDefaultIntegrations();
    this.loadSavedIntegrations();
  }

  private initializeDefaultIntegrations() {
    const defaultIntegrations: IntegrationConfig[] = [
      {
        id: 'slack',
        name: 'Slack',
        type: 'slack',
        enabled: false,
        config: {
          notifications: {
            boardCreated: true,
            boardShared: true,
            comments: false,
          },
        },
        status: 'disconnected',
      },
      {
        id: 'google-workspace',
        name: 'Google Workspace',
        type: 'google',
        enabled: false,
        config: {
          autoSync: false,
          permissions: ['calendar', 'drive'],
        },
        status: 'disconnected',
      },
      {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        type: 'microsoft',
        enabled: false,
        config: {
          autoSync: false,
          permissions: ['teams', 'sharepoint'],
        },
        status: 'disconnected',
      },
    ];

    defaultIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  private loadSavedIntegrations() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      const saved = localStorage.getItem('whizboard-integrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([id, config]) => {
          this.integrations.set(id, config as IntegrationConfig);
        });
      }

      const savedCustom = localStorage.getItem('whizboard-custom-integrations');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        Object.entries(parsed).forEach(([id, config]) => {
          this.customIntegrations.set(id, config as CustomIntegration);
        });
      }
    } catch (error) {
      console.warn('Failed to load saved integrations:', error);
    }
  }

  private saveIntegrations() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      const integrationsObj = Object.fromEntries(this.integrations);
      localStorage.setItem('whizboard-integrations', JSON.stringify(integrationsObj));

      const customIntegrationsObj = Object.fromEntries(this.customIntegrations);
      localStorage.setItem('whizboard-custom-integrations', JSON.stringify(customIntegrationsObj));
    } catch (error) {
      console.error('Failed to save integrations:', error);
    }
  }

  public getIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  public getCustomIntegrations(): CustomIntegration[] {
    return Array.from(this.customIntegrations.values());
  }

  public getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  public updateIntegration(id: string, updates: Partial<IntegrationConfig>): void {
    const integration = this.integrations.get(id);
    if (integration) {
      const updated = { ...integration, ...updates };
      this.integrations.set(id, updated);
      this.saveIntegrations();
    }
  }

  public async connectSlack(config: SlackConfig): Promise<boolean> {
    try {
      // Simulate Slack connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateIntegration('slack', {
        enabled: true,
        config: { ...this.getIntegration('slack')?.config, ...config },
        status: 'connected',
        lastSync: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to connect Slack:', error);
      this.updateIntegration('slack', { status: 'error' });
      return false;
    }
  }

  public async connectGoogleWorkspace(config: GoogleConfig): Promise<boolean> {
    try {
      // Simulate Google Workspace connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateIntegration('google-workspace', {
        enabled: true,
        config: { ...this.getIntegration('google-workspace')?.config, ...config },
        status: 'connected',
        lastSync: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to connect Google Workspace:', error);
      this.updateIntegration('google-workspace', { status: 'error' });
      return false;
    }
  }

  public async connectMicrosoftTeams(config: MicrosoftConfig): Promise<boolean> {
    try {
      // Simulate Microsoft Teams connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.updateIntegration('microsoft-teams', {
        enabled: true,
        config: { ...this.getIntegration('microsoft-teams')?.config, ...config },
        status: 'connected',
        lastSync: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to connect Microsoft Teams:', error);
      this.updateIntegration('microsoft-teams', { status: 'error' });
      return false;
    }
  }

  public disconnectIntegration(id: string): void {
    this.updateIntegration(id, {
      enabled: false,
      status: 'disconnected',
    });
  }

  public async sendSlackNotification(message: string, channel?: string): Promise<boolean> {
    const integration = this.getIntegration('slack');
    if (!integration?.enabled || integration.status !== 'connected') {
      return false;
    }

    try {
      const webhookUrl = integration.config.webhookUrl;
      const targetChannel = channel || integration.config.channel;

      if (!webhookUrl) {
        throw new Error('Slack webhook URL not configured');
      }

      const payload = {
        text: message,
        channel: targetChannel,
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }

  public async syncToGoogleDrive(boardData: any, folderId?: string): Promise<boolean> {
    const integration = this.getIntegration('google-workspace');
    if (!integration?.enabled || integration.status !== 'connected') {
      return false;
    }

    try {
      // Simulate Google Drive sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.updateIntegration('google-workspace', {
        lastSync: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to sync to Google Drive:', error);
      return false;
    }
  }

  public async sendTeamsNotification(message: string, webhookUrl?: string): Promise<boolean> {
    const integration = this.getIntegration('microsoft-teams');
    if (!integration?.enabled || integration.status !== 'connected') {
      return false;
    }

    try {
      const targetWebhook = webhookUrl || integration.config.teamsWebhookUrl;

      if (!targetWebhook) {
        throw new Error('Teams webhook URL not configured');
      }

      const payload = {
        text: message,
      };

      const response = await axios.post(targetWebhook, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      return false;
    }
  }

  public addCustomIntegration(integration: CustomIntegration): string {
    const id = `custom-${Date.now()}`;
    this.customIntegrations.set(id, integration);
    this.saveIntegrations();
    return id;
  }

  public updateCustomIntegration(id: string, updates: Partial<CustomIntegration>): void {
    const integration = this.customIntegrations.get(id);
    if (integration) {
      const updated = { ...integration, ...updates };
      this.customIntegrations.set(id, updated);
      this.saveIntegrations();
    }
  }

  public removeCustomIntegration(id: string): void {
    this.customIntegrations.delete(id);
    this.saveIntegrations();
  }

  public async triggerCustomIntegration(id: string, event: string, data: any): Promise<boolean> {
    const integration = this.customIntegrations.get(id);
    if (!integration || !integration.events.includes(event)) {
      return false;
    }

    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(integration.endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(integration.apiKey && { 'Authorization': `Bearer ${integration.apiKey}` }),
        },
        validateStatus: () => true,
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Failed to trigger custom integration:', error);
      return false;
    }
  }

  public getIntegrationStatus(id: string): 'connected' | 'disconnected' | 'error' | undefined {
    return this.integrations.get(id)?.status;
  }

  public isIntegrationEnabled(id: string): boolean {
    return this.integrations.get(id)?.enabled || false;
  }
}

// Lazy-loaded manager to prevent SSR issues
let _integrationManager: IntegrationManager | null = null;

export const getIntegrationManager = (): IntegrationManager => {
  if (typeof window === 'undefined') {
    // Return a mock manager for SSR
    return {
      getIntegrations: () => [],
      getCustomIntegrations: () => [],
      getIntegration: () => undefined,
      updateIntegration: () => {},
      connectSlack: async () => false,
      connectGoogleWorkspace: async () => false,
      connectMicrosoftTeams: async () => false,
      disconnectIntegration: () => {},
      sendSlackNotification: async () => false,
      syncToGoogleDrive: async () => false,
      sendTeamsNotification: async () => false,
      addCustomIntegration: () => '',
      updateCustomIntegration: () => {},
      removeCustomIntegration: () => {},
      triggerCustomIntegration: async () => false,
      getIntegrationStatus: () => undefined,
      isIntegrationEnabled: () => false,
    } as IntegrationManager;
  }
  
  if (!_integrationManager) {
    _integrationManager = new IntegrationManager();
  }
  
  return _integrationManager;
};

export const integrationManager = getIntegrationManager();
