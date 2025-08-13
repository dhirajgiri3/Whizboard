"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  TrendingUp,
} from "lucide-react";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { GoogleDriveManager } from "@/components/ui/google-drive/GoogleDriveManager";
import { GoogleDriveDashboard } from "@/components/ui/google-drive/GoogleDriveDashboard";
import { GoogleDriveOnboarding } from "@/components/ui/google-drive/GoogleDriveOnboarding";
import { GoogleDriveQuickActions } from "@/components/ui/google-drive/GoogleDriveQuickActions";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading/Loading";
import BackButton from "@/components/ui/BackButton";
// Loading component not needed in this page layout

// Local UI primitives aligned with settings page & design system
const SectionCard = ({
  children,
  className = "",
  reducedMotion = false,
}: {
  children: React.ReactNode;
  className?: string;
  reducedMotion?: boolean;
}) => (
  <motion.div
    initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
    animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
    transition={reducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
    className={`relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors backdrop-blur-sm ${className}`}
  >
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const PrimaryButton = ({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}) => (
  <button
    {...rest}
    className={`group relative overflow-hidden bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px] ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
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
  const prefersReducedMotion = useReducedMotion();
  const [showFileManager, setShowFileManager] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    recentExports: 0,
    storageUsed: "0 MB",
    lastSync: "Never",
  });

  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      await Promise.allSettled([checkConnectionStatus(), loadStats()]);
      setIsInitializing(false);
    };
    init();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check if user has Google Drive connected by trying to list files
      await listFiles();
      setIsConnected(true);
    } catch (error) {
      console.error("Connection check failed:", error);
      // Don't set connected to false for API errors, only for auth errors
      if (
        error instanceof Error &&
        (error.message?.includes("Google Drive not connected") ||
          error.message?.includes("Unauthorized"))
      ) {
        setIsConnected(false);
      }
      // For API errors, we'll show the error in the UI but not mark as disconnected
    }
  };

  const loadStats = async () => {
    try {
      const driveFiles = await listFiles();
      const folders = driveFiles.filter(
        (f: any) => f.mimeType === "application/vnd.google-apps.folder"
      );
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
        lastSync: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const calculateStorageUsed = (files: any[]): string => {
    const totalBytes = files.reduce((sum, file) => {
      // Handle different size formats and ensure we get a number
      let fileSize = 0;
      if (file.size) {
        if (typeof file.size === "string") {
          fileSize = parseInt(file.size) || 0;
        } else if (typeof file.size === "number") {
          fileSize = file.size;
        }
      }
      return sum + fileSize;
    }, 0);

    if (totalBytes === 0) {
      return "0 KB";
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
      title: "Export Boards",
      description:
        "Save your whiteboards directly to Google Drive in multiple formats",
      icon: Upload,
      color: "bg-blue-600",
      benefits: [
        "PNG, SVG, and JSON formats",
        "High-quality exports",
        "Direct upload to Drive",
      ],
    },
    {
      title: "File Organization",
      description:
        "Create folders and organize your boards for better collaboration",
      icon: Folder,
      color: "bg-emerald-500",
      benefits: [
        "Create custom folders",
        "Organize by project",
        "Easy file management",
      ],
    },
    {
      title: "Team Collaboration",
      description: "Share boards with team members using Google Drive sharing",
      icon: Users,
      color: "bg-blue-500",
      benefits: [
        "Share via links",
        "Set permissions",
        "Real-time collaboration",
      ],
    },
    {
      title: "Search & Discovery",
      description: "Find your boards quickly with powerful search capabilities",
      icon: Search,
      color: "bg-amber-500",
      benefits: ["Search by name", "Filter by type", "Recent files view"],
    },
  ];

  const useCases = [
    {
      title: "Meeting Documentation",
      description: "Export meeting notes and diagrams for team sharing",
      icon: Calendar,
      color: "bg-blue-600",
      examples: [
        "Brainstorming sessions",
        "Project planning",
        "Client meetings",
      ],
    },
    {
      title: "Project Management",
      description: "Organize boards in project folders for better workflow",
      icon: BarChart3,
      color: "bg-emerald-500",
      examples: ["Roadmaps", "Timelines", "Process flows"],
    },
    {
      title: "Client Deliverables",
      description: "Share professional exports with clients and stakeholders",
      icon: FileText,
      color: "bg-blue-500",
      examples: ["Proposals", "Designs", "Presentations"],
    },
    {
      title: "Personal Organization",
      description: "Keep your boards organized and accessible from anywhere",
      icon: Cloud,
      color: "bg-amber-500",
      examples: ["Personal projects", "Learning notes", "Creative ideas"],
    },
  ];

  const quickActions = [
    {
      title: "Browse Files",
      description: "View and manage your Google Drive files",
      icon: Folder,
      action: () => setShowFileManager(true),
    },
    {
      title: "View Dashboard",
      description: "See statistics and overview of your Google Drive usage",
      icon: BarChart3,
      action: () => setShowDashboard(true),
    },
    {
      title: "Start Onboarding",
      description: "Learn how to use Google Drive integration effectively",
      icon: BookOpen,
      action: () => setShowOnboarding(true),
    },
    {
      title: "Manage Settings",
      description: "Configure your Google Drive connection and preferences",
      icon: Settings,
      action: () => {
        window.location.href = "/settings?tab=integrations";
      },
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 pb-16">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 gradient-orb-blue" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 gradient-orb-blue" />

      {/* Top actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <BackButton
          variant="dark"
          position="relative"
          size="md"
          label="Back to Dashboard"
        />
      </div>

      {/* Header */}
      <section className="pt-14 pb-8 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.35 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1.5 backdrop-blur-sm mx-auto">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-white/70 text-sm font-medium">
                Google Drive
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <h1 id="gd-header" className="headline-lg text-white">
                Manage your Drive
              </h1>
              <p className="body-base text-white/70 max-w-2xl mx-auto">
                Export boards, organize folders, and keep everything in sync
                with Google Drive.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <PrimaryButton
                onClick={loadStats}
                aria-label="Refresh drive stats"
                disabled={isInitializing || isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
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

      {/* Main Content: settings-like two-column layout */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left column */}
            <div className="space-y-6">
              {/* Connection status */}
              <SectionCard reducedMotion={!!prefersReducedMotion}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10">
                    <Cloud className="w-6 h-6 text-white/70" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Google Drive
                    </h2>
                    <p className="text-white/60 text-sm">Connection status</p>
                  </div>
                </div>
                {isInitializing ? (
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin text-white/70" />
                      <div>
                        <span className="font-medium text-white">
                          Connecting…
                        </span>
                        <p className="text-white/60 text-sm">
                          Verifying integration and fetching files
                        </p>
                      </div>
                    </div>
                    <PrimaryButton disabled>
                      <RefreshCw className="w-4 h-4" /> Refresh
                    </PrimaryButton>
                  </div>
                ) : !isConnected ? (
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <div>
                        <span className="font-medium text-white">
                          Not connected
                        </span>
                        <p className="text-white/60 text-sm">
                          Connect your Google Drive account to get started
                        </p>
                      </div>
                    </div>
                    <PrimaryButton
                      onClick={() =>
                        (window.location.href = "/settings?tab=integrations")
                      }
                    >
                      Connect
                      <ArrowRight className="w-4 h-4" />
                    </PrimaryButton>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="font-medium text-white">
                          Connected
                        </span>
                        <p className="text-white/60 text-sm">
                          Your account is ready to use.
                        </p>
                      </div>
                    </div>
                    <PrimaryButton
                      onClick={loadStats}
                      aria-label="Refresh drive stats"
                      disabled={isInitializing || isLoading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                      />{" "}
                      Refresh
                    </PrimaryButton>
                  </div>
                )}
              </SectionCard>

              {/* Quick actions */}
              <SectionCard reducedMotion={!!prefersReducedMotion}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Quick actions
                    </h2>
                    <p className="text-white/60 text-sm">Common Drive tasks</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowFileManager(true)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white text-sm flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Folder className="w-4 h-4 text-blue-300" /> Browse Files
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                  <button
                    onClick={() => setShowDashboard(true)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white text-sm flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-300" /> View
                      Dashboard
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white text-sm flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-300" /> Start
                      Onboarding
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] text-white text-sm flex items-center justify-between"
                  >
                    <span className="inline-flex items-center gap-2">
                      Open Google Drive
                    </span>
                    <ExternalLink className="w-4 h-4 text-white/50" />
                  </a>
                </div>
              </SectionCard>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Stats */}
              <SectionCard reducedMotion={!!prefersReducedMotion}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-blue-600/10 border border-blue-600/20">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Drive overview
                    </h2>
                    <p className="text-white/60 text-sm">Usage & activity</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Files",
                      value: stats.totalFiles,
                      icon: FileText,
                      color: "text-blue-400",
                      bg: "bg-blue-600/10 border border-blue-600/20",
                    },
                    {
                      label: "Folders",
                      value: stats.totalFolders,
                      icon: Folder,
                      color: "text-emerald-400",
                      bg: "bg-emerald-600/10 border border-emerald-600/20",
                    },
                    {
                      label: "Recent Exports",
                      value: stats.recentExports,
                      icon: Clock,
                      color: "text-blue-300",
                      bg: "bg-white/[0.03] border border-white/[0.08]",
                    },
                    {
                      label: "Storage Used",
                      value: stats.storageUsed,
                      icon: TrendingUp,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10 border border-amber-500/20",
                    },
                  ].map((card, idx) => {
                    const Icon = card.icon as any;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-4 rounded-xl ${card.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${card.color}`} />
                        <div>
                          <p className="text-sm text-white/70">{card.label}</p>
                          <p className="text-xl font-semibold text-white">
                            {isLoading ? (
                              <span className="inline-block h-5 w-10 bg-white/10 rounded animate-pulse" />
                            ) : (
                              card.value
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* Recent files */}
              <SectionCard reducedMotion={!!prefersReducedMotion}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-white/5 border border-white/10">
                    <Folder className="w-6 h-6 text-white/70" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Recent files
                      </h2>
                      <p className="text-white/60 text-sm">
                        Your latest Drive items
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFileManager(true)}
                      className="text-sm text-blue-300 hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-1.5"
                    >
                      View all
                    </button>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-3" aria-busy>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg"
                      >
                        <div className="w-4 h-4 rounded bg-white/10 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
                          <div className="h-3 w-1/4 bg-white/10 rounded mt-2 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-3">
                      <Folder className="w-6 h-6 text-blue-400" />
                    </div>
                    <p className="font-medium">No files yet</p>
                    <p className="text-sm text-white/60">
                      Export a board to Google Drive to see it here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04]"
                      >
                        {file.mimeType ===
                        "application/vnd.google-apps.folder" ? (
                          <Folder className="w-4 h-4 text-blue-400" />
                        ) : file.mimeType?.startsWith("image/") ? (
                          <Image className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <FileText className="w-4 h-4 text-white/60" />
                        )}
                        <div className="flex-1 min-w-0">
                          {file.webViewLink ? (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-white truncate hover:underline"
                              title={file.name}
                            >
                              {file.name}
                            </a>
                          ) : (
                            <div
                              className="text-sm font-medium text-white truncate"
                              title={file.name}
                            >
                              {file.name}
                            </div>
                          )}
                          <div className="text-xs text-white/60">
                            {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-white/50 hover:text-white/80"
                            aria-label={`Open ${file.name} in Google Drive`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </section>

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
          toast.success(
            "Onboarding completed! You're ready to use Google Drive integration."
          );
        }}
        isConnected={isConnected}
      />

      {/* Quick Actions Button */}
      <GoogleDriveQuickActions />
      {isInitializing && (
        <LoadingOverlay
          text="Connecting to Google Drive"
          subtitle="Preparing your integration and fetching files"
          variant="collaboration"
          theme="dark"
        />
      )}
    </div>
  );
}
