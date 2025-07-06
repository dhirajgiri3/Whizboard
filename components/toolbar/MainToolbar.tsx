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
          "flex items-center justify-center rounded-xl",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2",
          "w-10 h-10 overflow-hidden",
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
            "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 transition-all duration-300",
            isActive ? "opacity-100 animate-pulse" : "group-hover:opacity-60"
          )}>
            <Sparkles size={10} className="text-white" />
          </div>
        </div>
        
        {/* Main icon */}
        <div className="relative z-10 flex items-center justify-center">
          <Brain size={18} className="transition-all duration-300 group-hover:scale-110" />
        </div>
        
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-300",
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

  // Enhanced Tool button component with fixed tooltip z-index
  const ToolButton = ({
    isActive,
    onClick,
    icon: Icon,
    label,
    disabled = false,
    className = "",
  }: {
    isActive?: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    disabled?: boolean;
    className?: string;
  }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "relative transition-all duration-200 ease-out",
          "flex items-center justify-center rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
          "w-10 h-10",
          "transform active:scale-95",
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
            : disabled
            ? "text-gray-400 cursor-not-allowed bg-transparent"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 bg-transparent",
          className
        )}
      >
        <Icon size={18} className="transition-transform duration-200" />
      </button>
      
      {/* Fixed tooltip with proper z-index */}
      <div
        className={cn(
          "absolute z-[9999] px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg",
          "opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none",
          "whitespace-nowrap font-medium",
          // Dynamic positioning based on layout
          vertical 
            ? "left-full ml-2 top-1/2 -translate-y-1/2" 
            : "bottom-full mb-2 left-1/2 -translate-x-1/2",
          // Prevent tooltip from going off-screen
          "max-w-xs"
        )}
        style={{ zIndex: 9999 }}
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
  const Divider = ({ vertical: isVertical = false }: { vertical?: boolean }) => (
    <div
      className={cn(
        "bg-gray-200",
        isVertical ? "w-px h-6" : "h-px w-6"
      )}
    />
  );

  return (
    <div
      className={cn(
        // Base styling - clean and minimal
        "bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/60 rounded-xl",
        "transition-all duration-200 relative select-none",
        // Fixed z-index to ensure proper layering
        "z-40",
        // Layout variants
        vertical 
          ? "flex flex-col p-2 gap-1 w-14" 
          : "flex flex-row items-center p-2 gap-1"
      )}
      style={{ zIndex: 40 }}
    >
      {vertical ? (
        // Vertical Layout - Minimalistic
        <>
          {/* AI Tool - Primary Focus */}
          <div className="flex flex-col gap-2 mb-2">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
            {/* Subtle separator */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
          </div>

          {/* Tools section */}
          <div className="flex flex-col gap-1">
            <ToolButton
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              icon={MousePointer2}
              label="Select (V)"
            />
            <ToolButton
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              icon={PenTool}
              label="Pen (P)"
            />
            <ToolButton
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              icon={Highlighter}
              label="Highlighter (H)"
            />
            <ToolButton
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              icon={StickyNote}
              label="Sticky Note (N)"
            />
            <ToolButton
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              icon={Frame}
              label="Frame (F)"
            />
            <ToolButton
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              icon={Type}
              label="Text (T)"
            />
            <ToolButton
              isActive={tool === "shapes"}
              onClick={() => setToolAction("shapes")}
              icon={Shapes}
              label="Shapes (Shift+S)"
            />
            <ToolButton
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              icon={Eraser}
              label="Eraser (E)"
            />
          </div>

          {/* Subtle divider */}
          <div className="flex justify-center my-1">
            <Divider />
          </div>

          {/* History section */}
          <div className="flex flex-col gap-1">
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
          </div>

          {/* Subtle divider */}
          <div className="flex justify-center my-1">
            <Divider />
          </div>

          {/* Actions section */}
          <div className="flex flex-col gap-1">
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
                className="hover:bg-red-100 hover:text-red-600"
              />
            )}
            <ToolButton
              onClick={handleShare}
              icon={shareSuccess ? Check : Share2}
              label={shareSuccess ? "Copied!" : "Share"}
              className={shareSuccess ? "bg-green-600 text-white shadow-lg shadow-green-600/25" : ""}
            />
          </div>
        </>
      ) : (
        // Horizontal Layout - Clean and organized
        <>
          {/* AI Tool - Primary Focus */}
          <div className="flex items-center gap-2 mr-2">
            <AIToolButton
              isActive={tool === "ai"}
              onClick={() => {
                setToolAction("ai");
                onAIAction?.();
              }}
              label="AI Assistant (A)"
            />
            {/* Subtle separator */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-200 to-transparent" />
          </div>

          {/* Tools group */}
          <div className="flex items-center gap-1 bg-gray-50/60 rounded-lg p-1">
            <ToolButton
              isActive={tool === "select"}
              onClick={() => setToolAction("select")}
              icon={MousePointer2}
              label="Select (V)"
            />
            <ToolButton
              isActive={tool === "pen"}
              onClick={() => setToolAction("pen")}
              icon={PenTool}
              label="Pen (P)"
            />
            <ToolButton
              isActive={tool === "highlighter"}
              onClick={() => setToolAction("highlighter")}
              icon={Highlighter}
              label="Highlighter (H)"
            />
            <ToolButton
              isActive={tool === "sticky-note"}
              onClick={() => setToolAction("sticky-note")}
              icon={StickyNote}
              label="Sticky Note (N)"
            />
            <ToolButton
              isActive={tool === "frame"}
              onClick={() => setToolAction("frame")}
              icon={Frame}
              label="Frame (F)"
            />
            <ToolButton
              isActive={tool === "text"}
              onClick={() => setToolAction("text")}
              icon={Type}
              label="Text (T)"
            />
            <ToolButton
              isActive={tool === "shapes"}
              onClick={() => setToolAction("shapes")}
              icon={Shapes}
              label="Shapes (Shift+S)"
            />
            <ToolButton
              isActive={tool === "eraser"}
              onClick={() => setToolAction("eraser")}
              icon={Eraser}
              label="Eraser (E)"
            />
          </div>

          <Divider vertical />

          {/* History group */}
          <div className="flex items-center gap-1">
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
          </div>

          <Divider vertical />

          {/* Actions group */}
          <div className="flex items-center gap-1">
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
                className="hover:bg-red-100 hover:text-red-600"
              />
            )}
            <ToolButton
              onClick={handleShare}
              icon={shareSuccess ? Check : Share2}
              label={shareSuccess ? "Copied!" : "Share"}
              className={shareSuccess ? "bg-green-600 text-white shadow-lg shadow-green-600/25" : ""}
            />
          </div>
        </>
      )}
    </div>
  );
}