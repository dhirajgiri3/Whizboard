"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  BookOpen,
  Lightbulb,
  ArrowRight,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { GoogleDriveManager } from '@/components/ui/GoogleDriveManager';
import { GoogleDriveDashboard } from '@/components/ui/GoogleDriveDashboard';
import { GoogleDriveOnboarding } from '@/components/ui/GoogleDriveOnboarding';
import { GoogleDriveQuickActions } from '@/components/ui/GoogleDriveQuickActions';
import { toast } from 'sonner';
import BackButton from '@/components/ui/BackButton';

// Local UI primitives aligned with settings page & design system
const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors ${className}`}
  >
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const PrimaryButton = ({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) => (
  <button
    {...rest}
    className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
  </button>
);

const ActionTile = ({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
  >
    <div className="inline-flex p-3 rounded-xl bg-white/[0.06] border border-white/[0.12] mb-4">
      <Icon className="w-5 h-5 text-white/80" />
    </div>
    <div className="space-y-1">
      <div className="text-white font-medium">{title}</div>
      <div className="text-sm text-white/70">{description}</div>
    </div>
    <ArrowRight className="w-4 h-4 text-white/50 absolute right-4 top-4 group-hover:translate-x-0.5 transition-transform" />
  </button>
);

export default function GoogleDrivePage() {
  const { files, listFiles, isLoading } = useGoogleDrive();
  const [showFileManager, setShowFileManager] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    recentExports: 0,
    storageUsed: '0 MB',
    lastSync: 'Never'
  });

  useEffect(() => {
    checkConnectionStatus();
    loadStats();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if user has Google Drive connected by trying to list files
      await listFiles();
      setIsConnected(true);
    } catch (error) {
      console.error('Connection check failed:', error);
      // Don't set connected to false for API errors, only for auth errors
      if (error instanceof Error && (error.message?.includes('Google Drive not connected') || error.message?.includes('Unauthorized'))) {
        setIsConnected(false);
      }
      // For API errors, we'll show the error in the UI but not mark as disconnected
    }
  };

  const loadStats = async () => {
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
      console.error('Failed to load stats:', error);
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
    
    console.log('Storage calculation:', { totalBytes, fileCount: files.length, files: files.map(f => ({ name: f.name, size: f.size })) });
    
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

  const features = [
    {
      title: 'Export Boards',
      description: 'Save your whiteboards directly to Google Drive in multiple formats',
      icon: Upload,
      color: 'bg-blue-600',
      benefits: ['PNG, SVG, and JSON formats', 'High-quality exports', 'Direct upload to Drive']
    },
    {
      title: 'File Organization',
      description: 'Create folders and organize your boards for better collaboration',
      icon: Folder,
      color: 'bg-emerald-500',
      benefits: ['Create custom folders', 'Organize by project', 'Easy file management']
    },
    {
      title: 'Team Collaboration',
      description: 'Share boards with team members using Google Drive sharing',
      icon: Users,
      color: 'bg-blue-500',
      benefits: ['Share via links', 'Set permissions', 'Real-time collaboration']
    },
    {
      title: 'Search & Discovery',
      description: 'Find your boards quickly with powerful search capabilities',
      icon: Search,
      color: 'bg-amber-500',
      benefits: ['Search by name', 'Filter by type', 'Recent files view']
    }
  ];

  const useCases = [
    {
      title: 'Meeting Documentation',
      description: 'Export meeting notes and diagrams for team sharing',
      icon: Calendar,
      color: 'bg-blue-600',
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
      color: 'bg-blue-500',
      examples: ['Proposals', 'Designs', 'Presentations']
    },
    {
      title: 'Personal Organization',
      description: 'Keep your boards organized and accessible from anywhere',
      icon: Cloud,
      color: 'bg-amber-500',
      examples: ['Personal projects', 'Learning notes', 'Creative ideas']
    }
  ];

  const quickActions = [
    {
      title: 'Browse Files',
      description: 'View and manage your Google Drive files',
      icon: Folder,
      action: () => setShowFileManager(true)
    },
    {
      title: 'View Dashboard',
      description: 'See statistics and overview of your Google Drive usage',
      icon: BarChart3,
      action: () => setShowDashboard(true)
    },
    {
      title: 'Start Onboarding',
      description: 'Learn how to use Google Drive integration effectively',
      icon: BookOpen,
      action: () => setShowOnboarding(true)
    },
    {
      title: 'Manage Settings',
      description: 'Configure your Google Drive connection and preferences',
      icon: Settings,
      action: () => {
        window.location.href = '/settings?tab=integrations';
      }
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <BackButton 
          variant="dark" 
          position="relative"
          size="md"
          label="Back to Dashboard"
        />
      </div>
      {/* Header */}
      <section className="pt-16 sm:pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mx-auto">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">Google Drive Integration</span>
            </div>
            <h1 className="headline-lg text-white">Manage your Drive files and exports</h1>
            <p className="body-base text-white/70 max-w-2xl mx-auto">Export boards, organize folders, and keep everything in sync with Google Drive.</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <PrimaryButton onClick={loadStats} aria-label="Refresh drive stats">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </PrimaryButton>
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] inline-flex items-center gap-2"
              >
                Open Google Drive
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Connection Status */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <SectionCard>
          {!isConnected ? (
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <div className="flex-1">
                <h3 className="text-white font-medium mb-1">Google Drive not connected</h3>
                <p className="text-white/70 text-sm">Connect your Google Drive account to start exporting boards and managing files.</p>
              </div>
              <PrimaryButton onClick={() => (window.location.href = '/settings?tab=integrations')}>
                Connect now
                <ArrowRight className="w-4 h-4" />
              </PrimaryButton>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-white font-medium mb-1">Connected to Google Drive</h3>
                <p className="text-white/70 text-sm">Your account is connected and ready to use.</p>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Primary Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <SectionCard>
          <h2 className="text-white text-xl font-semibold mb-4">Get started</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionTile
              title="Browse Files"
              description="View and manage your Drive files"
              icon={Folder}
              onClick={() => setShowFileManager(true)}
            />
            <ActionTile
              title="View Dashboard"
              description="See usage and statistics"
              icon={BarChart3}
              onClick={() => setShowDashboard(true)}
            />
            <ActionTile
              title="Onboarding"
              description="Learn how to use Drive integration"
              icon={BookOpen}
              onClick={() => setShowOnboarding(true)}
            />
            <ActionTile
              title="Integration Settings"
              description="Manage your connection"
              icon={Settings}
              onClick={() => (window.location.href = '/settings?tab=integrations')}
            />
          </div>
        </SectionCard>
      </div>

      {/* Stats Grid */}
      {isConnected && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{
              label: 'Total Files',
              value: stats.totalFiles,
              icon: FileText,
              color: 'text-blue-400',
              bg: 'bg-blue-600/10 border border-blue-600/20'
            }, {
              label: 'Folders',
              value: stats.totalFolders,
              icon: Folder,
              color: 'text-emerald-400',
              bg: 'bg-emerald-600/10 border border-emerald-600/20'
            }, {
              label: 'Recent Exports',
              value: stats.recentExports,
              icon: Clock,
              color: 'text-blue-300',
              bg: 'bg-white/[0.03] border border-white/[0.08]'
            }, {
              label: 'Storage Used',
              value: stats.storageUsed,
              icon: TrendingUp,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10 border border-amber-500/20'
            }].map((card, idx) => {
              const Icon = card.icon as any;
              return (
                <SectionCard key={idx}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${card.bg}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">{card.label}</p>
                      <p className="text-2xl font-semibold text-white">{card.value}</p>
                    </div>
                  </div>
                </SectionCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content - Stacked sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Recent Files (Primary secondary) */}
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Files</h3>
            <button
              onClick={() => setShowFileManager(true)}
              className="text-sm text-blue-300 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
            >
              View All
            </button>
          </div>
          {files.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No files found</p>
              <p className="text-sm">Start by exporting a board to Google Drive</p>
            </div>
          ) : (
            <div className="space-y-3">
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
        </SectionCard>

        {/* Features */}
        <SectionCard>
          <h2 className="text-white text-xl font-semibold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon as any;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex p-3 rounded-xl ${feature.color}/10 border ${feature.color}/20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{feature.description}</p>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-white/70">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        {/* Use Cases */}
        <SectionCard>
          <h2 className="text-white text-xl font-semibold mb-6">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon as any;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex p-3 rounded-xl ${useCase.color}/10 border ${useCase.color}/20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2">{useCase.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{useCase.description}</p>
                      <div className="space-y-2">
                        {useCase.examples.map((example, idx) => (
                          <div key={idx} className="text-sm text-white/60 flex items-center gap-2">
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
        </SectionCard>

        {/* Tips */}
        <SectionCard>
          <div className="flex items-start gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Tips for best experience</h3>
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
        </SectionCard>
      </div>

      {/* Modals */}
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

      <GoogleDriveDashboard
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      <GoogleDriveOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          toast.success('Onboarding completed! You\'re ready to use Google Drive integration.');
        }}
        isConnected={isConnected}
      />

      {/* Quick Actions Button */}
      <GoogleDriveQuickActions />
    </div>
  );
}
