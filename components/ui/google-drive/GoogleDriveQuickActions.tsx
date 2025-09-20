"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Upload, 
  Download, 
  Folder, 
  Search, 
  Plus,
  Settings,
  ExternalLink,
  FileText,
  Image,
  Archive,
  Users,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { useGoogleDrive } from '@/hooks';
import { GoogleDriveManager } from './GoogleDriveManager';
import { GoogleDriveDashboard } from './GoogleDriveDashboard';
import { toast } from 'sonner';

interface GoogleDriveQuickActionsProps {
  boardId?: string;
  boardName?: string;
  onExport?: () => void;
}

export function GoogleDriveQuickActions({ 
  boardId, 
  boardName, 
  onExport 
}: GoogleDriveQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFileManager, setShowFileManager] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { exportBoardToGoogleDrive, isLoading } = useGoogleDrive();

  const quickActions = [
    {
      title: 'Export Board',
      description: 'Export current board to Google Drive',
      icon: Upload,
      color: 'bg-blue-500',
      action: () => {
        if (onExport) {
          onExport();
        } else {
          toast.info('Use the export button in the board toolbar to export to Google Drive');
        }
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
      title: 'Search Files',
      description: 'Search for files in Google Drive',
      icon: Search,
      color: 'bg-orange-500',
      action: () => setShowFileManager(true)
    },
    {
      title: 'Dashboard',
      description: 'View Google Drive statistics and overview',
      icon: BarChart3,
      color: 'bg-indigo-500',
      action: () => setShowDashboard(true)
    },
    {
      title: 'Settings',
      description: 'Manage Google Drive connection',
      icon: Settings,
      color: 'bg-gray-500',
      action: () => {
        window.location.href = '/settings?tab=integrations';
      }
    }
  ];

  const recentActions = [
    {
      title: 'Recent Exports',
      description: 'View recently exported boards',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Team Folders',
      description: 'Access shared team folders',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'Templates',
      description: 'Browse board templates',
      icon: FileText,
      color: 'bg-purple-500'
    }
  ];

  const handleQuickExport = async () => {
    if (!boardId || !boardName) {
      toast.error('No board selected for export');
      return;
    }

    try {
      const result = await exportBoardToGoogleDrive(boardId, 'png', {
        quality: 'high',
        includeMetadata: true
      });

      if (result.success) {
        toast.success('Board exported successfully to Google Drive!', {
          description: result.googleDriveUrl ? (
            <a 
              href={result.googleDriveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View in Google Drive
            </a>
          ) : undefined,
          duration: 5000,
        });
      } else {
        toast.error(result.error || 'Failed to export board');
      }
    } catch (error) {
      toast.error('Failed to export board to Google Drive');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 z-40"
        title="Google Drive Quick Actions"
        aria-label="Open Google Drive Quick Actions"
      >
        <Cloud className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Quick Actions Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed bottom-6 right-6 w-80 rounded-2xl shadow-2xl border border-white/[0.08] bg-[#111111] backdrop-blur-xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-600/20">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Google Drive</h3>
              <p className="text-sm text-white/70">Quick Actions</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                     {/* Quick Export */}
           {boardId && boardName && (
             <div className="rounded-lg p-3 bg-blue-600/10 border border-blue-600/20">
               <div className="flex items-center gap-3 mb-2">
                 <Zap className="w-5 h-5 text-blue-400" />
                 <div>
                    <h4 className="font-semibold text-white">Quick Export</h4>
                    <p className="text-sm text-white/80">{boardName}</p>
                 </div>
               </div>
               <button
                 onClick={handleQuickExport}
                 disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                {isLoading ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     Exporting...
                   </>
                 ) : (
                   <>
                     <Upload className="w-4 h-4" />
                     Export to Drive
                   </>
                 )}
               </button>
               <div className="mt-2 text-xs text-white/80 flex items-center gap-1">
                 <Folder className="w-3 h-3 text-blue-300" />
                 <span>Will save to Whizboard folder</span>
               </div>
             </div>
           )}

          {/* Main Actions */}
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Actions</h4>
            <div className="space-y-2">
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
                    <div className="flex-1">
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-white/70">{action.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Actions */}
          <div>
            <h4 className="font-semibold text-white mb-3">Recent</h4>
            <div className="space-y-2">
              {recentActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setShowFileManager(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.12]">
                      <Icon className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{action.title}</div>
                      <div className="text-sm text-white/70">{action.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg p-3 bg-white/[0.03] border border-white/[0.08]">
            <h4 className="font-semibold text-white mb-2">Tip</h4>
            <p className="text-sm text-white/80">
              Use folders to organize your boards by project or topic for better collaboration.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Google Drive Integration</span>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-300 hover:text-blue-200"
            >
              Open Drive
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </motion.div>

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
    </>
  );
}
