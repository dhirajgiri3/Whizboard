"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  ChevronUp,
  ChevronDown,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  Move,
  Minus,
  MousePointer,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { useFloatingToolbarDrag } from "@/hooks/useFloatingToolbarDrag";
import { cn } from "@/lib/utils";
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
}

// Shape presets
const shapePresets: ShapePreset[] = [
  {
    id: 'rectangle',
    name: 'Rectangle',
    shapeType: 'rectangle',
    icon: <Square size={16} />,
    category: 'basic',
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
    description: 'Basic rectangle shape'
  },
  {
    id: 'circle',
    name: 'Circle',
    shapeType: 'circle',
    icon: <Circle size={16} />,
    category: 'basic',
    defaultProps: {
      shapeType: 'circle',
      width: 100,
      height: 100,
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'circle', 'round'],
    description: 'Perfect circle shape'
  },
  {
    id: 'triangle',
    name: 'Triangle',
    shapeType: 'polygon',
    icon: <Triangle size={16} />,
    category: 'basic',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 3 },
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'triangle', 'polygon'],
    description: 'Triangle shape'
  },
  {
    id: 'hexagon',
    name: 'Hexagon',
    shapeType: 'polygon',
    icon: <Hexagon size={16} />,
    category: 'basic',
    defaultProps: {
      shapeType: 'polygon',
      width: 100,
      height: 100,
      shapeData: { sides: 6 },
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'hexagon', 'polygon'],
    description: 'Hexagon shape'
  },
  {
    id: 'star',
    name: 'Star',
    shapeType: 'star',
    icon: <Star size={16} />,
    category: 'basic',
    defaultProps: {
      shapeType: 'star',
      width: 100,
      height: 100,
      shapeData: { numPoints: 5, innerRadius: 25, outerRadius: 50 },
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['basic', 'star', 'favorite'],
    description: 'Five-pointed star'
  },
  {
    id: 'ellipse',
    name: 'Ellipse',
    shapeType: 'ellipse',
    icon: <Circle size={16} className="scale-y-75" />,
    category: 'advanced',
    defaultProps: {
      shapeType: 'ellipse',
      width: 140,
      height: 80,
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'ellipse', 'oval'],
    description: 'Elliptical shape'
  },
  {
    id: 'wedge',
    name: 'Wedge',
    shapeType: 'wedge',
    icon: <Zap size={16} />,
    category: 'advanced',
    defaultProps: {
      shapeType: 'wedge',
      width: 100,
      height: 100,
      shapeData: { angle: 90, clockwise: true },
      style: {
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['advanced', 'wedge', 'pie'],
    description: 'Wedge or pie slice'
  },
  {
    id: 'line',
    name: 'Line',
    shapeType: 'line',
    icon: <Minus size={16} />,
    category: 'lines',
    defaultProps: {
      shapeType: 'line',
      width: 100,
      height: 2,
      shapeData: { points: [0, 0, 100, 0] },
      style: {
        fill: undefined,
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: false,
        strokeEnabled: true,
      }
    },
    tags: ['lines', 'line', 'straight'],
    description: 'Straight line'
  },
  {
    id: 'arrow',
    name: 'Arrow',
    shapeType: 'arrow',
    icon: <ArrowRight size={16} />,
    category: 'lines',
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
        fill: '#3b82f6',
        stroke: '#3b82f6',
        strokeWidth: 2,
        opacity: 1,
        fillOpacity: 1,
        strokeOpacity: 1,
        fillEnabled: true,
        strokeEnabled: true,
      }
    },
    tags: ['lines', 'arrow', 'pointer'],
    description: 'Arrow shape'
  },
];

// Color presets
const colorPresets = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
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
}: FloatingShapesToolbarProps) {
  const [activeTab, setActiveTab] = useState<"shapes" | "style" | "transform" | "actions">("shapes");
  const [colorType, setColorType] = useState<"fill" | "stroke">("fill");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");

  // Style state
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [cornerRadius, setCornerRadius] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [shadowColor, setShadowColor] = useState("#000000");

  const {
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    isHidden,
    isCollapsed,
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
    initialPosition: { x: 24, y: 320 },
    minWidth: 380,
    minHeight: 180,
  });

  const primarySelectedShape = selectedShapes.length > 0 ? selectedShapes[0] : null;
  const hasMultipleSelection = selectedShapes.length > 1;
  const hasSelection = selectedShapes.length > 0;

  // Filter shapes by category
  const filteredShapes = useMemo(() => {
    if (!selectedCategory) return shapePresets;
    return shapePresets.filter(preset => preset.category === selectedCategory);
  }, [selectedCategory]);

  // Update style states when selection changes
  useEffect(() => {
    if (primarySelectedShape) {
      const { style } = primarySelectedShape;
      setFillColor(style.fill || "#ffffff");
      setStrokeColor(style.stroke || "#3b82f6");
      setStrokeWidth(style.strokeWidth || 2);
      setCornerRadius(style.cornerRadius || 0);
      setOpacity(style.opacity || 1);
      setRotation(primarySelectedShape.rotation || 0);
      
      if (style.shadow) {
        setShadowBlur(style.shadow.blur || 0);
        setShadowOpacity(style.shadow.opacity || 0.25);
        setShadowOffsetX(style.shadow.offsetX || 0);
        setShadowOffsetY(style.shadow.offsetY || 4);
        setShadowColor(style.shadow.color || "#000000");
      }
    }
  }, [primarySelectedShape]);

  // Handle shape creation
  const handleShapeCreate = useCallback((preset: ShapePreset) => {
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
  const handleColorChange = useCallback((color: string) => {
    if (colorType === 'fill') {
      setFillColor(color);
      handleStyleUpdate({ fill: color });
    } else {
      setStrokeColor(color);
      handleStyleUpdate({ stroke: color });
    }
  }, [colorType, handleStyleUpdate]);

  // Handle transform updates
  const handleTransformUpdate = useCallback((updates: Partial<ShapeElement>) => {
    if (!primarySelectedShape) return;
    
    const updatedShape: ShapeElement = {
      ...primarySelectedShape,
      ...updates,
      updatedAt: Date.now()
    };
    
    onShapeUpdateAction?.(updatedShape);
  }, [primarySelectedShape, onShapeUpdateAction]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (hasMultipleSelection) {
      onShapeDeleteMultipleAction?.(selectedShapeIds);
      sonnerToast.success(`Deleted ${selectedShapeIds.length} shapes`);
    } else if (primarySelectedShape) {
      onShapeDeleteAction?.(primarySelectedShape.id);
      sonnerToast.success('Shape deleted');
    }
  }, [hasMultipleSelection, selectedShapeIds, primarySelectedShape, onShapeDeleteAction, onShapeDeleteMultipleAction]);

  // Handle duplicate
  const handleDuplicate = useCallback(() => {
    onShapeDuplicateAction?.(selectedShapeIds);
    sonnerToast.success(`Duplicated ${selectedShapeIds.length} shape${selectedShapeIds.length > 1 ? 's' : ''}`);
  }, [selectedShapeIds, onShapeDuplicateAction]);

  // Handle alignment
  const handleAlign = useCallback((alignment: string) => {
    onShapeAlignAction?.(alignment, selectedShapeIds);
    sonnerToast.success(`Aligned ${alignment}`);
  }, [selectedShapeIds, onShapeAlignAction]);

  // Handle distribution
  const handleDistribute = useCallback((distribution: string) => {
    onShapeDistributeAction?.(distribution, selectedShapeIds);
    sonnerToast.success(`Distributed ${distribution}`);
  }, [selectedShapeIds, onShapeDistributeAction]);

  if (!isActive) return null;

  return (
    <>
      {/* Eye Button */}
      <button
        ref={eyeButtonRef}
        onMouseDown={handleEyeMouseDown}
        onClick={toggleHidden}
        className={cn(
          "fixed z-50 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg",
          "w-10 h-10 flex items-center justify-center transition-all duration-200",
          "hover:bg-gray-50 hover:border-gray-300 shadow-lg",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          isDragging && "cursor-grabbing"
        )}
        style={eyeButtonStyles}
        title={isHidden ? "Show Shapes Toolbar" : "Hide Shapes Toolbar"}
      >
        {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      {/* Main Toolbar */}
      {!isHidden && (
        <div
          ref={toolbarRef}
          className={cn(
            "fixed z-40 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl",
            "flex flex-col overflow-hidden transition-all duration-200",
            isDragging && "cursor-grabbing",
            className
          )}
          style={toolbarStyles}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div
                ref={dragHandleRef}
                onMouseDown={handleMouseDown}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
                title="Drag to move"
              >
                <Grip size={14} className="text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <Square size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {hasSelection 
                    ? `${selectedShapes.length} Shape${selectedShapes.length > 1 ? 's' : ''} Selected`
                    : 'Shapes'
                  }
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleCollapsed}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <button
                onClick={toggleHidden}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                title="Hide toolbar"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50/30">
                {[
                  { id: "shapes", label: "Shapes", icon: <Square size={14} /> },
                  { id: "style", label: "Style", icon: <Palette size={14} /> },
                  { id: "transform", label: "Transform", icon: <Move size={14} /> },
                  { id: "actions", label: "Actions", icon: <Settings size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-gray-100 border-b-2 border-transparent",
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 overflow-y-auto max-h-80">
                {activeTab === "shapes" && (
                  <div className="space-y-4">
                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { id: null, label: "All" },
                        { id: "basic", label: "Basic" },
                        { id: "advanced", label: "Advanced" },
                        { id: "lines", label: "Lines" },
                      ].map((category) => (
                        <button
                          key={category.id || 'all'}
                          onClick={() => setSelectedCategory(category.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            selectedCategory === category.id
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          )}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>

                    {/* Shape Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {filteredShapes.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleShapeCreate(preset)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200",
                            "hover:border-blue-300 hover:bg-blue-50 transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          )}
                          title={preset.description}
                        >
                          <div className="text-gray-600 hover:text-blue-600 transition-colors">
                            {preset.icon}
                          </div>
                          <span className="text-xs text-gray-600 text-center">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "style" && (
                  <div className="space-y-4">
                    {!hasSelection && (
                      <div className="text-center py-8 text-gray-500">
                        <Square size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Select a shape to edit its style</p>
                      </div>
                    )}
                    
                    {hasSelection && (
                      <>
                        {/* Color Type Toggle */}
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => setColorType('fill')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                              colorType === 'fill'
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <Droplet size={14} />
                            Fill
                          </button>
                          <button
                            onClick={() => setColorType('stroke')}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                              colorType === 'stroke'
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            <Brush size={14} />
                            Stroke
                          </button>
                        </div>

                        {/* Color Presets */}
                        <div className="grid grid-cols-6 gap-2">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleColorChange(color.value)}
                              className={cn(
                                "w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors",
                                (colorType === 'fill' ? fillColor : strokeColor) === color.value && "border-blue-500 scale-110"
                              )}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                        </div>

                        {/* Stroke Width */}
                        {colorType === 'stroke' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Stroke Width</label>
                            <div className="flex items-center gap-2">
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
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-600 w-8">{strokeWidth}</span>
                            </div>
                          </div>
                        )}

                        {/* Opacity */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Opacity</label>
                          <div className="flex items-center gap-2">
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
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-600 w-8">{Math.round(opacity * 100)}%</span>
                          </div>
                        </div>

                        {/* Corner Radius (for rectangles) */}
                        {primarySelectedShape?.shapeType === 'rectangle' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Corner Radius</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="50"
                                value={cornerRadius}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  setCornerRadius(value);
                                  handleStyleUpdate({ cornerRadius: value });
                                }}
                                className="flex-1"
                              />
                              <span className="text-sm text-gray-600 w-8">{cornerRadius}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === "transform" && (
                  <div className="space-y-4">
                    {!hasSelection && (
                      <div className="text-center py-8 text-gray-500">
                        <Move size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Select a shape to transform it</p>
                      </div>
                    )}
                    
                    {hasSelection && (
                      <>
                        {/* Rotation */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Rotation</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={rotation}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                setRotation(value);
                                handleTransformUpdate({ rotation: value });
                              }}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-600 w-12">{rotation}°</span>
                          </div>
                        </div>

                        {/* Quick Rotation */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newRotation = rotation - 90;
                              setRotation(newRotation);
                              handleTransformUpdate({ rotation: newRotation });
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <RotateCcw size={14} />
                            <span className="text-sm">90° CCW</span>
                          </button>
                          <button
                            onClick={() => {
                              const newRotation = rotation + 90;
                              setRotation(newRotation);
                              handleTransformUpdate({ rotation: newRotation });
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <RotateCw size={14} />
                            <span className="text-sm">90° CW</span>
                          </button>
                        </div>

                        {/* Alignment & Distribution (for multiple selection) */}
                        {hasMultipleSelection && (
                          <div className="space-y-4">
                            {/* Horizontal Alignment */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Horizontal Alignment</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => handleAlign('left')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Left"
                                >
                                  <AlignLeft size={14} />
                                </button>
                                <button
                                  onClick={() => handleAlign('center-horizontal')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Center Horizontally"
                                >
                                  <AlignCenter size={14} />
                                </button>
                                <button
                                  onClick={() => handleAlign('right')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Right"
                                >
                                  <AlignRight size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Vertical Alignment */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Vertical Alignment</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => handleAlign('top')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Top"
                                >
                                  <AlignVerticalJustifyStart size={14} />
                                </button>
                                <button
                                  onClick={() => handleAlign('center-vertical')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Center Vertically"
                                >
                                  <AlignVerticalJustifyCenter size={14} />
                                </button>
                                <button
                                  onClick={() => handleAlign('bottom')}
                                  className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                  title="Align Bottom"
                                >
                                  <AlignVerticalJustifyEnd size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Distribution */}
                            {selectedShapes.length > 2 && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Distribution</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleDistribute('horizontal')}
                                    className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Distribute Horizontally"
                                  >
                                    <AlignHorizontalJustifyCenter size={14} />
                                    <span className="text-xs">H</span>
                                  </button>
                                  <button
                                    onClick={() => handleDistribute('vertical')}
                                    className="flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    title="Distribute Vertically"
                                  >
                                    <AlignVerticalJustifyCenter size={14} />
                                    <span className="text-xs">V</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === "actions" && (
                  <div className="space-y-4">
                    {!hasSelection && (
                      <div className="text-center py-8 text-gray-500">
                        <Settings size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Select shapes to see available actions</p>
                      </div>
                    )}
                    
                    {hasSelection && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleDuplicate}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Copy size={14} />
                          <span className="text-sm">Duplicate</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span className="text-sm">Delete</span>
                        </button>
                        <button
                          onClick={() => onShapeDeselectAction?.()}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <MousePointer size={14} />
                          <span className="text-sm">Deselect</span>
                        </button>
                        <button
                          onClick={() => {
                            selectedShapes.forEach(shape => {
                              handleTransformUpdate({ locked: !shape.locked });
                            });
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {primarySelectedShape?.locked ? <Unlock size={14} /> : <Lock size={14} />}
                          <span className="text-sm">
                            {primarySelectedShape?.locked ? 'Unlock' : 'Lock'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
} 