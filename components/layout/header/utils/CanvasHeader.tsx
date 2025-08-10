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
  ChevronDown,
} from "lucide-react";
import QuickActionButton from "@/components/ui/button/QuickActionButton";
import {
  useBoardContext,
  formatRelativeTime,
} from "@/lib/context/BoardContext";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/ui/header/Dropdown";
import logo from "@/public/images/logos/whizboard_logo.png";

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
  // Responsive flags
  isMobile?: boolean;
  isTablet?: boolean;
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
  isMobile,
  isTablet,
}) => {
  const { boardMetadata } = useBoardContext();

  const boardName = boardMetadata?.name || "Untitled Board";
  const boardOwner = boardMetadata?.owner?.name || "Owner";
  const createdAt = boardMetadata?.createdAt;
  const updatedAt = boardMetadata?.updatedAt;
  const pendingInvitations = boardMetadata?.pendingInvitations || 0;

  const users = currentUser
    ? [currentUser, ...onlineUsers.filter((u) => u.id !== currentUser.id)]
    : onlineUsers;
  const totalUsers = users.length;
  const extraUserCount = Math.max(0, totalUsers - 4);

  const [isExporting, setIsExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = async () => {
    if (!onExport) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCanvas = () => {
    if (showClearConfirm) {
      onClearCanvas?.();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const isSmallScreen = isMobile || isTablet;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 z-50 shadow-sm">
      <div className="h-full flex items-center justify-between px-2 md:px-4">
        {/* Left Section: Brand + Board Info/Actions */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/my-boards"
            className="flex items-center gap-2 shrink-0 group"
          >
            <Image src={logo} alt="WhizBoard Logo" width={100} />
          </Link>
          <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>
          <Dropdown>
            <DropdownTrigger>
              <div className="flex items-center gap-2 group text-left hover:bg-slate-100 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                <span className="text-base font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-xs">
                  {boardName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-slate-700 transition-colors" />
              </div>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem onClick={onRename}>
                <Edit3 className="w-4 h-4 mr-2" /> Rename Board
              </DropdownItem>
              {onExport && (
                <DropdownItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" /> Export as PNG
                </DropdownItem>
              )}
              {onClearCanvas && (
                <>
                  <div className="my-1 h-px bg-slate-100"></div>
                  <DropdownItem onClick={onClearCanvas}>
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                    <span className="text-red-500">Clear Canvas</span>
                  </DropdownItem>
                </>
              )}
            </DropdownContent>
          </Dropdown>
        </div>

        {/* Center Section: View Controls */}
        {!isSmallScreen && (
          <div className="flex items-center gap-2">
            <QuickActionButton
              icon={ZoomOut}
              onClick={onZoomOut}
              label="Zoom Out"
            />
            <button
              onClick={onResetZoom}
              className="px-3 h-9 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors min-w-[50px]"
            >
              {Math.round(zoomLevel)}%
            </button>
            <QuickActionButton
              icon={ZoomIn}
              onClick={onZoomIn}
              label="Zoom In"
            />
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <QuickActionButton
              icon={Expand}
              onClick={() => {
                console.log('CanvasHeader fitToScreen button clicked');
                onFitToScreen();
              }}
              label="Fit to Screen"
            />
            {onToggleGrid && (
              <QuickActionButton
                icon={showGrid ? Grid3X3 : EyeOff}
                onClick={onToggleGrid}
                label={showGrid ? "Hide Grid" : "Show Grid"}
              />
            )}
            <QuickActionButton
              icon={isPresentationMode ? MonitorSpeaker : Monitor}
              onClick={() => {
                console.log('CanvasHeader presentation mode button clicked');
                onTogglePresentation();
              }}
              label={
                isPresentationMode ? "Exit Presentation" : "Presentation Mode"
              }
            />
          </div>
        )}

        {/* Right Section: Collaboration */}
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {users.slice(0, 4).map((user) => (
              <div
                key={user.id}
                className="w-9 h-9 rounded-full ring-2 ring-white"
                title={user.name}
              >
                <Image
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                  }
                  alt={user.name}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </div>
            ))}
            {extraUserCount > 0 && (
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs ring-2 ring-white">
                +{extraUserCount}
              </div>
            )}
          </div>
          <QuickActionButton
            icon={UserPlus2}
            onClick={onInvite}
            label="Invite"
          />
          <QuickActionButton icon={Share2} onClick={onShare} label="Share" />
          <div className="hidden sm:inline-flex"></div>
          {isSmallScreen && (
            <Dropdown>
              <DropdownTrigger>
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-600 hover:text-slate-800">
                  <Settings className="w-5 h-5" />
                </button>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem onClick={onZoomIn}>
                  <ZoomIn className="w-4 h-4 mr-2" /> Zoom In
                </DropdownItem>
                <DropdownItem onClick={onZoomOut}>
                  <ZoomOut className="w-4 h-4 mr-2" /> Zoom Out
                </DropdownItem>
                <DropdownItem onClick={onResetZoom}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Reset Zoom
                </DropdownItem>
                <DropdownItem onClick={() => {
                  console.log('CanvasHeader dropdown fitToScreen clicked');
                  onFitToScreen();
                }}>
                  <Expand className="w-4 h-4 mr-2" /> Fit to Screen
                </DropdownItem>
                <div className="my-1 h-px bg-slate-100"></div>
                {onToggleGrid && (
                  <DropdownItem onClick={onToggleGrid}>
                    <Grid3X3 className="w-4 h-4 mr-2" />{" "}
                    {showGrid ? "Hide Grid" : "Show Grid"}
                  </DropdownItem>
                )}
                <DropdownItem onClick={() => {
                  console.log('CanvasHeader dropdown presentation clicked');
                  onTogglePresentation();
                }}>
                  <Monitor className="w-4 h-4 mr-2" /> Presentation
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
};

export default CanvasHeader;
