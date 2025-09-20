"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Palette,
  Plus,
  Minus,
  StickyNote,
  Check,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Grip,
  Shuffle,
  Trash2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Sparkles,
} from "lucide-react";
import { getStickyNoteColorPalette } from "../../canvas/stickynote/StickyNote";
import { useFloatingToolbarDrag } from "@/hooks";
import { cn } from "@/lib/utils/utils";
import { toast as sonnerToast } from "sonner";

interface FloatingStickyNoteToolbarProps {
  currentColor: string;
  onColorChangeAction: (color: string) => void;
  onColorPickerOpenAction: (position: { x: number; y: number }) => void;
  isVisible: boolean;
  onDeleteAllNotes?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isCollapsed?: boolean;
}

export default function FloatingStickyNoteToolbar({
  currentColor,
  onColorChangeAction,
  onColorPickerOpenAction,
  isVisible,
  onDeleteAllNotes,
  isMobile,
  isTablet,
  isCollapsed,
}: FloatingStickyNoteToolbarProps) {
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);
  const colors = getStickyNoteColorPalette();

  // Enhanced dragging with our new hook
  const {
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    isHidden,
    isCollapsed: isFloatingToolbarCollapsed,
    isDragging,
    position,
    toolbarStyles,
    eyeButtonStyles,
    handleMouseDown,
    handleEyeMouseDown,
    handleDoubleClick,
    handleClick,
    toggleHidden,
    toggleCollapsed,
    resetPosition,
  } = useFloatingToolbarDrag({
    toolbarId: "stickynote",
    initialPosition: { x: isMobile ? 10 : 24, y: isMobile ? 60 : 80 },
    minWidth: isMobile ? 240 : isTablet ? 280 : 300,
    minHeight: isMobile ? 80 : isTablet ? 90 : 100,
  });

  // Responsive sizing and positioning
  const responsiveClasses = useMemo(() => {
    if (isMobile) {
      return {
        container: "w-full max-w-xs mx-auto",
        toolbar: "min-w-[240px] max-w-[280px]",
        button: "p-2 min-h-[44px] min-w-[44px]",
        icon: "w-4 h-4",
        text: "text-xs",
        spacing: "gap-1",
        grid: "grid-cols-4",
        eyeButton: "w-10 h-10",
        eyeIcon: "w-4 h-4",
      };
    } else if (isTablet) {
      return {
        container: "w-full max-w-sm",
        toolbar: "min-w-[280px] max-w-[320px]",
        button: "p-2.5 min-h-[40px] min-w-[40px]",
        icon: "w-5 h-5",
        text: "text-sm",
        spacing: "gap-2",
        grid: "grid-cols-5",
        eyeButton: "w-12 h-12",
        eyeIcon: "w-5 h-5",
      };
    } else {
      return {
        container: "w-full max-w-md",
        toolbar: "min-w-[300px]",
        button: "p-2.5",
        icon: "w-5 h-5",
        text: "text-sm",
        spacing: "gap-2",
        grid: "grid-cols-6",
        eyeButton: "w-14 h-14",
        eyeIcon: "w-5 h-5",
      };
    }
  }, [isMobile, isTablet]);

  const getBorderColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      "#fef3c7": "#f59e0b",
      "#dcfce7": "#10b981",
      "#dbeafe": "#3b82f6",
      "#fce7f3": "#ec4899",
      "#f3e8ff": "#8b5cf6",
      "#fed7e2": "#f43f5e",
      "#ffedd5": "#ea580c",
      "#f0f9ff": "#0ea5e9",
      "#ecfdf5": "#059669",
      "#fef0ff": "#d946ef",
      "#fef7ed": "#f97316",
      "#f1f5f9": "#64748b",
    };
    return colorMap[bgColor] || "#6b7280";
  };

  // Update custom color when prop changes
  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);

  // Handle color selection
  const handleColorSelect = useCallback(
    (selectedColor: string) => {
      onColorChangeAction(selectedColor);
      setCustomColor(selectedColor);
      setShowMoreColors(false);
      sonnerToast.success(`Sticky note color changed to ${selectedColor}`);
    },
    [onColorChangeAction]
  );

  // Random color selection
  const handleRandomColor = useCallback(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onColorChangeAction(randomColor);
    setCustomColor(randomColor);
    sonnerToast.success(`Random color selected: ${randomColor}`);
  }, [colors, onColorChangeAction]);

  // Custom color handler
  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onColorChangeAction(newColor);
  }, [onColorChangeAction]);

  // Delete all notes
  const handleDeleteAllNotes = useCallback(() => {
    if (onDeleteAllNotes) {
      onDeleteAllNotes();
      sonnerToast.success("All sticky notes deleted");
    }
  }, [onDeleteAllNotes]);

  // Click outside handler for expanded palette
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-sticky-toolbar]")) {
        setShowMoreColors(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        setShowMoreColors(false);
      }

      // Quick color shortcuts (1-9 for first 9 colors)
      if (e.key >= "1" && e.key <= "9" && !e.ctrlKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (colors[index]) {
          handleColorSelect(colors[index]);
        }
      }

      // Random color with 'r' key
      if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
        handleRandomColor();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [isVisible, colors, handleColorSelect, handleRandomColor]);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Eye Button - positioned relative to toolbar */}
      <button
        ref={eyeButtonRef}
        onMouseDown={handleEyeMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            toggleHidden();
          }
        }}
        style={eyeButtonStyles}
        className={cn(
          responsiveClasses.eyeButton,
          "rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/50",
          "flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300",
          "text-gray-600 hover:bg-white group cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95",
          "hover:text-amber-600 hover:border-amber-300",
          isDragging && "cursor-grabbing scale-105",
          isHidden && "animate-pulse"
        )}
        title="Click to show sticky note toolbar • Drag to move"
        aria-label="Show sticky note toolbar"
      >
        <Eye className={responsiveClasses.eyeIcon} />
      </button>

      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        data-sticky-toolbar
        onClick={handleClick}
        style={toolbarStyles}
        className={cn(
          "flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50",
          "transition-all duration-300 ease-out",
          responsiveClasses.toolbar,
          isMobile ? "max-h-[70vh] min-h-[350px]" : isTablet ? "max-h-[80vh] min-h-[400px]" : "max-h-[85vh] min-h-[450px]",
          isDragging && "cursor-grabbing select-none shadow-3xl scale-[1.02]",
          "ring-2 ring-amber-500/20",
          !isDragging && "hover:shadow-3xl hover:scale-[1.01]",
          isHidden && "opacity-0 pointer-events-none scale-95"
        )}
        role="toolbar"
        aria-label="Sticky note tools"
      >
        {/* Header */}
        <div className={cn(
          "flex-shrink-0 border-b border-gray-100/50 rounded-t-3xl",
          "bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm"
        )}>
          <div className="flex items-center justify-between px-6 py-4 group">
            {/* Drag Handle Area */}
            <div
              ref={dragHandleRef}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              className={cn(
                "flex items-center gap-4 cursor-grab active:cursor-grabbing flex-1",
                "transition-all duration-300 rounded-xl p-3 -m-3 border-2 border-transparent",
                "hover:bg-amber-50/60 hover:border-amber-200/50",
                isDragging && "cursor-grabbing bg-amber-50/80 border-amber-300/50 scale-[1.02]"
              )}
              title="Drag to move • Double-click to reset position"
              role="button"
              tabIndex={0}
              aria-label="Drag handle for moving toolbar"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                "bg-gradient-to-br from-amber-500 to-yellow-600"
              )}>
                <StickyNote size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-base truncate">
                  Sticky Notes
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-xs">Color: {currentColor.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                <Grip size={16} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRandomColor();
                }}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-amber-600 hover:bg-amber-100/80 hover:scale-105"
                title="Random color (R)"
                aria-label="Random color"
              >
                <Shuffle size={16} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={resetPosition}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title="Reset position"
                aria-label="Reset toolbar position"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleCollapsed();
                }}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
                aria-label={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
              >
                {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleHidden();
                }}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title="Hide toolbar"
                aria-label="Hide toolbar"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed State */}
        {isCollapsed && (
          <div 
            onClick={toggleCollapsed}
            className="px-6 py-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50 cursor-pointer hover:from-gray-100/60 hover:to-white/60 transition-all duration-200 rounded-b-3xl"
            role="button"
            tabIndex={0}
            aria-label="Expand toolbar"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm animate-pulse"
                  style={{ backgroundColor: currentColor }}
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    Sticky Notes
                  </div>
                  <div className="text-xs text-gray-500">
                    Color: {currentColor.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <Zap size={12} />
                  Ready to create
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span>Click to expand</span>
                  <ChevronDown size={12} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Content - Only show when not collapsed */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
            {/* Scroll indicator gradient */}
            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10 rounded-b-2xl"></div>
            <div className="p-4 space-y-4 pb-8">
            {/* Current Color Display */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200/50">
              <div
                className="w-12 h-12 rounded-lg border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ 
                  backgroundColor: currentColor,
                  borderColor: getBorderColor(currentColor),
                }}
                onClick={() => setShowMoreColors(!showMoreColors)}
                title={`Current color: ${currentColor.toUpperCase()}`}
              >
                {currentColor && (
                  <div className="w-full h-full rounded-lg flex items-center justify-center">
                    <Check
                      size={16}
                      className="text-white drop-shadow-lg"
                      style={{ color: getBorderColor(currentColor) }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">
                  {currentColor.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500">
                  Current sticky note color
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Color Palette</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomColor}
                    className="p-2 rounded-lg hover:bg-amber-100 transition-all duration-200"
                    title="Random color (R)"
                  >
                    <Shuffle size={14} className="text-amber-600" />
                  </button>
                  <button
                    onClick={() => setShowMoreColors(!showMoreColors)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    title="Toggle color picker"
                  >
                    <Palette size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Color grid */}
              <div className={cn("grid gap-2", responsiveClasses.grid)}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={cn(
                      isMobile ? "w-10 h-10" : "w-12 h-12",
                      "rounded-lg border-2 transition-sticky color-button relative group",
                      currentColor === color
                        ? "ring-2 ring-amber-500 ring-offset-2 shadow-lg scale-105"
                        : "hover:shadow-md",
                      "border-white shadow-sm"
                    )}
                    style={{
                      backgroundColor: color,
                      borderColor: getBorderColor(color),
                    }}
                    title={`Use ${color.toUpperCase()}`}
                  >
                    {currentColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={16}
                          className="text-white drop-shadow-lg"
                          style={{ color: getBorderColor(color) }}
                        />
                      </div>
                    )}
                    {/* Hover tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {color.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Custom Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  title="Choose custom color"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      onColorChangeAction(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono uppercase"
                  placeholder="#fef3c7"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleRandomColor}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-all duration-200 hover:scale-105"
                title="Randomize all sticky note colors"
              >
                <Shuffle size={14} />
                <span className="text-sm font-medium">Randomize</span>
              </button>
              <button
                onClick={handleDeleteAllNotes}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-all duration-200 hover:scale-105"
                title="Delete all sticky notes"
              >
                <Trash2 size={14} />
                <span className="text-sm font-medium">Delete All</span>
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Enhanced Collapsed state display */}
        {isCollapsed && (
          <div 
            onClick={() => toggleCollapsed()}
            className="px-4 py-3 border-t border-gray-100/50 bg-gradient-to-r from-amber-50/50 to-yellow-50/30 cursor-pointer hover:from-amber-100/60 hover:to-yellow-100/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-sm"></div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    Sticky Notes Active
                  </div>
                  <div className="text-xs text-gray-500">
                    Color: {currentColor.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium">
                  Ready to use
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <span>Click to expand</span>
                  <ChevronDown size={10} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Sticky Note Themed Styles */}
      <style jsx>{`
        /* Enhanced Custom Scrollbar with Sticky Note Theme */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(245, 158, 11, 0.4) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(245, 158, 11, 0.6) 0%,
            rgba(251, 191, 36, 0.4) 100%
          );
          border-radius: 4px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(245, 158, 11, 0.8) 0%,
            rgba(251, 191, 36, 0.6) 100%
          );
          transform: scaleY(1.2);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }

        /* Enhanced slider styles with sticky note theme */
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4),
            0 0 0 1px rgba(245, 158, 11, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slider::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5),
            0 0 0 2px rgba(245, 158, 11, 0.3);
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4),
            0 0 0 3px rgba(245, 158, 11, 0.4);
        }

        .slider::-moz-range-thumb {
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .slider::-moz-range-thumb:hover {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          transform: scale(1.2);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
        }

        /* Enhanced slider track with sticky note theme */
        .slider {
          background: linear-gradient(90deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          outline: none;
          transition: all 0.3s ease;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .slider:hover {
          background: linear-gradient(90deg, #fde68a 0%, #fcd34d 100%);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .slider:focus {
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
          border-color: rgba(245, 158, 11, 0.5);
        }

        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Enhanced animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* Enhanced shadow utilities with sticky note theme */
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.15),
            0 8px 16px -8px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .hover\:shadow-3xl:hover {
          box-shadow: 0 32px 64px -16px rgba(245, 158, 11, 0.2),
            0 12px 24px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        /* Enhanced drag states */
        .toolbar-dragging {
          cursor: grabbing !important;
          user-select: none !important;
          filter: brightness(1.05);
        }

        .toolbar-dragging * {
          cursor: grabbing !important;
        }

        /* Responsive height adjustments */
        @media (max-height: 600px) {
          .h-\\[70vh\\] {
            height: 90vh !important;
            max-height: 500px !important;
          }
        }

        @media (max-height: 400px) {
          .h-\\[70vh\\] {
            height: 95vh !important;
            max-height: 350px !important;
          }
        }

        /* Enhanced hover states for better UX */
        @media (hover: hover) {
          .group:hover .group-hover\\:opacity-100 {
            opacity: 1;
          }
          
          .group:hover .group-hover\\:scale-110 {
            transform: scale(1.1);
          }
        }

        /* Touch device optimizations */
        @media (hover: none) {
          .group-hover\\:opacity-100 {
            opacity: 1;
          }
        }

        /* Modern glass morphism effects */
        .backdrop-blur-xl {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible {
          outline: 2px solid rgba(245, 158, 11, 0.6);
          outline-offset: 2px;
        }

        input:focus-visible {
          outline: 2px solid rgba(245, 158, 11, 0.6);
          outline-offset: 1px;
        }

        /* Enhanced sticky note color buttons */
        .color-button:hover {
          transform: scale(1.1) rotate(3deg);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .color-button:active {
          transform: scale(1.05) rotate(-2deg);
        }

        /* Enhanced transitions for sticky note theme */
        .transition-sticky {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </>
  );
}
