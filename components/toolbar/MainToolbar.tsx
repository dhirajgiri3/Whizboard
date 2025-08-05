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
  Shapes,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export type Tool = "pen" | "eraser" | "select" | "sticky-note" | "frame" | "highlighter" | "text" | "shapes" | "ai";

interface MainToolbarProps {
  tool: Tool;
  setToolAction: (tool: Tool) => void;
  undoAction: () => void;
  redoAction: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onExportAction?: () => void;
  onClearCanvasAction?: () => void;
  onAIAction?: () => void;
  vertical?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
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
  isMobile = false,
  isTablet = false,
}: MainToolbarProps) {
  const [shareSuccess, setShareSuccess] = useState(false);

  // Responsive sizing - more compact
  const buttonSize = isMobile ? 36 : isTablet ? 40 : 44;
  const iconSize = isMobile ? 16 : isTablet ? 18 : 20;
  const padding = isMobile ? 6 : isTablet ? 8 : 10;
  const gap = isMobile ? 4 : 6;

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
        case 's':
          if (e.shiftKey) {
            setToolAction('shapes');
          }
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
            onExportAction?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [setToolAction, undoAction, redoAction, onExportAction]);

  // AI Tool Button component - with "Coming Soon" indicator
  const AIToolButton = ({
    isActive = false, 
    onClick,
    label,
  }: {
    isActive?: boolean;
    onClick: () => void;
    label: string;
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        style={{ width: buttonSize, height: buttonSize }}
        className={cn(
          "relative rounded-xl transition-all duration-200 font-medium",
          "border-2 overflow-hidden group/btn",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2",
          "hover:scale-105 active:scale-95",
          isActive
            ? "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 text-white border-transparent shadow-lg shadow-violet-500/25"
            : "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 text-violet-700 border-violet-200/50 hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/20",
          !isActive && "hover:bg-gradient-to-br hover:from-violet-100 hover:via-purple-100 hover:to-indigo-100"
        )}
        title={label}
        aria-label={label}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
        
        {/* Main content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <Brain 
            size={iconSize} 
            className="transition-all duration-300 group-hover/btn:scale-110" 
          />
        </div>
        
        {/* Coming Soon badge */}
        <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5 rounded-full font-bold shadow-sm">
          <Clock size={8} />
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute top-1 right-1 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
          <Sparkles size={6} className="text-yellow-400" />
        </div>
      </button>
      
      {/* Enhanced tooltip */}
      <div
        className={cn(
          "absolute z-[9999] px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl",
          "opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none",
          "whitespace-nowrap font-medium border border-gray-700",
          vertical 
            ? "left-full ml-3 top-1/2 -translate-y-1/2" 
            : "bottom-full mb-3 left-1/2 -translate-x-1/2"
        )}
      >
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-violet-400" />
          <span>{label}</span>
          <span className="text-amber-400 text-xs">Coming Soon</span>
        </div>
        {/* Tooltip arrow */}
        <div
          className={cn(
            "absolute w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-gray-700",
            vertical 
              ? "-left-1 top-1/2 -translate-y-1/2" 
              : "top-full left-1/2 -translate-x-1/2 -translate-y-1"
          )}
        />
      </div>
    </div>
  );

  // Tool Button component
  const ToolButton = ({
    icon: Icon,
    isActive = false,
    onClick,
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
    variant?: "default" | "danger";
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ width: buttonSize, height: buttonSize }}
        className={cn(
          "relative rounded-xl transition-all duration-200 font-medium",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
          "hover:scale-105 active:scale-95",
          isActive
            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
            : variant === "danger"
              ? "text-red-600 hover:bg-red-50 hover:text-red-700 hover:shadow-md hover:shadow-red-500/20"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md",
          disabled && "opacity-40 cursor-not-allowed hover:scale-100",
          className
        )}
        title={label}
        aria-label={label}
      >
        <div className="flex items-center justify-center h-full">
          <Icon 
            size={iconSize} 
            className={cn(
              "transition-all duration-200",
              !disabled && "group-hover:scale-110"
            )} 
          />
        </div>
      </button>
      
      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[9999] px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none",
          "whitespace-nowrap font-medium",
          vertical 
            ? "left-full ml-2 top-1/2 -translate-y-1/2" 
            : "bottom-full mb-2 left-1/2 -translate-x-1/2"
        )}
      >
        {label}
        {/* Tooltip arrow */}
        <div
          className={cn(
            "absolute w-1.5 h-1.5 bg-gray-900 rotate-45",
            vertical 
              ? "-left-0.5 top-1/2 -translate-y-1/2" 
              : "top-full left-1/2 -translate-x-1/2 -translate-y-0.5"
          )}
        />
      </div>
    </div>
  );

  // Divider component
  const Divider = () => (
    <div
      className={cn(
        "bg-gray-200/60",
        vertical ? "w-px h-4" : "h-4 w-px"
      )}
    />
  );

  // Tool group wrapper
  const ToolGroup = ({ children }: { children: React.ReactNode }) => (
    <div 
      className={cn(
        "flex",
        vertical ? "flex-col" : "flex-row items-center",
      )}
      style={{ gap: gap }}
    >
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        // Base styling - modern glassmorphism
        "bg-white/80 backdrop-blur-xl shadow-xl border border-white/20 rounded-2xl",
        "transition-all duration-300 relative select-none",
        "ring-1 ring-gray-900/5",
        "z-40",
        // Layout variants with compact spacing
        vertical 
          ? "flex flex-col" 
          : "flex flex-row items-center",
        // Responsive padding
        isMobile ? "p-3" : "p-4"
      )}
      style={{ 
        zIndex: 40,
        gap: gap * 1.5, // Slightly larger gap between tool groups
      }}
    >
      {vertical ? (
        // Vertical Layout - Compact and organized
        <>
          {/* AI Tool - Highlighted section */}
          <div className="relative">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
            {/* Gradient separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent mt-3" />
          </div>

          {/* Primary tools */}
          <ToolGroup>
            <ToolButton
              icon={MousePointer2}
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              label="Select (V)"
            />
            <ToolButton
              icon={PenTool}
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              label="Pen (P)"
            />
            <ToolButton
              icon={Highlighter}
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              label="Highlighter (H)"
            />
            <ToolButton
              icon={Eraser}
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              label="Eraser (E)"
            />
          </ToolGroup>

          <Divider />

          {/* Creative tools */}
          <ToolGroup>
            <ToolButton
              icon={StickyNote}
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              label="Sticky Notes (N)"
            />
            <ToolButton
              icon={Frame}
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              label="Frames (F)"
            />
            <ToolButton
              icon={Type}
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              label="Text (T)"
            />
            <ToolButton
              icon={Shapes}
              isActive={tool === "shapes"}
              onClick={() => setToolAction("shapes")}
              label="Shapes (Shift+S)"
            />
          </ToolGroup>

          <Divider />

          {/* Action tools */}
          <ToolGroup>
            <ToolButton
              icon={Undo2}
              onClick={undoAction}
              disabled={!canUndo}
              label="Undo (Ctrl+Z)"
            />
            <ToolButton
              icon={Redo2}
              onClick={redoAction}
              disabled={!canRedo}
              label="Redo (Ctrl+Y)"
            />
            {onExportAction && (
              <ToolButton
                icon={Download}
                onClick={onExportAction}
                label="Export (Ctrl+S)"
              />
            )}
            {onClearCanvasAction && (
              <ToolButton
                icon={Trash2}
                onClick={onClearCanvasAction}
                label="Clear Canvas"
                variant="danger"
              />
            )}
          </ToolGroup>
        </>
      ) : (
        // Horizontal Layout - Streamlined
        <>
          {/* AI Tool - Highlighted */}
          <div className="relative">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
          </div>

          <Divider />

          {/* Primary tools */}
          <ToolGroup>
            <ToolButton
              icon={MousePointer2}
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              label="Select (V)"
            />
            <ToolButton
              icon={PenTool}
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              label="Pen (P)"
            />
            <ToolButton
              icon={Highlighter}
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              label="Highlighter (H)"
            />
            <ToolButton
              icon={Eraser}
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              label="Eraser (E)"
            />
          </ToolGroup>

          <Divider />

          {/* Creative tools */}
          <ToolGroup>
            <ToolButton
              icon={StickyNote}
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              label="Sticky Notes (N)"
            />
            <ToolButton
              icon={Frame}
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              label="Frames (F)"
            />
            <ToolButton
              icon={Type}
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              label="Text (T)"
            />
            <ToolButton
              icon={Shapes}
              isActive={tool === "shapes"}
              onClick={() => setToolAction("shapes")}
              label="Shapes (Shift+S)"
            />
          </ToolGroup>

          <Divider />

          {/* Action tools */}
          <ToolGroup>
            <ToolButton
              icon={Undo2}
              onClick={undoAction}
              disabled={!canUndo}
              label="Undo (Ctrl+Z)"
            />
            <ToolButton
              icon={Redo2}
              onClick={redoAction}
              disabled={!canRedo}
              label="Redo (Ctrl+Y)"
            />
            {onExportAction && (
              <ToolButton
                icon={Download}
                onClick={onExportAction}
                label="Export (Ctrl+S)"
              />
            )}
            {onClearCanvasAction && !isMobile && (
              <ToolButton
                icon={Trash2}
                onClick={onClearCanvasAction}
                label="Clear Canvas"
                variant="danger"
              />
            )}
          </ToolGroup>
        </>
      )}
    </div>
  );
}