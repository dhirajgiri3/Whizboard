"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Palette,
  Minus,
  Plus,
  Check,
  X,
  PenTool,
  Settings,
  Pipette,
  Sparkles,
} from "lucide-react";

const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

export type DrawingTool = "pen" | "brush" | "marker";

interface FloatingDrawingToolbarProps {
  isActive: boolean;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  drawingTool?: DrawingTool;
  onDrawingToolChange?: (tool: DrawingTool) => void;
  position?: "left" | "right" | "center";
  className?: string;
}

// Enhanced color presets with categories
const colorCategories = {
  basic: {
    name: "Basic",
    colors: ["#000000", "#6b7280", "#ffffff", "#f3f4f6"]
  },
  vibrant: {
    name: "Vibrant",
    colors: ["#dc2626", "#ea580c", "#eab308", "#16a34a", "#0891b2", "#2563eb", "#7c3aed", "#c026d3"]
  },
  pastels: {
    name: "Pastels",
    colors: ["#fca5a5", "#fdba74", "#fde047", "#86efac", "#67e8f9", "#93c5fd", "#c4b5fd", "#f0abfc"]
  },
  dark: {
    name: "Dark",
    colors: ["#374151", "#7f1d1d", "#92400e", "#365314", "#164e63", "#1e3a8a", "#581c87", "#86198f"]
  }
};

// All colors flattened
const allColors = Object.values(colorCategories).flatMap(category => category.colors);

// Stroke width presets
const strokePresets = [
  { value: 1, label: "Fine", icon: "—" },
  { value: 3, label: "Normal", icon: "━" },
  { value: 5, label: "Medium", icon: "▬" },
  { value: 8, label: "Thick", icon: "█" },
  { value: 12, label: "Bold", icon: "▉" },
  { value: 20, label: "Extra", icon: "▊" },
];

export default function FloatingDrawingToolbar({
  isActive,
  color = "#2563eb",
  onColorChange,
  strokeWidth = 3,
  onStrokeWidthChange,
  position = "left",
  className = "",
}: FloatingDrawingToolbarProps) {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("vibrant");
  const [customColor, setCustomColor] = useState(color);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const colorPaletteRef = useRef<HTMLDivElement>(null);

  // Handle color selection
  const handleColorSelect = useCallback((selectedColor: string) => {
    onColorChange(selectedColor);
    setCustomColor(selectedColor);
    setShowColorPalette(false);
  }, [onColorChange]);

  // Handle stroke width selection
  const handleStrokeSelect = useCallback((width: number) => {
    onStrokeWidthChange(width);
  }, [onStrokeWidthChange]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPaletteRef.current &&
        !colorPaletteRef.current.contains(event.target as Node)
      ) {
        setShowColorPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Escape') {
        setShowColorPalette(false);
      }

      // Number keys for stroke width
      if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (strokePresets[index]) {
          onStrokeWidthChange(strokePresets[index].value);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onStrokeWidthChange]);

  // Auto-hide when not active
  useEffect(() => {
    if (!isActive) {
      setShowColorPalette(false);
    }
  }, [isActive]);

  // Get position classes - Enhanced responsive positioning
  const getPositionClasses = () => {
    switch (position) {
      case "right":
        return "top-4 right-4 sm:top-6 sm:right-6 lg:top-20 lg:right-6";
      case "center":
        return "top-4 left-1/2 transform -translate-x-1/2 sm:top-6 lg:top-20";
      default:
        // Responsive positioning - mobile bottom, tablet side, desktop next to main toolbar
        return "bottom-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-auto sm:bottom-auto lg:top-20 lg:left-24";
    }
  };

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed z-35 transition-all duration-500 ease-out",
        getPositionClasses(),
        isCollapsed ? "scale-95 opacity-90" : "scale-100 opacity-100",
        "animate-in slide-in-from-left-8 duration-300",
        // Mobile-specific styles
        "w-full sm:w-auto sm:max-w-xs",
        className
      )}
    >
      {/* Main Toolbar - Enhanced Responsive Design */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-2xl rounded-t-2xl rounded-b-none sm:rounded-b-2xl shadow-2xl border border-white/30 overflow-hidden w-full sm:max-w-xs relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 pointer-events-none"></div>
        
        {/* Compact Header with responsive design */}
        <div className="relative px-3 sm:px-4 py-2 sm:py-3 bg-white border-b border-indigo-100/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-gray-800">Pen Tools</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  Active
                </div>
              </div>
              {/* Mobile title */}
              <div className="sm:hidden">
                <div className="text-xs font-semibold text-gray-800">Pen Tools</div>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/60 transition-all duration-200 text-gray-500 hover:text-gray-700 hover:scale-110 touch-manipulation"
              title={isCollapsed ? "Expand tools" : "Collapse tools"}
            >
              <Settings className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300", isCollapsed && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Content - Enhanced Responsive Layout */}
        {!isCollapsed && (
          <div className="relative p-3 sm:p-4 space-y-3 sm:space-y-4">
            {/* Current Selection - Mobile optimized */}
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg sm:rounded-xl border border-gray-200/60 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 border-white shadow-lg ring-2 ring-indigo-200/60"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 0 1px ${color === "#ffffff" ? "#e5e7eb" : "transparent"}, 0 4px 12px rgba(0,0,0,0.1)`
                  }}
                />
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current</div>
                  <div className="text-xs text-gray-700 font-mono font-semibold">{color.toUpperCase()}</div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div
                    className="bg-gray-700 rounded-full shadow-sm"
                    style={{
                      width: Math.max(3, Math.min(strokeWidth * 0.8, 20)),
                      height: Math.max(3, Math.min(strokeWidth * 0.8, 20)),
                    }}
                  />
                  <div className="text-xs sm:text-sm text-gray-700 font-semibold">{strokeWidth}px</div>
                </div>
              </div>
            </div>

            {/* Quick Color Picker - Mobile grid optimization */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Palette size={12} />
                Quick Colors
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
                {colorCategories.vibrant.colors.concat(colorCategories.basic.colors.slice(0, 0)).map((colorValue) => (
                  <button
                    key={colorValue}
                    onClick={() => handleColorSelect(colorValue)}
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 relative group touch-manipulation",
                      color === colorValue
                        ? "ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-lg"
                        : "hover:shadow-md",
                      colorValue === "#ffffff" ? "border-gray-300" : "border-white shadow-sm"
                    )}
                    style={{ backgroundColor: colorValue }}
                    title={colorValue.toUpperCase()}
                  >
                    {color === colorValue && (
                      <Check
                        size={12}
                        className="absolute inset-0 m-auto text-white drop-shadow-lg sm:w-3.5 sm:h-3.5"
                        style={{ color: colorValue === "#ffffff" ? "#000" : "#fff" }}
                      />
                    )}
                    {/* Enhanced hover tooltip - hidden on mobile */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 hidden sm:block">
                      {colorValue.toUpperCase()}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width - Mobile friendly controls */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                Stroke Width
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => onStrokeWidthChange(Math.max(1, strokeWidth - 1))}
                  className="p-2 sm:p-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 text-gray-500 hover:scale-110 border border-gray-200 hover:border-indigo-200 touch-manipulation"
                  title="Decrease stroke"
                >
                  <Minus size={14} />
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                    className="w-full h-2 sm:h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer stroke-slider touch-manipulation"
                  />
                </div>
                <button
                  onClick={() => onStrokeWidthChange(Math.min(20, strokeWidth + 1))}
                  className="p-2 sm:p-2.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 text-gray-500 hover:scale-110 border border-gray-200 hover:border-indigo-200 touch-manipulation"
                  title="Increase stroke"
                >
                  <Plus size={14} />
                </button>
              </div>
              
              {/* Stroke Presets - Mobile responsive grid */}
              <div className="grid grid-cols-6 sm:grid-cols-4 gap-1 sm:gap-1.5">
                {strokePresets.slice(0, 6).map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleStrokeSelect(preset.value)}
                    className={cn(
                      "py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg text-xs font-medium transition-all duration-200 border touch-manipulation",
                      strokeWidth === preset.value
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-md ring-2 ring-indigo-200"
                        : "bg-white hover:bg-indigo-50 border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm"
                    )}
                    title={`${preset.label} (${preset.value}px)`}
                  >
                    {preset.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons - Mobile optimized */}
            <div className="flex gap-1.5 sm:gap-2 pt-2 border-t border-gray-200/60">
              <button
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 hover:text-indigo-800 transition-all duration-200 text-xs sm:text-sm font-medium border border-indigo-200/60 hover:shadow-sm touch-manipulation"
                title="More Colors"
              >
                <Palette size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">More</span>
                <span className="sm:hidden">Colors</span>
              </button>
              <button
                onClick={() => {
                  const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
                  handleColorSelect(randomColor);
                }}
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 text-pink-700 hover:text-pink-800 transition-all duration-200 text-xs sm:text-sm font-medium border border-pink-200/60 hover:shadow-sm touch-manipulation"
                title="Random Color"
              >
                <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Random</span>
                <span className="sm:hidden">Random</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Color Palette Modal - Mobile Responsive */}
      {showColorPalette && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 sm:left-0 sm:right-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Palette Header */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-800">Color Palette</span>
              </div>
              <button
                onClick={() => setShowColorPalette(false)}
                className="p-1.5 hover:bg-white/60 rounded-lg transition-colors touch-manipulation"
              >
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-72 sm:max-h-80 overflow-y-auto">
            {/* Category Tabs - Mobile scrollable */}
            <div className="flex gap-1 bg-gray-50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
              {Object.entries(colorCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    "flex-shrink-0 py-1.5 sm:py-2 px-2 sm:px-3 text-xs font-medium rounded-md transition-all duration-200 touch-manipulation",
                    selectedCategory === key
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Color Grid - Mobile responsive */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
              {colorCategories[selectedCategory as keyof typeof colorCategories].colors.map((colorValue) => (
                <button
                  key={colorValue}
                  onClick={() => handleColorSelect(colorValue)}
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 relative group touch-manipulation",
                    color === colorValue
                      ? "ring-2 ring-indigo-500 ring-offset-2 scale-105"
                      : "hover:shadow-md",
                    colorValue === "#ffffff" ? "border-gray-300" : "border-white shadow-sm"
                  )}
                  style={{ backgroundColor: colorValue }}
                  title={colorValue.toUpperCase()}
                >
                  {color === colorValue && (
                    <Check
                      size={16}
                      className="absolute inset-0 m-auto text-white drop-shadow-lg"
                      style={{ color: colorValue === "#ffffff" ? "#000" : "#fff" }}
                    />
                  )}
                  {/* Hover tooltip - Hidden on mobile */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap hidden sm:block">
                    {colorValue.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Color - Mobile friendly */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Pipette className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Custom Color</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full sm:w-12 h-10 rounded-lg border border-gray-200 cursor-pointer touch-manipulation"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="#000000"
                />
                <button
                  onClick={() => handleColorSelect(customColor)}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium touch-manipulation"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint - Hidden on mobile */}
      {!isCollapsed && (
        <div className="mt-3 bg-gradient-to-r from-gray-800 to-gray-900 backdrop-blur-sm text-white rounded-xl px-3 py-2 text-xs shadow-lg hidden sm:block">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Tips:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <kbd className="bg-indigo-700 px-1.5 py-0.5 rounded text-xs">P</kbd>
                <span className="text-gray-400">Pen</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-indigo-700 px-1.5 py-0.5 rounded text-xs">1-6</kbd>
                <span className="text-gray-400">Size</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Custom Styles with Mobile Support */}
      <style jsx>{`
        .stroke-slider {
          background: linear-gradient(
            to right,
            #6366f1 0%,
            #6366f1 ${((strokeWidth - 1) / 19) * 100}%,
            #e5e7eb ${((strokeWidth - 1) / 19) * 100}%,
            #e5e7eb 100%
          );
        }
        
        .stroke-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .stroke-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        /* Mobile specific styles */
        @media (max-width: 640px) {
          .stroke-slider::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
          .stroke-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
          }
        }

        /* Hide scrollbar for mobile category tabs */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Touch feedback */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
