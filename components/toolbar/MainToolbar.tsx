"use client";

import { useState, useEffect } from "react";
import {
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  Download,
  Share2,
  Check,
  PenTool,
  Trash2,
  StickyNote,
  Frame,
  Highlighter,
  Type,
  Brain,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export type Tool = "pen" | "eraser" | "select" | "sticky-note" | "frame" | "highlighter" | "text" | "ai";

interface MainToolbarProps {
  tool: Tool;
  setToolAction: (tool: Tool) => void;
  undoAction: () => void;
  redoAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportAction: () => void;
  onClearCanvasAction?: () => void;
  onAIAction?: () => void;
  vertical?: boolean;
  compact?: boolean;
}

export default function MainToolbar({
  tool = "select",
  setToolAction,
  undoAction,
  redoAction,
  canUndo = true,
  canRedo = false,
  onExportAction,
  onClearCanvasAction,
  onAIAction,
  vertical = false,
}: MainToolbarProps) {
  const [shareSuccess, setShareSuccess] = useState(false);

  // Handle share action
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'v':
          setToolAction('select');
          break;
        case 'e':
          setToolAction('eraser');
          break;
        case 'p':
          setToolAction('pen');
          break;
        case 'h':
          setToolAction('highlighter');
          break;
        case 'n':
          setToolAction('sticky-note');
          break;
        case 'f':
          setToolAction('frame');
          break;
        case 't':
          setToolAction('text');
          break;
        case 'a':
          setToolAction('ai');
          break;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redoAction();
            } else {
              undoAction();
            }
            break;
          case 'y':
            e.preventDefault();
            redoAction();
            break;
          case 's':
            e.preventDefault();
            onExportAction();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [setToolAction, undoAction, redoAction, onExportAction]);

  // Special AI Tool button component with enhanced styling
  const AIToolButton = ({
    isActive,
    onClick,
    label,
    disabled = false,
  }: {
    isActive?: boolean;
    onClick: () => void;
    label: string;
    disabled?: boolean;
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "relative transition-all duration-300 ease-out",
          "flex items-center justify-center rounded-2xl",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2",
          "w-12 h-12 overflow-hidden",
          "transform active:scale-95",
          isActive
            ? "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white shadow-2xl shadow-purple-500/30"
            : disabled
            ? "text-gray-400 cursor-not-allowed bg-transparent"
            : "bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 text-purple-600 hover:from-purple-500/20 hover:via-violet-500/20 hover:to-indigo-500/20 hover:text-purple-700 border-2 border-purple-200/50 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/20",
          "group-hover:scale-105"
        )}
      >
        {/* Animated background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 opacity-0 transition-opacity duration-300",
          isActive ? "opacity-100" : "group-hover:opacity-10"
        )} />
        
        {/* Sparkle effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={cn(
            "absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 transition-all duration-300",
            isActive ? "opacity-100 animate-pulse" : "group-hover:opacity-60"
          )}>
            <Sparkles size={12} className="text-white" />
          </div>
        </div>
        
        {/* Main icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain size={20} className="transition-all duration-300 group-hover:scale-110" />
        </div>
        
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-300",
          isActive ? "opacity-30" : "group-hover:opacity-20"
        )} />
      </button>
      
      {/* Enhanced tooltip */}
      <div
        className={cn(
          "absolute z-[9999] px-3 py-2 bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900 text-white text-sm rounded-lg shadow-2xl",
          "opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none",
          "whitespace-nowrap font-medium border border-purple-700/50",
          // Dynamic positioning based on layout
          vertical 
            ? "left-full ml-3 top-1/2 -translate-y-1/2" 
            : "bottom-full mb-3 left-1/2 -translate-x-1/2",
          // Prevent tooltip from going off-screen
          "max-w-xs"
        )}
        style={{ zIndex: 9999 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-yellow-400" />
          <span>{label}</span>
        </div>
        {/* Tooltip arrow */}
        <div
          className={cn(
            "absolute w-2 h-2 bg-gradient-to-r from-purple-900 via-violet-900 to-indigo-900 rotate-45 border-l border-b border-purple-700/50",
            vertical 
              ? "-left-1 top-1/2 -translate-y-1/2" 
              : "top-full left-1/2 -translate-x-1/2 -translate-y-1"
          )}
        />
      </div>
    </div>
  );

  // Enhanced Tool button component with modern styling
  const ToolButton = ({
    isActive,
    onClick,
    icon: Icon,
    label,
    disabled = false,
    className = "",
    variant = "default",
  }: {
    isActive?: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    disabled?: boolean;
    className?: string;
    variant?: "default" | "primary" | "secondary" | "danger";
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return {
            active: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30",
            inactive: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:text-blue-700 border border-blue-200/50 hover:border-blue-300/70 hover:shadow-lg hover:shadow-blue-500/20",
          };
        case "secondary":
          return {
            active: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/30",
            inactive: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 hover:from-emerald-100 hover:to-teal-100 hover:text-emerald-700 border border-emerald-200/50 hover:border-emerald-300/70 hover:shadow-lg hover:shadow-emerald-500/20",
          };
        case "danger":
          return {
            active: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-500/30",
            inactive: "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 hover:text-red-700 border border-red-200/50 hover:border-red-300/70 hover:shadow-lg hover:shadow-red-500/20",
          };
        default:
          return {
            active: "bg-gradient-to-r from-slate-700 to-gray-700 text-white shadow-xl shadow-slate-500/30",
            inactive: "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-700 border border-slate-200/60 hover:border-slate-300/70 hover:shadow-lg hover:shadow-slate-500/10",
          };
      }
    };

    const variantStyles = getVariantStyles();

    return (
      <div className="relative group">
        <button
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={cn(
            "relative transition-all duration-300 ease-out",
            "flex items-center justify-center rounded-xl",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
            "w-11 h-11",
            "transform active:scale-95",
            isActive
              ? variantStyles.active
              : disabled
              ? "text-gray-400 cursor-not-allowed bg-transparent"
              : variantStyles.inactive,
            "group-hover:scale-105",
            className
          )}
        >
          <Icon size={18} className="transition-all duration-300 group-hover:scale-110" />
          
          {/* Subtle glow effect */}
          {isActive && (
            <div className="absolute inset-0 rounded-xl bg-current opacity-20 blur-md" />
          )}
        </button>
        
        {/* Enhanced tooltip */}
        <div
          className={cn(
            "absolute z-[9999] px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-2xl",
            "opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none",
            "whitespace-nowrap font-medium border border-slate-700/50",
            // Dynamic positioning based on layout
            vertical 
              ? "left-full ml-3 top-1/2 -translate-y-1/2" 
              : "bottom-full mb-3 left-1/2 -translate-x-1/2",
            // Prevent tooltip from going off-screen
            "max-w-xs"
          )}
          style={{ zIndex: 9999 }}
        >
          {label}
          {/* Tooltip arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-slate-900/95 rotate-45 border-l border-b border-slate-700/50",
              vertical 
                ? "-left-1 top-1/2 -translate-y-1/2" 
                : "top-full left-1/2 -translate-x-1/2 -translate-y-1"
            )}
          />
        </div>
      </div>
    );
  };

  // Enhanced Divider component
  const Divider = ({ vertical: isVertical = false, gradient = false }: { vertical?: boolean; gradient?: boolean }) => (
    <div
      className={cn(
        gradient 
          ? isVertical 
            ? "bg-gradient-to-b from-transparent via-slate-300/60 to-transparent"
            : "bg-gradient-to-r from-transparent via-slate-300/60 to-transparent"
          : "bg-slate-200/60",
        isVertical ? "w-px h-8" : "h-px w-12"
      )}
    />
  );

  // Tool Group component for better organization
  const ToolGroup = ({ 
    children, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode; 
    className?: string;
    variant?: "default" | "primary" | "secondary";
  }) => {
    const getGroupStyles = () => {
      switch (variant) {
        case "primary":
          return "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/40";
        case "secondary":
          return "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/40";
        default:
          return "bg-slate-50/80 border border-slate-200/40";
      }
    };

    return (
      <div className={cn(
        "flex items-center justify-center gap-1 rounded-xl p-2 backdrop-blur-sm",
        getGroupStyles(),
        vertical ? "flex-col w-full" : "flex-row",
        className
      )}>
        {children}
      </div>
    );
  };

  return (
    <div
      className={cn(
        // Base styling - enhanced with modern glassmorphism
        "bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl",
        "transition-all duration-300 relative select-none",
        // Enhanced shadows and depth
        "shadow-slate-200/50 hover:shadow-slate-300/60",
        // Fixed z-index to ensure proper layering
        "z-40",
        // Layout variants with improved spacing and proper width
        vertical 
          ? "flex flex-col gap-3 w-16" 
          : "flex flex-row items-center p-3 gap-2"
      )}
      style={{ zIndex: 40 }}
    >
      {vertical ? (
        // Vertical Layout - Enhanced with better grouping and alignment
        <>
          {/* AI Tool - Primary Focus */}
          <div className="flex flex-col items-center gap-3 mb-3 w-full">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
            {/* Enhanced separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300/60 to-transparent" />
          </div>

          {/* Primary Tools Group */}
          <ToolGroup variant="primary" className="mb-3">
            <ToolButton
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              icon={MousePointer2}
              label="Select (V)"
              variant="primary"
            />
            <ToolButton
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              icon={PenTool}
              label="Pen (P)"
              variant="primary"
            />
            <ToolButton
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              icon={Highlighter}
              label="Highlighter (H)"
              variant="primary"
            />
          </ToolGroup>

          {/* Content Tools Group */}
          <ToolGroup variant="secondary" className="mb-3">
            <ToolButton
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              icon={StickyNote}
              label="Sticky Note (N)"
              variant="secondary"
            />
            <ToolButton
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              icon={Frame}
              label="Frame (F)"
              variant="secondary"
            />
            <ToolButton
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              icon={Type}
              label="Text (T)"
              variant="secondary"
            />
          </ToolGroup>

          {/* Utility Tools */}
          <ToolGroup className="mb-3">
            <ToolButton
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              icon={Eraser}
              label="Eraser (E)"
              variant="danger"
            />
          </ToolGroup>

          {/* Enhanced divider */}
          <div className="flex justify-center my-3 w-full">
            <Divider gradient />
          </div>

          {/* History section */}
          <ToolGroup className="mb-3">
            <ToolButton
              onClick={undoAction}
              disabled={!canUndo}
              icon={Undo2}
              label="Undo (⌘Z)"
            />
            <ToolButton
              onClick={redoAction}
              disabled={!canRedo}
              icon={Redo2}
              label="Redo (⌘Y)"
            />
          </ToolGroup>

          {/* Enhanced divider */}
          <div className="flex justify-center my-3 w-full">
            <Divider gradient />
          </div>

          {/* Actions section */}
          <ToolGroup>
            <ToolButton
              onClick={onExportAction}
              icon={Download}
              label="Export (⌘S)"
            />
            {onClearCanvasAction && (
              <ToolButton
                onClick={onClearCanvasAction}
                icon={Trash2}
                label="Clear Canvas (Can be undone)"
                variant="danger"
              />
            )}
            <ToolButton
              onClick={handleShare}
              icon={shareSuccess ? Check : Share2}
              label={shareSuccess ? "Copied!" : "Share"}
              className={shareSuccess ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl shadow-green-500/30" : ""}
            />
          </ToolGroup>
        </>
      ) : (
        // Horizontal Layout - Enhanced with better grouping and alignment
        <>
          {/* AI Tool - Primary Focus */}
          <div className="flex items-center gap-3 mr-3">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
            {/* Enhanced separator */}
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-purple-300/60 to-transparent" />
          </div>

          {/* Primary Tools group */}
          <ToolGroup variant="primary" className="mr-2">
            <ToolButton
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              icon={MousePointer2}
              label="Select (V)"
              variant="primary"
            />
            <ToolButton
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              icon={PenTool}
              label="Pen (P)"
              variant="primary"
            />
            <ToolButton
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              icon={Highlighter}
              label="Highlighter (H)"
              variant="primary"
            />
          </ToolGroup>

          <Divider vertical gradient />

          {/* Content Tools group */}
          <ToolGroup variant="secondary" className="mx-2">
            <ToolButton
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              icon={StickyNote}
              label="Sticky Note (N)"
              variant="secondary"
            />
            <ToolButton
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              icon={Frame}
              label="Frame (F)"
              variant="secondary"
            />
            <ToolButton
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              icon={Type}
              label="Text (T)"
              variant="secondary"
            />
          </ToolGroup>

          <Divider vertical gradient />

          {/* Utility Tools */}
          <ToolGroup className="mx-2">
            <ToolButton
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              icon={Eraser}
              label="Eraser (E)"
              variant="danger"
            />
          </ToolGroup>

          <Divider vertical gradient />

          {/* History group */}
          <ToolGroup className="mx-2">
            <ToolButton
              onClick={undoAction}
              disabled={!canUndo}
              icon={Undo2}
              label="Undo (⌘Z)"
            />
            <ToolButton
              onClick={redoAction}
              disabled={!canRedo}
              icon={Redo2}
              label="Redo (⌘Y)"
            />
          </ToolGroup>

          <Divider vertical gradient />

          {/* Actions group */}
          <ToolGroup className="ml-2">
            <ToolButton
              onClick={onExportAction}
              icon={Download}
              label="Export (⌘S)"
            />
            {onClearCanvasAction && (
              <ToolButton
                onClick={onClearCanvasAction}
                icon={Trash2}
                label="Clear Canvas (Can be undone)"
                variant="danger"
              />
            )}
            <ToolButton
              onClick={handleShare}
              icon={shareSuccess ? Check : Share2}
              label={shareSuccess ? "Copied!" : "Share"}
              className={shareSuccess ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl shadow-green-500/30" : ""}
            />
          </ToolGroup>
        </>
      )}
    </div>
  );
}