import React, { useState, useCallback, useMemo } from 'react';
import {
  Minus,
  Plus,
  Palette,
  Settings,
  ChevronDown,
  Grip,
  RotateCcw,
  Zap,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Move,
  MousePointer,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useFloatingToolbarDrag } from '@/hooks/useFloatingToolbarDrag';

interface LineStyle {
  id: string;
  name: string;
  icon: React.ReactNode;
  strokeDasharray?: number[];
  strokeLineCap?: 'butt' | 'round' | 'square';
  strokeLineJoin?: 'bevel' | 'round' | 'miter';
  tension?: number;
}

interface LineToolbarProps {
  isActive?: boolean;
  onLineStyleChange?: (style: LineStyle) => void;
  onColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onArrowStyleChange?: (style: 'none' | 'start' | 'end' | 'both') => void;
  initialStyle?: LineStyle;
  currentStyle?: LineStyle;
  initialColor?: string;
  initialStrokeWidth?: number;
  className?: string;
  isMobile?: boolean;
  isTablet?: boolean;
  isCollapsed?: boolean;
}

const PREDEFINED_COLORS = [
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

const STROKE_WIDTH_OPTIONS = [
  { value: 1, label: 'Fine' },
  { value: 2, label: 'Thin' },
  { value: 4, label: 'Medium' },
  { value: 6, label: 'Thick' },
  { value: 10, label: 'Bold' },
  { value: 16, label: 'Extra Bold' },
];

const LINE_STYLES: LineStyle[] = [
  {
    id: 'solid',
    name: 'Solid',
    icon: <Minus size={18} />,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
  },
  {
    id: 'dashed',
    name: 'Dashed',
    icon: <Minus size={18} />,
    strokeDasharray: [5, 5],
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
  },
  {
    id: 'dotted',
    name: 'Dotted',
    icon: <Minus size={18} />,
    strokeDasharray: [2, 4],
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
  },
  {
    id: 'curved',
    name: 'Curved',
    icon: <Minus size={18} />,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    tension: 0.5,
  },
  {
    id: 'double',
    name: 'Double',
    icon: <Minus size={18} />,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
  },
];

const ARROW_STYLES = [
  { id: 'none', name: 'No Arrow', icon: <Minus size={16} /> },
  { id: 'start', name: 'Start Arrow', icon: <ArrowLeft size={16} /> },
  { id: 'end', name: 'End Arrow', icon: <ArrowRight size={16} /> },
  { id: 'both', name: 'Both Arrows', icon: <Move size={16} /> },
];

export default function LineToolbar({
  isActive = true,
  onLineStyleChange,
  onColorChange,
  onStrokeWidthChange,
  onArrowStyleChange,
  initialStyle = LINE_STYLES[0],
  currentStyle,
  initialColor = '#3b82f6',
  initialStrokeWidth = 4,
  className = "",
  isMobile = false,
  isTablet = false,
  isCollapsed = false,
}: LineToolbarProps) {
  const [selectedStyle, setSelectedStyle] = useState<LineStyle>(currentStyle || initialStyle);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedStrokeWidth, setSelectedStrokeWidth] = useState(initialStrokeWidth);
  const [selectedArrowStyle, setSelectedArrowStyle] = useState('none');
  const [activeTab, setActiveTab] = useState<'style' | 'color' | 'width' | 'arrow'>('style');
  const [isExpanded, setIsExpanded] = useState(false);

  const { dragRef, isDragging } = useFloatingToolbarDrag({
    toolbarId: 'line-toolbar',
  });

  const handleStyleChange = useCallback((style: LineStyle) => {
    setSelectedStyle(style);
    onLineStyleChange?.(style);
  }, [onLineStyleChange]);

  const handleColorChange = useCallback((color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
  }, [onColorChange]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setSelectedStrokeWidth(width);
    onStrokeWidthChange?.(width);
  }, [onStrokeWidthChange]);

  const handleArrowStyleChange = useCallback((style: string) => {
    setSelectedArrowStyle(style);
    onArrowStyleChange?.(style as any);
  }, [onArrowStyleChange]);

  const toolConfig = useMemo(() => ({
    name: 'Line Tools',
    description: 'Create and edit lines with various styles',
    gradient: 'from-purple-500 to-violet-600',
    accent: 'purple-500',
    theme: 'purple',
  }), []);

  if (!isActive) return null;

  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg",
        "transition-all duration-200 ease-in-out",
        isCollapsed ? "w-12 h-12" : "w-80",
        isDragging ? "shadow-xl scale-105" : "",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            `bg-gradient-to-br ${toolConfig.gradient}`
          )}>
            <Minus size={16} className="text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{toolConfig.name}</h3>
              <p className="text-xs text-gray-500">{toolConfig.description}</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <div className="w-1 h-1 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing" />
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'style', label: 'Style', icon: <Settings size={14} /> },
              { id: 'color', label: 'Color', icon: <Palette size={14} /> },
              { id: 'width', label: 'Width', icon: <Minus size={14} /> },
              { id: 'arrow', label: 'Arrow', icon: <ArrowRight size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3">
            {activeTab === 'style' && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-700">Line Style</h4>
                <div className="grid grid-cols-2 gap-2">
                  {LINE_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleChange(style)}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded border transition-colors",
                        selectedStyle.id === style.id
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {style.icon}
                      <span className="text-xs">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'color' && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-700">Line Color</h4>
                <div className="grid grid-cols-6 gap-2">
                  {PREDEFINED_COLORS.map(colorOption => (
                    <button
                      key={colorOption.color}
                      onClick={() => handleColorChange(colorOption.color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 transition-all",
                        selectedColor === colorOption.color
                          ? "border-purple-500 scale-110"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ backgroundColor: colorOption.color }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'width' && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-700">Stroke Width</h4>
                <div className="space-y-2">
                  {STROKE_WIDTH_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleStrokeWidthChange(option.value)}
                      className={cn(
                        "flex items-center justify-between w-full p-2 rounded border transition-colors",
                        selectedStrokeWidth === option.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="text-xs">{option.label}</span>
                      <div
                        className="bg-gray-900 rounded"
                        style={{ height: option.value, width: option.value }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'arrow' && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-gray-700">Arrow Style</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ARROW_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => handleArrowStyleChange(style.id)}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded border transition-colors",
                        selectedArrowStyle === style.id
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {style.icon}
                      <span className="text-xs">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Style: {selectedStyle.name}</span>
              <span>Width: {selectedStrokeWidth}px</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 