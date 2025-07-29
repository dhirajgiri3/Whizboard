"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Zap,
  ArrowRight,
  Palette,
  Settings,
  Brush,
  Droplet,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  EyeOff,
  Eye,
  Grip,
  ChevronDown,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Move,
  Minus,
  MousePointer,
  Plus,
  Maximize2,
  Minimize2,
  Layers,
  Shapes,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { useFloatingToolbarDrag } from "@/hooks/useFloatingToolbarDrag";
import { cn } from "@/lib/utils/utils";
import type { ShapeElement } from "@/types";

// Shape type definitions
export type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'wedge' | 'arc' | 'ring' | 'line' | 'arrow' | 'custom-path';

export interface ShapePreset {
  id: string;
  name: string;
  shapeType: ShapeType;
  icon: React.ReactNode;
  defaultProps: Partial<ShapeElement>;
  category: 'basic' | 'advanced' | 'lines' | 'custom';
  tags?: string[];
  description?: string;
  gradient?: string;
  theme?: string;
}

export interface FloatingShapesToolbarProps {
  isActive: boolean;
  selectedShapes?: ShapeElement[];
  selectedShapeIds?: string[];
  onShapeUpdateAction?: (shape: ShapeElement) => void;
  onShapeCreateAction?: (shapeType: ShapeType, props?: Partial<ShapeElement>) => void;
  onShapeDeleteAction?: (shapeId: string) => void;
  onShapeDeleteMultipleAction?: (shapeIds: string[]) => void;
  onShapeDeselectAction?: () => void;
  onShapeAlignAction?: (alignment: string, shapeIds: string[]) => void;
  onShapeDistributeAction?: (distribution: string, shapeIds: string[]) => void;
  onShapeDuplicateAction?: (shapeIds: string[]) => void;
  className?: string;
  scale?: number;
  isMobile?: boolean;
  isTablet?: boolean;
  isCollapsed?: boolean;
}

// Aesthetic shape presets with themed styling
const shapePresets: ShapePreset[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    shapeType: 'rectangle',
    icon: <Square size={18} />,
    category: 'basic',
    gradient: 'from-blue-500 to-indigo-600',
    theme: 'blue',
    defaultProps: {
      shapeType: 'rectangle',
      width: 120,
      height: 80,
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        cornerRadius: 8,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'rectangle', 'box'],
    description: 'Perfect for frames, containers, and layouts'
  },
  {
    id: 'circle',
    name: 'Circle',
    shapeType: 'circle',
    icon: <Circle size={18} />,
    category: 'basic',
    gradient: 'from-emerald-500 to-teal-600',
    theme: 'emerald',
    defaultProps: {
      shapeType: 'circle',
      width: 100,
      height: 100,
      style: {
        fill: '#ffffff',
        stroke: '#10b981',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'circle', 'round'],
    description: 'Perfect circles for buttons and focal points'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    shapeType: 'polygon',
    icon: <Triangle size={18} />,
    category: 'basic',
    gradient: 'from-orange-500 to-red-600',
    theme: 'orange',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 3 },
      style: {
        fill: '#ffffff',
        stroke: '#f97316',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'triangle', 'polygon'],
    description: 'Great for arrows, indicators, and alerts'
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    shapeType: 'ellipse',
    icon: <Circle size={18} className="scale-y-75" />,
    category: 'basic',
    gradient: 'from-cyan-500 to-blue-600',
    theme: 'cyan',
    defaultProps: {
      shapeType: 'ellipse',
      width: 140,
      height: 80,
      style: {
        fill: '#ffffff',
        stroke: '#06b6d4',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'ellipse', 'oval'],
    description: 'Elegant oval shapes for organic designs'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    shapeType: 'polygon',
    icon: <Hexagon size={18} />,
    category: 'advanced',
    gradient: 'from-purple-500 to-violet-600',
    theme: 'purple',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 6 },
      style: {
        fill: '#ffffff',
        stroke: '#8b5cf6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'hexagon', 'polygon'],
    description: 'Modern geometric shape for badges and icons'
  },
  {
    id: 'pentagon',
    name: 'Pentagon',
    shapeType: 'polygon',
    icon: <Hexagon size={18} className="scale-90" />,
    category: 'advanced',
    gradient: 'from-amber-500 to-yellow-600',
    theme: 'amber',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 5 },
      style: {
        fill: '#ffffff',
        stroke: '#f59e0b',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'pentagon', 'polygon'],
    description: 'Five-sided polygon for unique designs'
  },
  {
    id: 'octagon',
    name: 'Octagon',
    shapeType: 'polygon',
    icon: <Hexagon size={18} className="rotate-45" />,
    category: 'advanced',
    gradient: 'from-rose-500 to-pink-600',
    theme: 'rose',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 8 },
      style: {
        fill: '#ffffff',
        stroke: '#f43f5e',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'octagon', 'polygon'],
    description: 'Eight-sided polygon for complex shapes'
  },
  {
    id: 'star',
    name: 'Star',
    shapeType: 'star',
    icon: <Star size={18} />,
    category: 'advanced',
    gradient: 'from-yellow-400 to-amber-500',
    theme: 'yellow',
    defaultProps: {
      shapeType: 'star',
      width: 100,
      height: 100,
      shapeData: { numPoints: 5, innerRadius: 25, outerRadius: 50 },
      style: {
        fill: '#ffffff',
        stroke: '#eab308',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'star', 'favorite'],
    description: 'Perfect for ratings, favorites, and highlights'
  },
  {
    id: 'wedge',
    name: 'Wedge',
    shapeType: 'wedge',
    icon: <Zap size={18} />,
    category: 'advanced',
    gradient: 'from-indigo-500 to-purple-600',
    theme: 'indigo',
    defaultProps: {
      shapeType: 'wedge',
      width: 100,
      height: 100,
      shapeData: { angle: 90, clockwise: true },
      style: {
        fill: '#ffffff',
        stroke: '#6366f1',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'wedge', 'pie'],
    description: 'Perfect for pie charts and data visualization'
  },
  {
    id: 'line',
    name: 'Line',
    shapeType: 'line',
    icon: <Minus size={18} />,
    category: 'lines',
    gradient: 'from-slate-500 to-gray-600',
    theme: 'slate',
    defaultProps: {
      shapeType: 'line',
      width: 100,
      height: 2,
      shapeData: { points: [0, 0, 100, 0] },
      style: {
        fill: undefined,
        stroke: '#64748b',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: false,
        strokeEnabled: true,
      }
    },
    tags: ['lines', 'line', 'straight'],
    description: 'Clean straight lines for dividers and borders'
  },
  {
    id: 'arrow',
    name: 'Arrow',
    shapeType: 'arrow',
    icon: <ArrowRight size={18} />,
    category: 'lines',
    gradient: 'from-teal-500 to-cyan-600',
    theme: 'teal',
    defaultProps: {
      shapeType: 'arrow',
      width: 100,
      height: 20,
      shapeData: { 
        points: [0, 10, 100, 10],
        pointerLength: 10,
        pointerWidth: 10,
        pointerAtBeginning: false
      },
      style: {
        fill: '#14b8a6',
        stroke: '#14b8a6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['lines', 'arrow', 'pointer'],
    description: 'Essential for flows, directions, and connections'
  },
];

// Enhanced color presets with better organization
const colorPresets = [
  { name: 'Blue', value: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Green', value: '#22c55e', gradient: 'from-green-400 to-green-600' },
  { name: 'Red', value: '#ef4444', gradient: 'from-red-400 to-red-600' },
  { name: 'Purple', value: '#8b5cf6', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Orange', value: '#f97316', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Pink', value: '#ec4899', gradient: 'from-pink-400 to-pink-600' },
  { name: 'Cyan', value: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },
  { name: 'Yellow', value: '#eab308', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Gray', value: '#6b7280', gradient: 'from-gray-400 to-gray-600' },
  { name: 'Black', value: '#000000', gradient: 'from-gray-800 to-black' },
  { name: 'White', value: '#ffffff', gradient: 'from-gray-100 to-white' },
  { name: 'Indigo', value: '#6366f1', gradient: 'from-indigo-400 to-indigo-600' },
];

export default function FloatingShapesToolbar({
  isActive,
  selectedShapes = [],
  selectedShapeIds = [],
  onShapeUpdateAction,
  onShapeCreateAction,
  onShapeDeleteAction,
  onShapeDeleteMultipleAction,
  onShapeDeselectAction,
  onShapeAlignAction,
  onShapeDistributeAction,
  onShapeDuplicateAction,
  className = "",
  scale = 1,
  isMobile = false,
  isTablet = false,
  isCollapsed = false,
}: FloatingShapesToolbarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<'fill' | 'stroke'>('fill');
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [selectedShapePreset, setSelectedShapePreset] = useState<ShapePreset | null>(null);

  // Style state
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [cornerRadius, setCornerRadius] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Responsive settings
  const isSmallScreen = isMobile || isTablet;
  const shouldCollapse = isCollapsed || (isMobile && isActive);

  const {
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    isHidden,
    isCollapsed: isFloatingToolbarCollapsed,
    isDragging,
    position: toolbarPosition,
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
    toolbarId: "shapes",
    initialPosition: { 
      x: isSmallScreen ? 20 : 24, 
      y: isSmallScreen ? 320 : 320 
    },
    minWidth: isSmallScreen ? 300 : 384,
    minHeight: isSmallScreen ? 200 : 300,
  });

  const primarySelectedShape = selectedShapes.length > 0 ? selectedShapes[0] : null;
  const hasMultipleSelection = selectedShapes.length > 1;
  const hasSelection = selectedShapes.length > 0;

  // Filter shapes by category
  const filteredShapes = useMemo(() => {
    if (!selectedCategory) return shapePresets;
    return shapePresets.filter(preset => preset.category === selectedCategory);
  }, [selectedCategory]);

  // Tool config for the selected shape or default
  const toolConfig = useMemo(() => {
    if (selectedShapePreset) {
      return {
        icon: selectedShapePreset.icon,
        name: selectedShapePreset.name,
        gradient: selectedShapePreset.gradient || 'from-blue-500 to-indigo-600',
        theme: selectedShapePreset.theme || 'blue',
        description: selectedShapePreset.description || 'Shape tool'
      };
    }
    return {
      icon: <Shapes size={20} />,
      name: hasSelection ? `${selectedShapes.length} Shape${selectedShapes.length > 1 ? 's' : ''}` : 'Shape Tools',
      gradient: 'from-blue-500 to-indigo-600',
      theme: 'blue',
      description: hasSelection ? 'Multiple shapes selected' : 'Create and edit shapes'
    };
  }, [selectedShapePreset, hasSelection, selectedShapes.length]);

  // Update style states when selection changes
  useEffect(() => {
    if (primarySelectedShape) {
      const { style } = primarySelectedShape;
      
      const newFillColor = style.fill || "#ffffff";
      const newStrokeColor = style.stroke || "#3b82f6";
      const newStrokeWidth = style.strokeWidth || 2;
      const newCornerRadius = style.cornerRadius || 0;
      const newOpacity = style.opacity || 1;
      const newRotation = primarySelectedShape.rotation || 0;
      
      if (fillColor !== newFillColor) setFillColor(newFillColor);
      if (strokeColor !== newStrokeColor) setStrokeColor(newStrokeColor);
      if (strokeWidth !== newStrokeWidth) setStrokeWidth(newStrokeWidth);
      if (cornerRadius !== newCornerRadius) setCornerRadius(Array.isArray(newCornerRadius) ? newCornerRadius[0] : newCornerRadius);
      if (opacity !== newOpacity) setOpacity(newOpacity);
      if (rotation !== newRotation) setRotation(newRotation);
    }
  }, [primarySelectedShape, fillColor, strokeColor, strokeWidth, cornerRadius, opacity, rotation]);

  // Handle shape creation
  const handleShapeCreate = useCallback((preset: ShapePreset) => {
    setSelectedShapePreset(preset);
    onShapeCreateAction?.(preset.shapeType, preset.defaultProps);
    sonnerToast.success(`${preset.name} selected - Click on canvas to place`);
  }, [onShapeCreateAction]);

  // Handle style updates
  const handleStyleUpdate = useCallback((updates: Partial<ShapeElement['style']>) => {
    if (!primarySelectedShape) return;
    
    const updatedShape: ShapeElement = {
      ...primarySelectedShape,
      style: {
        ...primarySelectedShape.style,
        ...updates
      },
      updatedAt: Date.now()
    };
    
    onShapeUpdateAction?.(updatedShape);
  }, [primarySelectedShape, onShapeUpdateAction]);

  // Handle color change
  const handleColorChange = useCallback((color: string, type: 'fill' | 'stroke') => {
    if (type === 'fill') {
      setFillColor(color);
      handleStyleUpdate({ fill: color });
    } else {
      setStrokeColor(color);
      handleStyleUpdate({ stroke: color });
    }
    setCustomColor(color);
  }, [handleStyleUpdate]);

  // Handle actions
  const handleDelete = useCallback(() => {
    if (hasMultipleSelection) {
      onShapeDeleteMultipleAction?.(selectedShapeIds);
      sonnerToast.success(`Deleted ${selectedShapeIds.length} shapes`);
    } else if (primarySelectedShape) {
      onShapeDeleteAction?.(primarySelectedShape.id);
      sonnerToast.success('Shape deleted');
    }
  }, [hasMultipleSelection, selectedShapeIds, primarySelectedShape, onShapeDeleteAction, onShapeDeleteMultipleAction]);

  const handleDuplicate = useCallback(() => {
    onShapeDuplicateAction?.(selectedShapeIds);
    sonnerToast.success(`Duplicated ${selectedShapeIds.length} shape${selectedShapeIds.length > 1 ? 's' : ''}`);
  }, [selectedShapeIds, onShapeDuplicateAction]);

  if (!isActive) return null;

  return (
    <>
      {/* Themed Eye Button */}
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
          isSmallScreen ? "w-12 h-12" : "w-14 h-14",
          "rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/50",
          "flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300",
          "text-gray-600 hover:bg-white group cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95",
          `hover:text-${toolConfig.theme}-600 hover:border-${toolConfig.theme}-300`,
          isDragging && "cursor-grabbing scale-105",
          isHidden && "animate-pulse",
          isMobile && "touch-manipulation"
        )}
        title="Click to show shapes toolbar • Drag to move"
        aria-label="Show shapes toolbar"
      >
        <Eye size={isSmallScreen ? 18 : 20} />
      </button>

      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        onClick={handleClick}
        style={toolbarStyles}
        className={cn(
          "flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50",
          "transition-all duration-300 ease-out",
          isSmallScreen ? "w-80 max-w-[90vw]" : "w-96",
          isSmallScreen ? "max-h-[60vh] min-h-[280px]" : "max-h-[70vh] min-h-[320px]",
          isDragging && "cursor-grabbing select-none shadow-3xl scale-[1.02]",
          `ring-2 ring-${toolConfig.theme}-500/20`,
          !isDragging && "hover:shadow-3xl hover:scale-[1.01]",
          isHidden && "opacity-0 pointer-events-none scale-95",
          shouldCollapse && "hidden",
          className
        )}
        role="toolbar"
        aria-label="Shape tools"
      >
        {/* Themed Header */}
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
                  {hasSelection ? (
                    <>
                      <span className="font-mono text-xs">{fillColor.toUpperCase()}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-xs">{strokeWidth}px</span>
                    </>
                  ) : (
                    <span className="text-xs">{toolConfig.description}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                <Grip size={16} />
              </div>
            </div>

            {/* Themed Action Buttons */}
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
                title={isFloatingToolbarCollapsed ? "Expand toolbar" : "Collapse toolbar"}
                aria-label={isFloatingToolbarCollapsed ? "Expand toolbar" : "Collapse toolbar"}
              >
                {isFloatingToolbarCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
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

        {/* Themed Collapsed State */}
        {isFloatingToolbarCollapsed && (
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
                  style={{ backgroundColor: hasSelection ? fillColor : toolConfig.gradient.includes('blue') ? '#3b82f6' : '#64748b' }}
                  aria-hidden="true"
                />
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {toolConfig.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {hasSelection ? `${fillColor.toUpperCase()} • ${strokeWidth}px` : 'Ready to create'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <Zap size={12} />
                  {hasSelection ? 'Editing' : 'Ready'}
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
        {!isFloatingToolbarCollapsed && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Shape Library */}
              <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shapes size={16} />
                  Shape Library
                </h3>

                {/* Themed Category Filter */}
                <div className="flex bg-gray-100/80 rounded-2xl p-1.5 backdrop-blur-sm overflow-x-auto">
                  {[
                    { id: null, label: "All", icon: <Layers size={14} /> },
                    { id: "basic", label: "Basic", icon: <Square size={14} /> },
                    { id: "advanced", label: "Advanced", icon: <Star size={14} /> },
                    { id: "lines", label: "Lines", icon: <ArrowRight size={14} /> },
                  ].map((category) => (
                    <button
                      key={category.id || 'all'}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm whitespace-nowrap",
                        selectedCategory === category.id
                          ? "bg-white text-blue-600 shadow-lg shadow-blue-500/20 scale-105"
                          : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                      )}
                      title={`Show ${category.label.toLowerCase()} shapes`}
                      aria-pressed={selectedCategory === category.id}
                    >
                      {category.icon}
                      <span className="hidden sm:inline">{category.label}</span>
                    </button>
                  ))}
                </div>

                {/* Themed Shape Grid */}
                <div className={cn(
                  "grid gap-3",
                  isSmallScreen ? "grid-cols-2" : "grid-cols-3"
                )}>
                  {filteredShapes.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleShapeCreate(preset)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border-2 transition-all duration-300",
                        "hover:border-gray-300 hover:shadow-lg hover:scale-105 active:scale-95",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                        selectedShapePreset?.id === preset.id
                          ? `border-${preset.theme}-500 bg-${preset.theme}-50/50`
                          : "border-gray-200 bg-white hover:bg-gray-50",
                        isMobile && "touch-manipulation"
                      )}
                      title={preset.description}
                    >
                      <div className="p-4 flex flex-col items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg",
                          "transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                          "bg-gradient-to-br",
                          preset.gradient
                        )}>
                          {preset.icon}
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-800 text-sm">
                            {preset.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {preset.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Themed Style Section */}
              {hasSelection && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette size={16} />
                    Style Properties
                  </h3>

                  {/* Enhanced Color Display with Active Indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Fill Color */}
                    <div className={cn(
                      "bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border shadow-sm transition-all duration-300",
                      colorPickerMode === 'fill' && showColorPicker
                        ? "border-blue-300 ring-2 ring-blue-100 shadow-lg"
                        : "border-gray-200/50"
                    )}>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          style={{ backgroundColor: fillColor }}
                          onClick={() => {
                            setColorPickerMode('fill');
                            setShowColorPicker(!showColorPicker);
                            setCustomColor(fillColor);
                          }}
                          title="Click to change fill color"
                          aria-label={`Fill color: ${fillColor}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-sm flex items-center gap-2",
                            colorPickerMode === 'fill' && showColorPicker ? "text-blue-700" : "text-gray-800"
                          )}>
                            Fill
                            {colorPickerMode === 'fill' && showColorPicker && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">
                            {fillColor.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stroke Color */}
                    <div className={cn(
                      "bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border shadow-sm transition-all duration-300",
                      colorPickerMode === 'stroke' && showColorPicker
                        ? "border-orange-300 ring-2 ring-orange-100 shadow-lg"
                        : "border-gray-200/50"
                    )}>
                      <div className="flex items-center gap-3">
                        <button
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          style={{ backgroundColor: strokeColor }}
                          onClick={() => {
                            setColorPickerMode('stroke');
                            setShowColorPicker(!showColorPicker);
                            setCustomColor(strokeColor);
                          }}
                          title="Click to change stroke color"
                          aria-label={`Stroke color: ${strokeColor}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-sm flex items-center gap-2",
                            colorPickerMode === 'stroke' && showColorPicker ? "text-orange-700" : "text-gray-800"
                          )}>
                            Stroke
                            {colorPickerMode === 'stroke' && showColorPicker && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono truncate">
                            {strokeColor.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Color Palette */}
                  <div className={cn(
                    "grid gap-1.5",
                    isSmallScreen ? "grid-cols-6" : "grid-cols-8"
                  )}>
                    {colorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value, colorPickerMode || 'fill')}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleColorChange(color.value, 'stroke');
                        }}
                        className={cn(
                          "w-8 h-8 rounded-lg border border-gray-300 transition-colors hover:border-gray-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                          (fillColor === color.value || strokeColor === color.value)
                            ? "border-gray-500 ring-2 ring-gray-300"
                            : "hover:border-gray-400"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={`${color.name} • Left: ${colorPickerMode === 'stroke' ? 'Stroke' : 'Fill'} • Right: Stroke`}
                        aria-label={`Select ${color.name} color`}
                      />
                    ))}
                  </div>

                  {/* Enhanced Custom Color Picker */}
                  {showColorPicker && (
                    <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet size={16} className={cn(
                            colorPickerMode === 'stroke' ? 'text-orange-600' : 'text-blue-600'
                          )} />
                          <span className="text-sm font-semibold text-gray-700">
                            Custom {colorPickerMode === 'stroke' ? 'Stroke' : 'Fill'} Color
                          </span>
                        </div>
                        <button
                          onClick={() => setShowColorPicker(false)}
                          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      {/* Color Mode Toggle */}
                      <div className="flex bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => {
                            setColorPickerMode('fill');
                            setCustomColor(fillColor);
                          }}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm",
                            colorPickerMode === 'fill'
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          )}
                        >
                          Fill
                        </button>
                        <button
                          onClick={() => {
                            setColorPickerMode('stroke');
                            setCustomColor(strokeColor);
                          }}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm",
                            colorPickerMode === 'stroke'
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          )}
                        >
                          Stroke
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => handleColorChange(e.target.value, colorPickerMode)}
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          title={`Pick a custom ${colorPickerMode} color`}
                          aria-label={`Custom ${colorPickerMode} color picker`}
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => {
                            setCustomColor(e.target.value);
                            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              handleColorChange(e.target.value, colorPickerMode);
                            }
                          }}
                          className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl font-mono uppercase bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
                          placeholder="#000000"
                          maxLength={7}
                          aria-label={`Custom ${colorPickerMode} color hex code`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Properties Controls */}
                  <div className="space-y-4">
                    {/* Clean Stroke Width */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Stroke Width</label>
                        <span className="text-xs text-gray-500 font-mono">{strokeWidth}px</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <button
                          onClick={() => {
                            const newWidth = Math.max(1, strokeWidth - 1);
                            setStrokeWidth(newWidth);
                            handleStyleUpdate({ strokeWidth: newWidth });
                          }}
                          className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          disabled={strokeWidth <= 1}
                          title="Decrease stroke width"
                          aria-label="Decrease stroke width"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="flex-1">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={strokeWidth}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setStrokeWidth(value);
                              handleStyleUpdate({ strokeWidth: value });
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            aria-label="Stroke width slider"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newWidth = Math.min(20, strokeWidth + 1);
                            setStrokeWidth(newWidth);
                            handleStyleUpdate({ strokeWidth: newWidth });
                          }}
                          className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          disabled={strokeWidth >= 20}
                          title="Increase stroke width"
                          aria-label="Increase stroke width"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Clean Opacity */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Opacity</label>
                        <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={opacity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setOpacity(value);
                            handleStyleUpdate({ opacity: value });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          aria-label="Opacity slider"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Themed Actions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Settings size={16} />
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleDuplicate}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:scale-105 font-medium"
                      >
                        <Copy size={16} />
                        <span className="text-sm">Duplicate</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-2xl hover:from-red-100 hover:to-rose-100 transition-all duration-200 hover:scale-105 font-medium"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Empty State */}
              {!hasSelection && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <Shapes size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Create Shapes</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Choose from the shape library above to start creating. Select shapes to customize their appearance.
                  </p>
                </div>
              )}
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
      `}</style>
    </>
  );
} 