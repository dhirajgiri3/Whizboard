import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Share2, 
  Users, 
  Edit3, 
  Expand, 
  ZoomIn, 
  ZoomOut, 
  Crown,
  UserPlus2,
  Calendar,
  Monitor,
  MonitorSpeaker,
  Trash2,
  Sparkles,
  Palette,
  RotateCcw,
  Download,
  Settings,
  Eye,
  EyeOff,
  Grid3X3,
  Layers,
  Zap,
  RefreshCw,
} from "lucide-react";
import QuickActionButton from "@/components/ui/QuickActionButton";
import { useBoardContext, formatRelativeTime } from "@/components/context/BoardContext";

interface User {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface CanvasHeaderProps {
  currentUser: User;
  onlineUsers: User[];
  // Collaboration actions
  onShare: () => void;
  onOpenCollaboration: () => void;
  onInvite: () => void;
  // Board actions
  onRename: () => void;
  onClearCanvas?: () => void;
  onExport?: () => void;
  // Canvas navigation
  onFitToScreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  // View options
  onTogglePresentation: () => void;
  onToggleGrid?: () => void;
  isPresentationMode?: boolean;
  showGrid?: boolean;
  zoomLevel?: number;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  currentUser,
  onlineUsers,
  onShare,
  onOpenCollaboration,
  onInvite,
  onRename,
  onClearCanvas,
  onExport,
  onFitToScreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onTogglePresentation,
  onToggleGrid,
  isPresentationMode = false,
  showGrid = true,
  zoomLevel = 100,
}) => {
  // Get board data from context
  const { boardMetadata } = useBoardContext();
  
  const boardName = boardMetadata?.name || "Untitled Board";
  const boardOwner = boardMetadata?.owner?.name || "Owner";
  const createdAt = boardMetadata?.createdAt;
  const updatedAt = boardMetadata?.updatedAt;
  const pendingInvitations = boardMetadata?.pendingInvitations || 0;
  
  // Place current user first, then others - with safety check
  const users = currentUser ? [currentUser, ...onlineUsers.filter(u => u.id !== currentUser.id)] : onlineUsers;
  const totalUsers = users.length;
  const extraUserCount = Math.max(0, totalUsers - 4);

  // State for animations and interactions
  const [isExporting, setIsExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Enhanced export action with loading state
  const handleExport = async () => {
    if (!onExport) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  // Enhanced clear action with confirmation
  const handleClearCanvas = () => {
    if (showClearConfirm) {
      onClearCanvas?.();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 z-50 shadow-lg">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        
        {/* Left Section: Brand + Board Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Brand Logo with enhanced styling */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Palette className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CyperBoard
            </span>
          </Link>

          {/* Board Info with enhanced styling */}
          <div className="min-w-0 flex-1">
            <button 
              onClick={onRename} 
              className="flex items-center gap-2 group text-left hover:bg-slate-50 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm"
            >
              <span className="text-lg font-bold text-slate-800 truncate max-w-xs">
                {boardName || "Untitled Board"}
              </span>
              <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-500 shrink-0" />
            </button>
            <div className="flex items-center gap-4 text-xs text-slate-500 px-3">
              {boardOwner && (
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span className="font-medium">{boardOwner}</span>
                </div>
              )}
              {createdAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Created {formatRelativeTime(createdAt)}</span>
                </div>
              )}
              {updatedAt && updatedAt !== createdAt && (
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 text-blue-500" />
                  <span>Updated {formatRelativeTime(updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Enhanced Navigation Controls */}
        <div className="flex items-center gap-2 mx-4">
          {/* Zoom Controls with enhanced styling */}
          <div className="flex items-center gap-1 bg-slate-50/80 rounded-xl p-1.5 border border-slate-200/60 shadow-sm backdrop-blur-sm">
            <QuickActionButton
              icon={ZoomOut}
              onClick={onZoomOut}
              label="Zoom Out"
              variant="default"
              size="sm"
            />
            
            <button 
              onClick={onResetZoom}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 min-w-[3.5rem] border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
              {Math.round(zoomLevel)}%
            </button>
            
            <QuickActionButton
              icon={ZoomIn}
              onClick={onZoomIn}
              label="Zoom In"
              variant="default"
              size="sm"
            />
          </div>

          {/* View Controls with enhanced styling */}
          <div className="flex items-center gap-1">
            <QuickActionButton
              icon={Expand}
              onClick={onFitToScreen}
              label="Fit to Screen"
              variant="default"
              size="sm"
            />

            {/* Grid Toggle */}
            {onToggleGrid && (
              <QuickActionButton
                icon={showGrid ? Eye : EyeOff}
                onClick={onToggleGrid}
                label={showGrid ? "Hide Grid" : "Show Grid"}
                variant={showGrid ? "primary" : "default"}
                size="sm"
              />
            )}

            {/* Presentation Mode Toggle */}
            <QuickActionButton
              icon={isPresentationMode ? MonitorSpeaker : Monitor}
              onClick={onTogglePresentation}
              label={isPresentationMode ? "Exit Presentation" : "Presentation Mode"}
              variant={isPresentationMode ? "danger" : "default"}
              size="sm"
            />
          </div>

          {/* Canvas Actions */}
          <div className="flex items-center gap-1 bg-slate-50/80 rounded-xl p-1.5 border border-slate-200/60 shadow-sm backdrop-blur-sm">
            {/* Export Button */}
            {onExport && (
              <QuickActionButton
                icon={isExporting ? RefreshCw : Download}
                onClick={handleExport}
                label={isExporting ? "Exporting..." : "Export Canvas"}
                variant="default"
                size="sm"
                disabled={isExporting}
                className={isExporting ? "animate-spin" : ""}
              />
            )}

            {/* Clear Canvas Button with confirmation */}
            {onClearCanvas && (
              <QuickActionButton
                icon={Trash2}
                onClick={handleClearCanvas}
                label={showClearConfirm ? "Click again to confirm" : "Clear Canvas"}
                variant={showClearConfirm ? "danger" : "default"}
                size="sm"
                className={showClearConfirm ? "animate-pulse bg-red-50 text-red-600 border-red-200" : ""}
              />
            )}
          </div>
        </div>

        {/* Right Section: Enhanced Collaboration + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Collaboration Panel with enhanced styling */}
          <div className="flex items-center gap-2">
            {/* User Avatars with enhanced hover effects */}
            <div className="flex -space-x-2">
              {users.slice(0, 4).map((user, index) => (
                <div key={user.id} className="relative group">
                  <Image
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-all duration-200 cursor-pointer hover:shadow-lg"
                    style={{ zIndex: 10 - index }}
                    onClick={onOpenCollaboration}
                  />
                  {/* Online status indicator */}
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                  )}
                  {/* Current user indicator */}
                  {user.id === currentUser?.id && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm">
                      <Sparkles className="w-2 h-2 text-white absolute top-0 left-0" />
                    </div>
                  )}
                  
                  {/* Enhanced Tooltip */}
                  <div 
                    className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700"
                    style={{ zIndex: 99999 }}
                  >
                    {user.id === currentUser?.id ? `${user.name} (You)` : user.name}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-700"></div>
                  </div>
                </div>
              ))}
              
              {extraUserCount > 0 && (
                <div 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white shadow-md flex items-center justify-center text-xs font-bold text-slate-700 cursor-pointer hover:bg-gradient-to-br hover:from-slate-200 hover:to-slate-300 transition-all duration-200 hover:scale-110"
                  onClick={onOpenCollaboration}
                >
                  +{extraUserCount}
                </div>
              )}
            </div>

            {/* Collaboration Status with enhanced styling */}
            <button
              onClick={onOpenCollaboration}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 rounded-lg transition-all duration-200 text-sm font-semibold border border-green-200/60 hover:border-green-300/80 shadow-sm hover:shadow-md"
            >
              <Users className="w-4 h-4" />
              <span>{totalUsers}</span>
              <span className="text-xs opacity-75">online</span>
            </button>
          </div>

          {/* Action Buttons with enhanced styling */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <QuickActionButton
                icon={UserPlus2}
                onClick={onInvite}
                label="Invite Collaborators"
                variant="primary"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              />
              {pendingInvitations > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {pendingInvitations > 9 ? '9+' : pendingInvitations}
                </div>
              )}
            </div>
            
            <QuickActionButton
              icon={Share2}
              onClick={onShare}
              label="Share Board"
              variant="default"
              size="sm"
              className="hover:bg-slate-50 hover:shadow-md"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CanvasHeader; 