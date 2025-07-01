import React from "react";
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
  MonitorSpeaker
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
  // Canvas navigation
  onFitToScreen: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  // View options
  onTogglePresentation: () => void;
  isPresentationMode?: boolean;
  zoomLevel?: number;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
  currentUser,
  onlineUsers,
  onShare,
  onOpenCollaboration,
  onInvite,
  onRename,
  onFitToScreen,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onTogglePresentation,
  isPresentationMode = false,
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

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white backdrop-blur-xl border-b border-slate-200/60 z-50 shadow-sm">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        
        {/* Left Section: Brand + Board Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CyperBoard
            </span>
          </Link>

          {/* Board Info */}
          <div className="min-w-0 flex-1">
            <button 
              onClick={onRename} 
              className="flex items-center gap-1.5 group text-left hover:bg-slate-50 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="text-lg font-bold text-slate-800 truncate max-w-xs">
                {boardName || "Untitled Board"}
              </span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-500 shrink-0" />
            </button>
            <div className="flex items-center gap-3 text-xs text-slate-500 px-2">
              {boardOwner && (
                <div className="flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>{boardOwner}</span>
                </div>
              )}
              {createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatRelativeTime(createdAt)}</span>
                </div>
              )}
              {updatedAt && updatedAt !== createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Updated {formatRelativeTime(updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Section: Navigation Controls */}
        <div className="flex items-center gap-1 mx-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
            <QuickActionButton
              icon={ZoomOut}
              onClick={onZoomOut}
              label="Zoom Out"
              variant="default"
              size="sm"
            />
            
            <button 
              onClick={onResetZoom}
              className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors min-w-[3rem]"
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

          {/* View Controls */}
          <QuickActionButton
            icon={Expand}
            onClick={onFitToScreen}
            label="Fit to Screen"
            variant="default"
            size="sm"
          />

          {/* Presentation Mode Toggle */}
          <QuickActionButton
            icon={isPresentationMode ? MonitorSpeaker : Monitor}
            onClick={onTogglePresentation}
            label={isPresentationMode ? "Exit Presentation" : "Presentation Mode"}
            variant={isPresentationMode ? "danger" : "default"}
            size="sm"
          />
        </div>

        {/* Right Section: Collaboration + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Collaboration Panel */}
          <div className="flex items-center gap-2">
            {/* User Avatars */}
            <div className="flex -space-x-1.5">
              {users.slice(0, 4).map((user, index) => (
                <div key={user.id} className="relative group">
                  <Image
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    style={{ zIndex: 10 - index }}
                    onClick={onOpenCollaboration}
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  )}
                  {user.id === currentUser?.id && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white"></div>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {user.id === currentUser?.id ? `${user.name} (You)` : user.name}
                  </div>
                </div>
              ))}
              
              {extraUserCount > 0 && (
                <div 
                  className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={onOpenCollaboration}
                >
                  +{extraUserCount}
                </div>
              )}
            </div>

            {/* Collaboration Status */}
            <button
              onClick={onOpenCollaboration}
              className="flex items-center gap-1.5 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium border border-green-200"
            >
              <Users className="w-3 h-3" />
              <span>{totalUsers}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <QuickActionButton
                icon={UserPlus2}
                onClick={onInvite}
                label="Invite Collaborators"
                variant="primary"
                size="sm"
              />
              {pendingInvitations > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
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
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default CanvasHeader; 