import React, { useState, useCallback, useMemo } from 'react';
import { 
  Palette, 
  Minus, 
  Plus, 
  Paintbrush, 
  Highlighter, 
  Droplet, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  Grip, 
  Settings, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Zap,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFloatingToolbarDrag } from '@/hooks/useFloatingToolbarDrag';

// Types
interface ColorOption {
  color: string;
  name: string;
}

interface StrokeWidthOption {
  value: number;
  label: string;
}

interface ToolConfig {
  icon: React.ReactNode;
  name: string;
  gradient: string;
  accent: string;
  theme: string;
  description: string;
}

type DrawingTool = 'pen' | 'highlighter';

interface DrawingToolbarProps {
  isActive?: boolean;
  onToolChange?: (tool: DrawingTool) => void;
  onColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  initialTool?: DrawingTool;
  currentTool?: DrawingTool;
  initialColor?: string;
  initialStrokeWidth?: number;
  className?: string;
}

// Constants
const PREDEFINED_COLORS: ColorOption[] = [
  { color: '#000000', name: 'Black' },
  { color: '#374151', name: 'Charcoal' },
  { color: '#ef4444', name: 'Red' },
  { color: '#f97316', name: 'Orange' },
  { color: '#eab308', name: 'Yellow' },
  { color: '#22c55e', name: 'Green' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#3b82f6', name: 'Blue' },
  { color: '#6366f1', name: 'Indigo' },
  { color: '#8b5cf6', name: 'Purple' },
  { color: '#ec4899', name: 'Pink' },
  { color: '#f59e0b', name: 'Amber' },
];

const STROKE_WIDTH_OPTIONS: StrokeWidthOption[] = [
  { value: 1, label: 'Fine' },
  { value: 2, label: 'Thin' },
  { value: 4, label: 'Medium' },
  { value: 6, label: 'Thick' },
  { value: 10, label: 'Bold' },
  { value: 16, label: 'Extra Bold' },
];

const TOOL_CONFIGS: Record<DrawingTool, ToolConfig> = {
  pen: {
    icon: <Paintbrush size={20} />,
    name: 'Drawing Pen',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'blue-500',
    theme: 'blue',
    description: 'Precise drawing tool for detailed work',
  },
  highlighter: {
    icon: <Highlighter size={20} />,
    name: 'Highlighter',
    gradient: 'from-yellow-400 to-amber-500',
    accent: 'yellow-500',
    theme: 'yellow',
    description: 'Semi-transparent highlighting tool',
  },
};

export default function EnhancedDrawingToolbar({
  isActive = true,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  initialTool = 'pen',
  currentTool,
  initialColor = '#3b82f6',
  initialStrokeWidth = 4,
  className,
}: DrawingToolbarProps) {
  // State
  const [internalTool, setInternalTool] = useState<DrawingTool>(currentTool || initialTool);
  const [color, setColor] = useState(initialColor);
  const [strokeWidth, setStrokeWidth] = useState(initialStrokeWidth);

  // Use the current tool from props if provided, otherwise use internal state
  const activeTool = currentTool || internalTool;

  // Sync with parent tool changes
  React.useEffect(() => {
    if (currentTool && currentTool !== internalTool) {
      setInternalTool(currentTool);
    }
  }, [currentTool, internalTool]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  // Drag functionality
  const {
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    isHidden,
    isCollapsed,
    isDragging,
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
    toolbarId: 'drawing',
    initialPosition: { x: 80, y: 80 },
    minWidth: 384,
    minHeight: 150,
  });

  // Computed values
  const toolConfig = useMemo(() => TOOL_CONFIGS[activeTool], [activeTool]);

  // Handlers
  const handleToolChange = useCallback((tool: DrawingTool) => {
    setInternalTool(tool);
    onToolChange?.(tool);
  }, [onToolChange]);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    setCustomColor(newColor);
    onColorChange?.(newColor);
  }, [onColorChange]);

  const handleStrokeWidthChange = useCallback((newWidth: number) => {
    setStrokeWidth(newWidth);
    onStrokeWidthChange?.(newWidth);
  }, [onStrokeWidthChange]);

  const handleCustomColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    handleColorChange(newColor);
  }, [handleColorChange]);

  const handleCustomColorInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      handleColorChange(newColor);
    }
  }, [handleColorChange]);

  const adjustStrokeWidth = useCallback((delta: number) => {
    const newWidth = Math.max(1, Math.min(50, strokeWidth + delta));
    handleStrokeWidthChange(newWidth);
  }, [strokeWidth, handleStrokeWidthChange]);

  if (!isActive) return null;

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
          "w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/50",
          "flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300",
          "text-gray-600 hover:bg-white group cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95",
          `hover:text-${toolConfig.theme}-600 hover:border-${toolConfig.theme}-300`,
          isDragging && "cursor-grabbing scale-105",
          isHidden && "animate-pulse"
        )}
        title="Click to show drawing toolbar • Drag to move"
        aria-label="Show drawing toolbar"
      >
        <Eye size={20} />
      </button>

      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        onClick={handleClick}
        style={toolbarStyles}
        className={cn(
          "flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50",
          "transition-all duration-300 ease-out w-92",
          "max-h-[70vh] min-h-[300px]",
          isDragging && "cursor-grabbing select-none shadow-3xl scale-[1.02]",
          `ring-2 ring-${toolConfig.theme}-500/20`,
          !isDragging && "hover:shadow-3xl hover:scale-[1.01]",
          isHidden && "opacity-0 pointer-events-none scale-95",
          className
        )}
        role="toolbar"
        aria-label="Drawing tools"
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
                `hover:bg-${toolConfig.theme}-50/60 hover:border-${toolConfig.theme}-200/50`,
                isDragging && `cursor-grabbing bg-${toolConfig.theme}-50/80 border-${toolConfig.theme}-300/50 scale-[1.02]`
              )}
              title="Drag to move • Double-click to reset position"
              role="button"
              tabIndex={0}
              aria-label="Drag handle for moving toolbar"
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                "bg-gradient-to-br", toolConfig.gradient
              )}>
                {toolConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-base truncate">
                  {toolConfig.name}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-mono text-xs">{color.toUpperCase()}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="text-xs">{strokeWidth}px</span>
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
                onClick={resetPosition}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title="Reset position"
                aria-label="Reset toolbar position"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleCollapsed}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
                aria-label={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
              >
                {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleHidden}
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
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {toolConfig.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {color.toUpperCase()} • {strokeWidth}px
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <Zap size={12} />
                  Ready to draw
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <span>Click to expand</span>
                  <ChevronDown size={12} className="animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Tool Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers size={16} />
                  Drawing Tools
                </h3>
                <div className="flex bg-gray-100/80 rounded-2xl p-1.5 backdrop-blur-sm">
                  {Object.entries(TOOL_CONFIGS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleToolChange(key as DrawingTool)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm",
                        activeTool === key 
                          ? `bg-white text-${config.theme}-600 shadow-lg shadow-${config.theme}-500/20 scale-105` 
                          : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                      )}
                      title={config.description}
                      aria-pressed={activeTool === key}
                    >
                      {config.icon}
                      <span className="hidden sm:inline">{config.name.split(' ')[1] || config.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette size={16} />
                    Color Palette
                  </h3>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-200 hover:scale-105",
                      showColorPicker 
                        ? `bg-${toolConfig.theme}-100 text-${toolConfig.theme}-600` 
                        : "hover:bg-gray-100 text-gray-600"
                    )}
                    title="Toggle custom color picker"
                    aria-pressed={showColorPicker}
                  >
                    <Droplet size={16} />
                  </button>
                </div>
                
                {/* Current Color Display */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <button
                    className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ backgroundColor: color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Click to toggle color picker"
                    aria-label={`Current color: ${color}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-base">
                      Current Color
                    </div>
                    <div className="text-sm text-gray-500 font-mono truncate">
                      {color.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Color Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {PREDEFINED_COLORS.map(({ color: presetColor, name }) => (
                    <button
                      key={presetColor}
                      onClick={() => handleColorChange(presetColor)}
                      className={cn(
                        "w-12 h-12 rounded-xl border-2 shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 group relative focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        color === presetColor
                          ? `border-${toolConfig.theme}-500 ring-2 ring-${toolConfig.theme}-200 scale-105`
                          : "border-white hover:border-gray-300 hover:shadow-md"
                      )}
                      style={{ backgroundColor: presetColor }}
                      title={name}
                      aria-label={`Select ${name} color`}
                    />
                  ))}
                </div>

                {/* Custom Color Picker */}
                {showColorPicker && (
                  <div className="space-y-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <Droplet size={16} className="text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">Custom Color</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="w-12 h-12 rounded-xl border-2 border-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        title="Pick a custom color"
                        aria-label="Custom color picker"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={handleCustomColorInput}
                        className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                        placeholder="#000000"
                        maxLength={7}
                        aria-label="Custom color hex code"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stroke Width Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings size={16} />
                  {activeTool === 'highlighter' ? 'Thickness' : 'Stroke Width'}
                </h3>

                {/* Current Width Display */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200/50 flex items-center justify-center shadow-sm">
                    <div
                      className="bg-gray-600 rounded-full transition-all duration-200"
                      style={{
                        width: Math.max(4, Math.min(strokeWidth * 0.8, 24)),
                        height: Math.max(4, Math.min(strokeWidth * 0.8, 24)),
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-base">
                      {strokeWidth}px
                    </div>
                    <div className="text-sm text-gray-500">
                      Current {activeTool === 'highlighter' ? 'Thickness' : 'Width'}
                    </div>
                  </div>
                </div>

                {/* Stroke Width Controls */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200/50 shadow-sm">
                  <button
                    onClick={() => adjustStrokeWidth(-1)}
                    className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={strokeWidth <= 1}
                    title="Decrease stroke width"
                    aria-label="Decrease stroke width"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={strokeWidth}
                      onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      aria-label="Stroke width slider"
                    />
                  </div>
                  <button
                    onClick={() => adjustStrokeWidth(1)}
                    className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={strokeWidth >= 50}
                    title="Increase stroke width"
                    aria-label="Increase stroke width"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Preset Widths */}
                <div className="grid grid-cols-3 gap-2">
                  {STROKE_WIDTH_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleStrokeWidthChange(value)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        strokeWidth === value
                          ? `border-${toolConfig.theme}-500 bg-${toolConfig.theme}-50 scale-105`
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      title={`Set stroke width to ${value}px`}
                      aria-pressed={strokeWidth === value}
                    >
                      <div
                        className="bg-gray-600 rounded-full"
                        style={{
                          width: Math.max(3, Math.min(value * 0.6, 20)),
                          height: Math.max(3, Math.min(value * 0.6, 20)),
                        }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium text-gray-600">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Eye size={16} />
                  Preview
                </h3>
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200/50 shadow-sm">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <svg width="100%" height="60" viewBox="0 0 300 60" aria-label="Stroke preview">
                      <defs>
                        <linearGradient id="previewGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
                          <stop offset="50%" style={{ stopColor: color, stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.6 }} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20 30 Q 75 15 150 30 Q 225 45 280 30"
                        stroke="url(#previewGradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={activeTool === 'highlighter' ? 0.7 : 1}
                      />
                    </svg>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">
                      {toolConfig.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(148, 163, 184, 0.4) 0%, rgba(148, 163, 184, 0.2) 100%);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(148, 163, 184, 0.6) 0%, rgba(148, 163, 184, 0.4) 100%);
        }

        .slider {
          background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 8px;
          outline: none;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }

        .slider::-moz-range-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          cursor: pointer;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        /* Enhanced animations */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes slide-in-from-top-2 {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation-fill-mode: both;
        }

        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }

        .duration-200 {
          animation-duration: 200ms;
        }

        /* Global dragging styles */
        :global(.toolbar-dragging) {
          cursor: grabbing !important;
          user-select: none !important;
        }

        /* Focus styles for accessibility */
        .focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}