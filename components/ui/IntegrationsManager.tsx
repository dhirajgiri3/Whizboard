'use client';

import { useState, useEffect } from 'react';
import { 
  getIntegrationManager, 
  IntegrationConfig, 
  SlackConfig, 
  GoogleConfig, 
  MicrosoftConfig, 
  CustomIntegration 
} from '@/lib/integrations/IntegrationManager';
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Zap,
  FolderOpen,
  Share2
} from 'lucide-react';
import { SiGoogledrive, SiSlack } from 'react-icons/si';

interface IntegrationsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationsManager = ({ isOpen, onClose }: IntegrationsManagerProps) => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegration[]>([]);
  const [activeTab, setActiveTab] = useState<'integrations' | 'custom'>('integrations');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Form states
  const [slackConfig, setSlackConfig] = useState<SlackConfig>({
    webhookUrl: '',
    channel: '',
    notifications: {
      boardCreated: true,
      boardShared: true,
      comments: false,
    },
  });

  const [googleConfig, setGoogleConfig] = useState<GoogleConfig>({
    calendarId: '',
    driveFolderId: '',
    autoSync: false,
    permissions: ['calendar', 'drive'],
  });

  const [microsoftConfig, setMicrosoftConfig] = useState<MicrosoftConfig>({
    teamsWebhookUrl: '',
    sharepointSite: '',
    autoSync: false,
    permissions: ['teams', 'sharepoint'],
  });

  const [customIntegration, setCustomIntegration] = useState<Omit<CustomIntegration, 'name'>>({
    endpoint: '',
    apiKey: '',
    events: [],
    config: {},
  });

  useEffect(() => {
    if (isOpen && isMounted) {
      const manager = getIntegrationManager();
      setIntegrations(manager.getIntegrations());
      setCustomIntegrations(manager.getCustomIntegrations());
    }
  }, [isOpen, isMounted]);

  const handleConnectSlack = async () => {
    setIsConnecting(true);
    try {
      const manager = getIntegrationManager();
      const success = await manager.connectSlack(slackConfig);
      if (success) {
        setIntegrations(manager.getIntegrations());
        setSelectedIntegration(null);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const manager = getIntegrationManager();
      const success = await manager.connectGoogleWorkspace(googleConfig);
      if (success) {
        setIntegrations(manager.getIntegrations());
        setSelectedIntegration(null);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectMicrosoft = async () => {
    setIsConnecting(true);
    try {
      const manager = getIntegrationManager();
      const success = await manager.connectMicrosoftTeams(microsoftConfig);
      if (success) {
        setIntegrations(manager.getIntegrations());
        setSelectedIntegration(null);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (id: string) => {
    const manager = getIntegrationManager();
    manager.disconnectIntegration(id);
    setIntegrations(manager.getIntegrations());
  };

  const handleAddCustomIntegration = () => {
    const name = prompt('Enter integration name:');
    if (name) {
      const newIntegration: CustomIntegration = {
        name,
        ...customIntegration,
      };
      const manager = getIntegrationManager();
      manager.addCustomIntegration(newIntegration);
      setCustomIntegrations(manager.getCustomIntegrations());
      setCustomIntegration({
        endpoint: '',
        apiKey: '',
        events: [],
        config: {},
      });
    }
  };

  const handleRemoveCustomIntegration = (id: string) => {
    if (confirm('Are you sure you want to remove this integration?')) {
      const manager = getIntegrationManager();
      manager.removeCustomIntegration(id);
      setCustomIntegrations(manager.getCustomIntegrations());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return <SiSlack className="w-5 h-5" color="#611F69" />;
      case 'google':
        return <SiGoogledrive className="w-5 h-5" color="#4285F4" />;
      case 'microsoft':
        return <Users className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  if (!isOpen || !isMounted) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Integrations</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('integrations')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'integrations' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Zap className="w-5 h-5" />
                Third-party Integrations
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'custom' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Settings className="w-5 h-5" />
                Custom Integrations
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Third-party Integrations</h3>
                
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getIntegrationIcon(integration.type)}
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {integration.status === 'connected' ? 'Connected' : 
                               integration.status === 'error' ? 'Connection Error' : 'Not Connected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          {integration.enabled ? (
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedIntegration(integration.id)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>

                      {integration.lastSync && (
                        <p className="text-xs text-gray-500">
                          Last synced: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Connection Forms */}
                {selectedIntegration === 'slack' && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-4">Connect Slack</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={slackConfig.webhookUrl}
                          onChange={(e) => setSlackConfig({ ...slackConfig, webhookUrl: e.target.value })}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Channel (optional)</label>
                        <input
                          type="text"
                          value={slackConfig.channel}
                          onChange={(e) => setSlackConfig({ ...slackConfig, channel: e.target.value })}
                          placeholder="#general"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackConfig.notifications.boardCreated}
                            onChange={(e) => setSlackConfig({
                              ...slackConfig,
                              notifications: { ...slackConfig.notifications, boardCreated: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">Notify when boards are created</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackConfig.notifications.boardShared}
                            onChange={(e) => setSlackConfig({
                              ...slackConfig,
                              notifications: { ...slackConfig.notifications, boardShared: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">Notify when boards are shared</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slackConfig.notifications.comments}
                            onChange={(e) => setSlackConfig({
                              ...slackConfig,
                              notifications: { ...slackConfig.notifications, comments: e.target.checked }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm">Notify on comments</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConnectSlack}
                          disabled={isConnecting || !slackConfig.webhookUrl}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect Slack'}
                        </button>
                        <button
                          onClick={() => setSelectedIntegration(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntegration === 'google-workspace' && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-4">Connect Google Workspace</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Calendar ID (optional)</label>
                        <input
                          type="text"
                          value={googleConfig.calendarId}
                          onChange={(e) => setGoogleConfig({ ...googleConfig, calendarId: e.target.value })}
                          placeholder="primary"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Drive Folder ID (optional)</label>
                        <input
                          type="text"
                          value={googleConfig.driveFolderId}
                          onChange={(e) => setGoogleConfig({ ...googleConfig, driveFolderId: e.target.value })}
                          placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={googleConfig.autoSync}
                            onChange={(e) => setGoogleConfig({ ...googleConfig, autoSync: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Auto-sync to Google Drive</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConnectGoogle}
                          disabled={isConnecting}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect Google Workspace'}
                        </button>
                        <button
                          onClick={() => setSelectedIntegration(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntegration === 'microsoft-teams' && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-4">
                    <h4 className="font-medium mb-4">Connect Microsoft Teams</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Teams Webhook URL</label>
                        <input
                          type="url"
                          value={microsoftConfig.teamsWebhookUrl}
                          onChange={(e) => setMicrosoftConfig({ ...microsoftConfig, teamsWebhookUrl: e.target.value })}
                          placeholder="https://outlook.office.com/webhook/..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">SharePoint Site (optional)</label>
                        <input
                          type="text"
                          value={microsoftConfig.sharepointSite}
                          onChange={(e) => setMicrosoftConfig({ ...microsoftConfig, sharepointSite: e.target.value })}
                          placeholder="https://company.sharepoint.com/sites/..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={microsoftConfig.autoSync}
                            onChange={(e) => setMicrosoftConfig({ ...microsoftConfig, autoSync: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm">Auto-sync to SharePoint</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleConnectMicrosoft}
                          disabled={isConnecting || !microsoftConfig.teamsWebhookUrl}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect Microsoft Teams'}
                        </button>
                        <button
                          onClick={() => setSelectedIntegration(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Custom Integrations</h3>
                  <button
                    onClick={handleAddCustomIntegration}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4" />
                    Add Integration
                  </button>
                </div>

                <div className="space-y-4">
                  {customIntegrations.map((integration, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5" />
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{integration.endpoint}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveCustomIntegration(index.toString())}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Events: {integration.events.join(', ') || 'None'}
                      </div>
                    </div>
                  ))}

                  {customIntegrations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No custom integrations yet</p>
                      <p className="text-sm">Add webhook integrations to connect with external services</p>
                    </div>
                  )}
                </div>

                {/* Add Custom Integration Form */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium mb-4">Add Custom Integration</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Endpoint URL</label>
                      <input
                        type="url"
                        value={customIntegration.endpoint}
                        onChange={(e) => setCustomIntegration({ ...customIntegration, endpoint: e.target.value })}
                        placeholder="https://your-api.com/webhook"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">API Key (optional)</label>
                      <input
                        type="password"
                        value={customIntegration.apiKey}
                        onChange={(e) => setCustomIntegration({ ...customIntegration, apiKey: e.target.value })}
                        placeholder="Bearer token or API key"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Events (comma-separated)</label>
                      <input
                        type="text"
                        value={customIntegration.events.join(', ')}
                        onChange={(e) => setCustomIntegration({ 
                          ...customIntegration, 
                          events: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        })}
                        placeholder="board.created, board.updated, comment.added"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
