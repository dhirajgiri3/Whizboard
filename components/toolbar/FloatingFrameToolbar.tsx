"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Square,
  Settings,
  Palette,
  Layers,
  Type,
  Grid,
  Unlock,
  Eye,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Tablet,
  Briefcase,
  Instagram,
  Facebook,
  Twitter,
  Globe,
} from "lucide-react";
import { FrameElement } from "@/types";

const cn = (...classes: (string | undefined | null | boolean)[]) =>
  classes.filter(Boolean).join(" ");

interface FloatingFrameToolbarProps {
  isActive: boolean;
  selectedFrame?: FrameElement | null;
  onFrameUpdateAction: (frame: FrameElement) => void;
  onFrameCreateAction: (preset: FramePreset) => void;
  position?: "left" | "right" | "center";
  className?: string;
}

interface FramePreset {
  id: string;
  name: string;
  category: 'device' | 'social' | 'print' | 'web' | 'custom';
  dimensions: { width: number; height: number };
  aspectRatio?: number;
  icon: React.ReactNode;
  frameType: FrameElement['frameType'];
  defaultStyle: Partial<FrameElement['style']>;
}

const framePresets: FramePreset[] = [
  // Device Frames
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    category: 'device',
    dimensions: { width: 375, height: 812 },
    aspectRatio: 375 / 812,
    icon: <Smartphone size={16} />,
    frameType: 'design',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      cornerRadius: 24,
    },
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    category: 'device',
    dimensions: { width: 768, height: 1024 },
    aspectRatio: 768 / 1024,
    icon: <Tablet size={16} />,
    frameType: 'design',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#e5e7eb',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },
  {
    id: 'desktop-1920',
    name: 'Desktop (1920x1080)',
    category: 'device',
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    icon: <Monitor size={16} />,
    frameType: 'design',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#d1d5db',
      strokeWidth: 1,
      cornerRadius: 8,
    },
  },
  // Social Media Frames
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'social',
    dimensions: { width: 1080, height: 1080 },
    aspectRatio: 1,
    icon: <Instagram size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#ec4899',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'social',
    dimensions: { width: 1080, height: 1920 },
    aspectRatio: 9 / 16,
    icon: <Instagram size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#ec4899',
      strokeWidth: 2,
      cornerRadius: 16,
    },
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    category: 'social',
    dimensions: { width: 1200, height: 630 },
    aspectRatio: 1200 / 630,
    icon: <Facebook size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#1877f2',
      strokeWidth: 2,
      cornerRadius: 8,
    },
  },
  {
    id: 'twitter-post',
    name: 'Twitter Post',
    category: 'social',
    dimensions: { width: 1200, height: 675 },
    aspectRatio: 16 / 9,
    icon: <Twitter size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#1da1f2',
      strokeWidth: 2,
      cornerRadius: 12,
    },
  },
  // Web Frames
  {
    id: 'web-landing',
    name: 'Landing Page',
    category: 'web',
    dimensions: { width: 1440, height: 1024 },
    aspectRatio: 1440 / 1024,
    icon: <Globe size={16} />,
    frameType: 'design',
    defaultStyle: {
      fill: '#f9fafb',
      stroke: '#6b7280',
      strokeWidth: 1,
      cornerRadius: 8,
    },
  },
  {
    id: 'web-banner',
    name: 'Web Banner',
    category: 'web',
    dimensions: { width: 1200, height: 300 },
    aspectRatio: 4,
    icon: <Globe size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#d1d5db',
      strokeWidth: 1,
      cornerRadius: 6,
    },
  },
  // Business/Print
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'print',
    dimensions: { width: 350, height: 200 },
    aspectRatio: 1.75,
    icon: <Briefcase size={16} />,
    frameType: 'presentation',
    defaultStyle: {
      fill: '#ffffff',
      stroke: '#374151',
      strokeWidth: 1,
      cornerRadius: 4,
    },
  },
];

const frameTypes = [
  { id: 'basic', name: 'Basic', icon: <Square size={16} /> },
  { id: 'workflow', name: 'Workflow', icon: <Grid size={16} /> },
  { id: 'design', name: 'Design', icon: <Palette size={16} /> },
  { id: 'organization', name: 'Organization', icon: <Layers size={16} /> },
  { id: 'presentation', name: 'Presentation', icon: <Monitor size={16} /> },
  { id: 'collaboration', name: 'Collaboration', icon: <Type size={16} /> },
] as const;

const predefinedColors = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
  '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#000000',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#fefce8', '#fef3c7',
  '#fde68a', '#fcd34d', '#f59e0b', '#d97706', '#b45309', '#92400e',
  '#78350f', '#451a03', '#f0fff4', '#dcfce7', '#bbf7d0', '#86efac',
  '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6',
  '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#faf5ff', '#f3e8ff',
  '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed',
  '#6d28d9', '#5b21b6',
];

export default function FloatingFrameToolbar({
  isActive,
  selectedFrame,
  onFrameUpdateAction,
  onFrameCreateAction,
  position = "left",
  className = "",
}: FloatingFrameToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'style' | 'layout'>('presets');
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [colorType, setColorType] = useState<'fill' | 'stroke'>('fill');
  const colorPaletteRef = useRef<HTMLDivElement>(null);

  // Close color palette when clicking outside
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

  // Update frame style
  const updateFrameStyle = useCallback((updates: Partial<FrameElement['style']>) => {
    if (!selectedFrame) return;
    
    const updatedFrame = {
      ...selectedFrame,
      style: {
        ...selectedFrame.style,
        ...updates,
      },
      updatedAt: Date.now(),
      version: selectedFrame.version + 1,
    };
    
    onFrameUpdateAction(updatedFrame);
  }, [selectedFrame, onFrameUpdateAction]);

  // Update frame properties
  const updateFrameProperty = useCallback((updates: Partial<FrameElement>) => {
    if (!selectedFrame) return;
    
    const updatedFrame = {
      ...selectedFrame,
      ...updates,
      updatedAt: Date.now(),
      version: selectedFrame.version + 1,
    };
    
    onFrameUpdateAction(updatedFrame);
  }, [selectedFrame, onFrameUpdateAction]);

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    if (colorType === 'fill') {
      updateFrameStyle({ fill: color });
    } else {
      updateFrameStyle({ stroke: color });
    }
    setShowColorPalette(false);
  }, [colorType, updateFrameStyle]);

  // Handle frame type change
  const handleFrameTypeChange = useCallback((frameType: FrameElement['frameType']) => {
    updateFrameProperty({ frameType });
  }, [updateFrameProperty]);

  // Create frame from preset
  const handlePresetClick = useCallback((preset: FramePreset) => {
    onFrameCreateAction(preset);
  }, [onFrameCreateAction]);

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed z-50 bg-white/95 backdrop-blur-md shadow-xl border border-gray-200/60 rounded-2xl transition-all duration-300",
        position === "left" && "left-6 top-1/2 -translate-y-1/2",
        position === "right" && "right-6 top-1/2 -translate-y-1/2",
        position === "center" && "left-1/2 top-6 -translate-x-1/2",
        "w-80 max-w-sm max-h-[calc(100vh-3rem)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Square className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Frame Tools</div>
              <div className="text-xs text-gray-500">
                {selectedFrame ? `Editing ${selectedFrame.name}` : 'Create or select frame'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-gray-500 hover:scale-110"
            title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-h-96">
          {/* Tabs */}
          <div className="flex border-b border-gray-100/50">
            {[
              { id: 'presets', name: 'Presets', icon: <Grid size={14} /> },
              { id: 'style', name: 'Style', icon: <Palette size={14} /> },
              { id: 'layout', name: 'Layout', icon: <Settings size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'presets' | 'style' | 'layout')}
                className={cn(
                  "flex-1 p-3 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2",
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                )}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Quick Create
                </div>
                
                {['device', 'social', 'web', 'print'].map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 capitalize">
                      {category} Frames
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {framePresets
                        .filter((preset) => preset.category === category)
                        .map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 text-left group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-gray-500 group-hover:text-blue-600">
                                {preset.icon}
                              </div>
                              <div className="text-xs font-medium text-gray-700 group-hover:text-blue-700">
                                {preset.name}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {preset.dimensions.width} × {preset.dimensions.height}
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'style' && selectedFrame && (
              <div className="space-y-4">
                {/* Frame Type */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Frame Type
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {frameTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleFrameTypeChange(type.id)}
                        className={cn(
                          "p-2 border rounded-lg transition-all duration-200 text-xs font-medium flex items-center gap-2",
                          selectedFrame.frameType === type.id
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        )}
                      >
                        {type.icon}
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Colors
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setColorType('fill');
                        setShowColorPalette(true);
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: selectedFrame.style.fill || '#ffffff' }}
                        />
                        <div className="text-xs text-gray-600">Fill</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setColorType('stroke');
                        setShowColorPalette(true);
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border-2"
                          style={{ 
                            borderColor: selectedFrame.style.stroke || '#000000',
                            backgroundColor: 'transparent'
                          }}
                        />
                        <div className="text-xs text-gray-600">Stroke</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Stroke Width */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Stroke Width
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={selectedFrame.style.strokeWidth || 1}
                    onChange={(e) => updateFrameStyle({ strokeWidth: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {selectedFrame.style.strokeWidth || 1}px
                  </div>
                </div>

                {/* Corner Radius */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Corner Radius
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={selectedFrame.style.cornerRadius || 0}
                    onChange={(e) => updateFrameStyle({ cornerRadius: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {selectedFrame.style.cornerRadius || 0}px
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Opacity
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedFrame.style.fillOpacity || 1}
                    onChange={(e) => updateFrameStyle({ fillOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round((selectedFrame.style.fillOpacity || 1) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'layout' && selectedFrame && (
              <div className="space-y-4">
                {/* Frame Properties */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Frame Properties
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Frame name"
                      value={selectedFrame.name}
                      onChange={(e) => updateFrameProperty({ name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={selectedFrame.description || ''}
                      onChange={(e) => updateFrameProperty({ description: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Visibility Control */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Controls
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Toggle frame visibility - you can implement this based on your needs
                        console.log('Toggle frame visibility');
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye size={14} />
                      <span className="text-xs">Visible</span>
                    </button>
                    <button
                      onClick={() => {
                        // Toggle frame lock - you can implement this based on your needs
                        console.log('Toggle frame lock');
                      }}
                      className="flex-1 p-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 text-gray-600"
                    >
                      <Unlock size={14} />
                      <span className="text-xs">Unlocked</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color Palette Popup */}
      {showColorPalette && (
        <div
          ref={colorPaletteRef}
          className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50"
        >
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            {colorType === 'fill' ? 'Fill Color' : 'Stroke Color'}
          </div>
          <div className="grid grid-cols-8 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-all duration-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
