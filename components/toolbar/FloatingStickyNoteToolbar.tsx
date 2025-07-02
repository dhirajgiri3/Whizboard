"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Palette, 
  Plus, 
  Minus, 
  StickyNote,
  Check,
  Settings,
  RefreshCw
} from 'lucide-react';
import { getStickyNoteColorPalette } from '../canvas/StickyNote';

const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

interface FloatingStickyNoteToolbarProps {
  currentColor: string;
  onColorChangeAction: (color: string) => void;
  onColorPickerOpenAction: (position: { x: number; y: number }) => void;
  isVisible: boolean;
}

export default function FloatingStickyNoteToolbar({
  currentColor,
  onColorChangeAction,
  onColorPickerOpenAction,
  isVisible
}: FloatingStickyNoteToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMoreColors, setShowMoreColors] = useState(false);
  const colors = getStickyNoteColorPalette();

  const getBorderColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      '#fef3c7': '#f59e0b',
      '#dcfce7': '#10b981',
      '#dbeafe': '#3b82f6',
      '#fce7f3': '#ec4899',
      '#f3e8ff': '#8b5cf6',
      '#fed7e2': '#f43f5e',
      '#ffedd5': '#ea580c',
      '#f0f9ff': '#0ea5e9',
      '#ecfdf5': '#059669',
      '#fef0ff': '#d946ef',
      '#fef7ed': '#f97316',
      '#f1f5f9': '#64748b',
    };
    return colorMap[bgColor] || '#6b7280';
  };

  // Handle color selection
  const handleColorSelect = useCallback((selectedColor: string) => {
    onColorChangeAction(selectedColor);
    setShowMoreColors(false);
  }, [onColorChangeAction]);

  // Random color selection
  const handleRandomColor = useCallback(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onColorChangeAction(randomColor);
  }, [colors, onColorChangeAction]);

  // Click outside handler for expanded palette
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-sticky-toolbar]')) {
        setShowMoreColors(false);
      }
    };

    if (showMoreColors) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMoreColors]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Escape') {
        setShowMoreColors(false);
        setIsExpanded(false);
      }

      // Quick color shortcuts (1-9 for first 9 colors)
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (colors[index]) {
          onColorChangeAction(colors[index]);
        }
      }

      // Random color with 'r' key
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        handleRandomColor();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible, onColorChangeAction, colors, handleRandomColor]);

  if (!isVisible) return null;

  return (
    <div className="fixed z-40 bottom-24 right-6 transition-all duration-300 ease-out" data-sticky-toolbar>
      {/* Main Toolbar */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden relative max-w-xs">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 pointer-events-none"></div>
        
        {/* Header */}
        <div className="relative px-4 py-3 bg-white/90 border-b border-amber-100/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <StickyNote className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Sticky Notes</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  Active
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white/60 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:scale-110"
              title={isCollapsed ? "Expand tools" : "Collapse tools"}
            >
              <Settings className={cn("w-4 h-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="relative p-4 space-y-4">
            {/* Current Selection */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/60 shadow-sm">
              <div
                className="w-10 h-10 rounded-xl border-2 border-white shadow-lg ring-2 ring-amber-200/60"
                style={{ 
                  backgroundColor: currentColor,
                  borderColor: getBorderColor(currentColor)
                }}
              />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Color</div>
                <div className="text-xs text-gray-700 font-mono font-semibold">{currentColor.toUpperCase()}</div>
              </div>
            </div>

            {/* Quick Color Grid */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Palette size={12} />
                Quick Colors
              </div>
              
              {isExpanded ? (
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 relative group",
                        currentColor === color 
                          ? "ring-2 ring-amber-500 ring-offset-2 shadow-lg scale-105" 
                          : "hover:shadow-md",
                        "border-white shadow-sm"
                      )}
                      style={{
                        backgroundColor: color,
                        borderColor: getBorderColor(color)
                      }}
                      title={`Use ${color}`}
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
              ) : (
                <div className="flex gap-2">
                  {colors.slice(0, 6).map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 relative group",
                        currentColor === color 
                          ? "ring-2 ring-amber-500 ring-offset-1 shadow-lg scale-105" 
                          : "hover:shadow-md",
                        "border-white shadow-sm"
                      )}
                      style={{
                        backgroundColor: color,
                        borderColor: getBorderColor(color)
                      }}
                      title={`Use ${color}`}
                    >
                      {currentColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check 
                            size={12}
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
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-200 text-sm font-medium border border-gray-200/60 hover:shadow-sm"
                  title={isExpanded ? "Show less colors" : "Show all colors"}
                >
                  {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
                  <span>{isExpanded ? "Less" : "More"}</span>
                </button>
                
                <button
                  onClick={handleRandomColor}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-purple-800 transition-all duration-200 text-sm font-medium border border-purple-200/60 hover:shadow-sm"
                  title="Random color (Press R)"
                >
                  <RefreshCw size={14} />
                  <span>Random</span>
                </button>
              </div>

              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onColorPickerOpenAction({
                    x: rect.left - 150,
                    y: rect.top - 300
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-lg text-amber-700 hover:text-amber-800 transition-all duration-200 text-sm font-medium border border-amber-200/60 hover:shadow-sm"
              >
                <Palette size={14} />
                Advanced Color Picker
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      {!isCollapsed && (
        <div className="mt-3 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm text-white rounded-xl px-3 py-2 text-xs shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Tips:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="bg-amber-700 px-1.5 py-0.5 rounded text-xs">1-9</kbd>
                <span className="text-gray-400">Quick</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-amber-700 px-1.5 py-0.5 rounded text-xs">R</kbd>
                <span className="text-gray-400">Random</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-amber-700 px-1.5 py-0.5 rounded text-xs">⌘⇧C</kbd>
                <span className="text-gray-400">Picker</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
