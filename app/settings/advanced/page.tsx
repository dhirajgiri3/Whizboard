'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Theme customization removed
import { IntegrationsManager } from '@/components/ui/IntegrationsManager';
import { useOffline } from '@/hooks/useOffline';
import { useSession } from 'next-auth/react';
import {
  Wifi,
  Download,
  Upload,
  Trash2,
  AlertCircle,
  CheckCircle,
  Database,
  Cloud,
  RefreshCw,
  Share2,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/ui/BackButton';
import Loading from '@/components/ui/loading/Loading';
import api from '@/lib/http/axios';

interface StorageInfo {
  used: number;
  total: number;
  boards: number;
  files: number;
  lastBackup?: Date | string;
}

interface DataExportOptions {
  includeBoards: boolean;
  includeSettings: boolean;
  includeIntegrations: boolean;
  includeHistory: boolean;
  format: 'json' | 'zip';
}

export default function AdvancedSettingsPage() {
  const { data: session, status } = useSession();
  const {
    isOnline,
    pendingChangesCount,
    lastSyncTimestamp,
    syncPendingChanges,
    clearOfflineData,
  } = useOffline();
  // Theme customization removed
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Data management states
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 2.4 * 1024 * 1024 * 1024, // 2.4 GB in bytes
    total: 10 * 1024 * 1024 * 1024, // 10 GB in bytes
    boards: 24,
    files: 156,
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  });

  const [exportOptions, setExportOptions] = useState<DataExportOptions>({
    includeBoards: true,
    includeSettings: true,
    includeIntegrations: true,
    includeHistory: false,
    format: 'json',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadStorageInfo = useCallback(async () => {
    try {
      console.log('Loading storage info, session status:', status, 'session:', !!session);
      const { data } = await api.get('/api/settings/storage');
      setStorageInfo(data);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  }, [status, session]);

  useEffect(() => {
    setIsMounted(true);
    loadStorageInfo();
  }, [loadStorageInfo]);

  const formatLastSync = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatStorageSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < sizes.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${sizes[unitIndex]}`;
  };

  const getStoragePercentage = () => {
    return Math.round((storageInfo.used / storageInfo.total) * 100);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await api.post('/api/settings/account/export', { ...exportOptions, format: 'json' }, { responseType: 'blob' });
      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whizboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
      toast.success('Export ready. Your download should start automatically.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Export failed';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (file: File) => {
    setIsImporting(true);
    try {
      console.log('Starting import, session status:', status, 'session:', !!session);
      
      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a JSON (.json) export file');
      }

      const formData = new FormData();
      formData.append('file', file);

      const { data: result } = await api.post('/api/settings/account/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (result?.error) throw new Error(result.error);

      console.log('Import successful, reloading storage info');
      await loadStorageInfo();
      setShowImportModal(false);
      toast.success(`Imported: ${result.importedBoards} boards, ${result.importedSettings} settings, ${result.importedIntegrations} integrations${result.importedHistory ? ", history included" : ''}.`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Import failed';
      console.error('Import error:', e);
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await api.post('/api/settings/account/clear');

      clearOfflineData();

      setStorageInfo({
        used: 0,
        total: 10 * 1024 * 1024 * 1024,
        boards: 0,
        files: 0,
        lastBackup: undefined,
      });

      setShowClearConfirm(false);
    } catch {
      /* silent */
    } finally {
      setIsClearing(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportData(file);
    }
  };

  if (!isMounted) return null;

  const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden backdrop-blur-sm ${className}`}
    >
      <div className="absolute -top-20 -right-20 w-36 h-36 gradient-orb-blue" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );

  const PrimaryButton = ({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button
      {...rest}
      className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px] ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );

  const GhostButton = ({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
    <button
      {...rest}
      className={`text-white hover:text-blue-300 hover:bg-white/5 focus:bg-white/10 active:bg-white/15 font-medium px-5 py-3 rounded-xl border border-white/10 hover:border-blue-400/30 focus:border-blue-400/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black min-h-[44px] ${className}`}
    >
      <span className="flex items-center gap-2 justify-center">{children}</span>
    </button>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--deep-canvas)] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BackButton 
          variant="dark" 
          position="relative"
          size="md"
          label="Back to Settings"
        />
      </div>
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-[0.15]" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      {/* Header */}
      <section className="relative z-10 pt-20 sm:pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-4 py-2 backdrop-blur-sm">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Advanced Settings</span>
            </div>
            <h1 className="headline-lg text-white">Power tools, simplified</h1>
            <p className="body-base text-white/70 max-w-2xl mx-auto">
              Configure offline, theme, integrations, and data—without the clutter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Offline Support */}
            <SectionCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                  <Wifi className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Offline Support</h2>
                  <p className="text-white/60 text-sm">Work without internet connection</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <span className="font-medium text-white">{isOnline ? 'Online' : 'Offline'}</span>
                      <p className="text-white/60 text-sm">{isOnline ? 'Connected to internet' : 'Working offline'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                </div>

                {/* Pending Changes */}
                {pendingChangesCount > 0 && (
                  <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-blue-400" />
                        <div>
                          <span className="text-sm font-medium text-blue-300">{pendingChangesCount} changes pending sync</span>
                          <p className="text-blue-400/70 text-xs">Last sync: {formatLastSync(lastSyncTimestamp)}</p>
                        </div>
                      </div>
                      {isOnline && (
                        <PrimaryButton onClick={syncPendingChanges} className="px-3 py-2 min-h-0 h-9 text-xs">
                          <RefreshCw className="w-4 h-4" /> Sync Now
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <PrimaryButton onClick={syncPendingChanges} disabled={!isOnline || pendingChangesCount === 0}>
                    <RefreshCw className="w-4 h-4" /> Sync Pending Changes
                  </PrimaryButton>
                  <button
                    onClick={clearOfflineData}
                    className="w-full px-5 py-3 rounded-xl border border-red-600/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" /> Clear Offline Data
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Theme & Appearance removed */}

            {/* Integrations */}
            <SectionCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                  <Share2 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Integrations</h2>
                  <p className="text-white/60 text-sm">Connect with external services</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-white/70 text-sm">Connect WhizBoard with your favorite tools for a smoother workflow.</p>
                <PrimaryButton onClick={() => setIsIntegrationsOpen(true)}>
                  <Share2 className="w-4 h-4" /> Manage Integrations
                </PrimaryButton>
              </div>
            </SectionCard>

            {/* Data Management */}
            <SectionCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10">
                  <Database className="w-6 h-6 text-white/70" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Data Management</h2>
                  <p className="text-white/60 text-sm">Export, import, and manage data</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Storage Info */}
                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/70">Storage Used</span>
                    </div>
                    <span className="text-sm text-white/70">
                      {formatStorageSize(storageInfo.used)} / {formatStorageSize(storageInfo.total)}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-2 mb-3">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getStoragePercentage()}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{storageInfo.boards} boards</span>
                    <span>{storageInfo.files} files</span>
                    {storageInfo.lastBackup && (
                      <span>Backup: {formatLastSync(new Date(storageInfo.lastBackup).getTime())}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                  <PrimaryButton onClick={() => setShowExportModal(true)}>
                    <Download className="w-4 h-4" /> Export All Data
                  </PrimaryButton>
                  <GhostButton onClick={() => setShowImportModal(true)}>
                    <Upload className="w-4 h-4" /> Import Data
                  </GhostButton>
                  </div>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full px-5 py-3 rounded-xl border border-red-600/30 text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" /> Clear All Data
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </section>

      {/* Modals */}
      {/* ThemeCustomizer removed */}
      <IntegrationsManager isOpen={isIntegrationsOpen} onClose={() => setIsIntegrationsOpen(false)} />

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#111111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeBoards}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeBoards: e.target.checked })}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/90">Include Boards</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSettings}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeSettings: e.target.checked })}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/90">Include Settings</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeIntegrations}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeIntegrations: e.target.checked })}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/90">Include Integrations</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeHistory}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeHistory: e.target.checked })}
                      className="rounded border-white/20 bg-white/5"
                    />
                    <span className="text-white/90">Include History</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Format</label>
                  <select
                    value={'json'}
                    onChange={() => {}}
                    className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white"
                  >
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <PrimaryButton onClick={handleExportData} disabled={isExporting} className="flex-1">
                    {isExporting ? 'Exporting…' : 'Export'}
                  </PrimaryButton>
                  <GhostButton onClick={() => setShowExportModal(false)} className="flex-1">
                    Cancel
                  </GhostButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#111111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Import Data</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
                  <p className="text-white/70 text-sm mb-2">Drop your export file here</p>
                  <p className="text-white/50 text-xs">Supports JSON (.json) files</p>
                  <input type="file" accept=".json" onChange={handleFileInput} className="hidden" id="import-file" />
                  <label htmlFor="import-file" className="inline-block mt-3 cursor-pointer">
                    <div className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium transition-colors min-h-[44px]">
                      Choose File
                    </div>
                  </label>
                </div>
                <div className="flex gap-3">
                  <GhostButton onClick={() => setShowImportModal(false)} disabled={isImporting} className="flex-1">
                    Cancel
                  </GhostButton>
                </div>
                {isImporting && (
                  <div className="text-center py-2">
                    <Loading size="sm" variant="dots" text="Importing…" tone="dark" />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-[#111111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Clear All Data</h3>
              </div>
              <p className="text-white/70 mb-6">
                This action will permanently delete all your boards, settings, and data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="flex-1 px-5 py-3 rounded-xl border border-red-600/30 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isClearing ? 'Clearing…' : 'Clear All Data'}
                </button>
                <GhostButton onClick={() => setShowClearConfirm(false)} className="flex-1">
                  Cancel
                </GhostButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
