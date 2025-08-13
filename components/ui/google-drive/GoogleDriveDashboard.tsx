"use client";

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Cloud,
  Folder,
  FileText,
  Image,
  Upload,
  Download,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  Calendar,
  Users,
  BarChart3,
  X,
  Lightbulb
} from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { GoogleDriveManager } from '@/components/ui/google-drive/GoogleDriveManager';
import { toast } from 'sonner';
import api from '@/lib/http/axios';

interface GoogleDriveDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DriveStats {
  totalFiles: number;
  totalFolders: number;
  recentExports: number;
  storageUsed: string;
  lastSync: string;
}

export function GoogleDriveDashboard({ isOpen, onClose }: GoogleDriveDashboardProps) {
  const { files, listFiles, isLoading } = useGoogleDrive();
  const prefersReducedMotion = useReducedMotion();
  const [showFileManager, setShowFileManager] = useState(false);
  const [stats, setStats] = useState<DriveStats>({
    totalFiles: 0,
    totalFolders: 0,
    recentExports: 0,
    storageUsed: '0 MB',
    lastSync: 'Never'
  });

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const loadDashboardData = async () => {
    try {
      const driveFiles = await listFiles();
      const folders = driveFiles.filter((f: any) => f.mimeType === 'application/vnd.google-apps.folder');
      const recentFiles = driveFiles.filter((f: any) => {
        const fileDate = new Date(f.modifiedTime);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return fileDate > weekAgo;
      });

      setStats({
        totalFiles: driveFiles.length,
        totalFolders: folders.length,
        recentExports: recentFiles.length,
        storageUsed: calculateStorageUsed(driveFiles),
        lastSync: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const calculateStorageUsed = (files: any[]): string => {
    const totalBytes = files.reduce((sum, file) => {
      // Handle different size formats and ensure we get a number
      let fileSize = 0;
      if (file.size) {
        if (typeof file.size === 'string') {
          fileSize = parseInt(file.size) || 0;
        } else if (typeof file.size === 'number') {
          fileSize = file.size;
        }
      }
      return sum + fileSize;
    }, 0);
    
    if (totalBytes === 0) {
      return '0 KB';
    } else if (totalBytes < 1024) {
      return `${totalBytes} B`;
    } else if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const quickActions = [
    {
      title: 'Export Board',
      description: 'Export current board to Google Drive',
      icon: Upload,
      color: 'bg-blue-500',
      action: () => {
        toast.info('Use the export button in the board toolbar to export to Google Drive');
      }
    },
    {
      title: 'Browse Files',
      description: 'View and manage your Google Drive files',
      icon: Folder,
      color: 'bg-green-500',
      action: () => setShowFileManager(true)
    },
    {
      title: 'Create Folder',
      description: 'Create a new folder in Google Drive',
      icon: Plus,
      color: 'bg-purple-500',
      action: () => setShowFileManager(true)
    },
    {
      title: 'Recent Files',
      description: 'View recently modified files',
      icon: Calendar,
      color: 'bg-orange-500',
      action: () => setShowFileManager(true)
    }
  ];

  const useCaseCards = [
    {
      title: 'Meeting Documentation',
      description: 'Export meeting notes and diagrams for team sharing',
      icon: Users,
      color: 'bg-indigo-500',
      examples: ['Brainstorming sessions', 'Project planning', 'Client meetings']
    },
    {
      title: 'Project Management',
      description: 'Organize boards in project folders for better workflow',
      icon: BarChart3,
      color: 'bg-emerald-500',
      examples: ['Roadmaps', 'Timelines', 'Process flows']
    },
    {
      title: 'Client Deliverables',
      description: 'Share professional exports with clients and stakeholders',
      icon: FileText,
      color: 'bg-rose-500',
      examples: ['Proposals', 'Designs', 'Presentations']
    },
    {
      title: 'Personal Organization',
      description: 'Keep your boards organized and accessible from anywhere',
      icon: Cloud,
      color: 'bg-cyan-500',
      examples: ['Personal projects', 'Learning notes', 'Creative ideas']
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal>
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
        className="rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden bg-[#111111] border border-white/[0.08] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Google Drive Dashboard</h2>
              <p className="text-white/70">Manage your boards and files in Google Drive</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              aria-label="Refresh"
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats and Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Connection Status */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="font-medium text-white">Connected to Google Drive</h3>
                    <p className="text-sm text-white/70">Your account is successfully connected</p>
                  </div>
                </div>
              </div>

              {/* Whizboard Folder Info */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <Folder className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="font-medium text-white">Whizboard Folder</h3>
                    <p className="text-sm text-white/70">Boards are saved to the "Whizboard" folder in Google Drive</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08]">
                <h3 className="font-medium text-white mb-4">Drive Statistics</h3>
                <div className="space-y-3 text-white/80">
                  <div className="flex justify-between items-center"><span className="text-white/70">Total Files</span><span className="font-semibold text-white">{stats.totalFiles}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/70">Folders</span><span className="font-semibold text-white">{stats.totalFolders}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/70">Recent Exports</span><span className="font-semibold text-white">{stats.recentExports}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/70">Storage Used</span><span className="font-semibold text-white">{stats.storageUsed}</span></div>
                  <div className="flex justify-between items-center"><span className="text-white/70">Last Sync</span><span className="font-semibold text-white text-sm">{stats.lastSync}</span></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08]">
                <h3 className="font-medium text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.12]">
                          <Icon className="w-4 h-4 text-white/80" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{action.title}</div>
                          <div className="text-sm text-white/70">{action.description}</div>
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Test Upload Button */}
                  <button
                    onClick={async () => {
                      try {
                        const { data } = await api.post('/api/integrations/google-drive/test-upload');
                        if (data.success) {
                          toast.success('Test upload successful!', {
                            description: `File size: ${data.fileSize || 'Unknown'}`,
                            duration: 5000,
                          });
                          // Refresh the dashboard
                          loadDashboardData();
                        } else {
                          toast.error(data.error || 'Test upload failed');
                        }
                      } catch (error) {
                        toast.error('Test upload failed');
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
                      <Upload className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Test Upload</div>
                      <div className="text-sm text-white/70">Test PNG upload to verify functionality</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Use Cases and Recent Files */}
            <div className="lg:col-span-2 space-y-6">
              {/* Use Cases */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">How to Use Google Drive Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {useCaseCards.map((useCase, index) => {
                    const Icon = useCase.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.12]">
                            <Icon className="w-5 h-5 text-white/80" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-2">{useCase.title}</h4>
                            <p className="text-sm text-white/70 mb-3">{useCase.description}</p>
                            <div className="space-y-1">
                              {useCase.examples.map((example, idx) => (
                                <div key={idx} className="text-xs text-white/60 flex items-center gap-1">
                                  <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                                  {example}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Files */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Recent Files</h3>
                  <button
                    onClick={() => setShowFileManager(true)}
                    className="text-sm text-blue-300 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
                  >
                    View All
                  </button>
                </div>
                {files.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-3">
                      <Folder className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="font-medium">No files yet</p>
                    <p className="text-sm text-white/60">Export a board to Google Drive to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04]"
                      >
                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                          <Folder className="w-4 h-4 text-blue-400" />
                        ) : file.mimeType.startsWith('image/') ? (
                          <Image className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-white/60" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{file.name}</div>
                          <div className="text-xs text-white/60">{new Date(file.modifiedTime).toLocaleDateString()}</div>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-white/50 hover:text-white/80"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tips and Best Practices */}
              <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-400" />
                  <h3 className="font-medium text-white">Tips for best experience</h3>
                </div>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use folders to organize boards by project or topic</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Export important boards immediately after creation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use PNG format for presentations, SVG for web use</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Share folders with team members for collaboration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Drive Manager */}
        <GoogleDriveManager
          isOpen={showFileManager}
          onClose={() => setShowFileManager(false)}
          allowUpload={true}
          allowDownload={true}
          allowDelete={true}
          allowCreateFolder={true}
          showSearch={true}
          title="Google Drive Files"
        />
      </motion.div>
    </div>
  );
}
