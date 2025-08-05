"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Frame,
  Settings,
  Palette,
  Grid,
  Search,
  Copy,
  Trash2,
  Edit,
  Check,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  EyeOff,
  Eye,
  Grip,
  Lock,
  Unlock,
  RotateCcw,
  Layers,
  Zap,
  Smartphone,
  Tablet,
  Monitor,
  Instagram,
  Globe,
  File as FileIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  FlipHorizontal,
  FlipVertical,
  Square,
  Circle,
  Droplet,
  Sliders,
  RefreshCw,
  Crosshair,
  Blend,
  Sun,
  Moon,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { useFloatingToolbarDrag } from "@/hooks/useFloatingToolbarDrag";
import { cn } from "@/lib/utils/utils";
import type {
  FramePreset,
  FloatingFrameToolbarProps,
  FrameCategory,
} from "./types";
import { framePresets, categoryInfo, colorPresets } from "./Presets";
import {
  handlePresetClick,
  handleDeleteFrame,
  handleStartRename,
  handleFinishRename,
  handleCancelRename,
  handleAlignFrames,
  handleDistributeFrames,
  handleDuplicateFrames,
  handleDeselectFrames,
} from "./Handlers";

const iconMap = {
  Smartphone: <Smartphone size={16} />,
  Tablet: <Tablet size={16} />,
  Monitor: <Monitor size={16} />,
  Instagram: <Instagram size={16} />,
  Globe: <Globe size={16} />,
  FileIcon: <FileIcon size={16} />,
  Copy: <Copy size={16} />,
};

const categoryIcons: Record<FrameCategory, React.ReactNode> = {
  device: iconMap.Smartphone,
  social: iconMap.Instagram,
  web: iconMap.Globe,
  presentation: iconMap.Monitor,
  print: iconMap.FileIcon,
  custom: iconMap.Copy,
};

export default function FloatingFrameToolbar({
  isActive,
  selectedFrames = [],
  selectedFrameIds = [],
  onFrameUpdateAction,
  onFrameCreateAction,
  onFrameDeleteAction,
  onFrameDeleteMultipleAction,
  onFrameRenameAction,
  onFrameDeselectAction,
  onFrameAlignAction,
  onFrameDistributeAction,
  onFramePlacementStart,
  onFramePlacementCancel,
  className = "",
  scale = 1,
}: FloatingFrameToolbarProps) {
  const [activeTab, setActiveTab] = useState<
    "presets" | "style" | "layout" | "actions"
  >("presets");
  const [colorType, setColorType] = useState<"fill" | "stroke">("fill");
  const [isLocked, setIsLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  
  // Frame placement state
  const [selectedPreset, setSelectedPreset] = useState<FramePreset | null>(null);
  const [isPlacementMode, setIsPlacementMode] = useState(false);

  // Style state
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#e5e7eb");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [cornerRadius, setCornerRadius] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [shadowBlur, setShadowBlur] = useState(12);
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(4);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [rotation, setRotation] = useState(0);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

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
    toolbarId: "frame",
    initialPosition: { x: 24, y: 80 },
    minWidth: 420,
    minHeight: 200,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const primarySelectedFrame =
    selectedFrames.length > 0 ? selectedFrames[0] : null;
  const hasMultipleSelection = selectedFrames.length > 1;
  const hasSelection = selectedFrames.length > 0;

  const filteredPresets = useMemo(() => {
    let filtered = framePresets;
    if (selectedCategory) {
      filtered = filtered.filter(
        (preset) => preset.category === selectedCategory
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (preset) =>
          preset.name.toLowerCase().includes(query) ||
          preset.description?.toLowerCase().includes(query) ||
          preset.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return filtered;
  }, [searchQuery, selectedCategory]);

  const groupedPresets = useMemo(() => {
    return filteredPresets.reduce((acc, preset) => {
      const categoryKey = preset.category as FrameCategory;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(preset);
      return acc;
    }, {} as Record<FrameCategory, FramePreset[]>);
  }, [filteredPresets]);

  const handleTabChange = useCallback(
    (tab: "presets" | "style" | "layout" | "actions") => {
      setActiveTab(tab);
    },
    []
  );

  // Handle preset selection for placement mode
  const handlePresetSelect = useCallback((preset: FramePreset) => {
    setSelectedPreset(preset);
    setIsPlacementMode(true);
    sonnerToast.success(`Selected ${preset.name} - Click on canvas to place`);
  }, []);

  // Cancel placement mode
  const handleCancelPlacement = useCallback(() => {
    setSelectedPreset(null);
    setIsPlacementMode(false);
    
    // Notify parent component about placement cancellation
    if (onFramePlacementCancel) {
      onFramePlacementCancel();
    }
  }, [onFramePlacementCancel]);

  // Handle frame placement on canvas
  const handleFramePlacement = useCallback((x: number, y: number) => {
    if (!selectedPreset) return;
    
    handlePresetClick(selectedPreset, onFrameCreateAction, x, y);
    setSelectedPreset(null);
    setIsPlacementMode(false);
    sonnerToast.success(`${selectedPreset.name} created!`);
  }, [selectedPreset, onFrameCreateAction]);

  // Create placement handler object
  const placementHandler = useMemo(() => ({
    handleFramePlacement,
    isPlacementMode,
    selectedPreset,
    cancelPlacement: handleCancelPlacement,
  }), [handleFramePlacement, isPlacementMode, selectedPreset, handleCancelPlacement]);

  // Notify parent component when placement mode starts
  useEffect(() => {
    if (onFramePlacementStart && isPlacementMode && selectedPreset) {
      onFramePlacementStart(selectedPreset, placementHandler);
    }
  }, [isPlacementMode, selectedPreset, onFramePlacementStart, placementHandler]);

  const handleStyleUpdate = useCallback(
    (property: string, value: string | number | boolean | object | undefined) => {
      if (!primarySelectedFrame) return;

      const updatedFrame = {
        ...primarySelectedFrame,
        style: {
          ...primarySelectedFrame.style,
          [property]: value,
        },
      };

      onFrameUpdateAction(updatedFrame);
    },
    [primarySelectedFrame, onFrameUpdateAction]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      if (colorType === "fill") {
        setFillColor(color);
        handleStyleUpdate("fill", color);
      } else {
        setStrokeColor(color);
        handleStyleUpdate("stroke", color);
      }
    },
    [colorType, handleStyleUpdate]
  );

  const handleFlipHorizontal = useCallback(() => {
    if (!primarySelectedFrame) return;

    const updatedFrame = {
      ...primarySelectedFrame,
      style: {
        ...primarySelectedFrame.style,
        transform: `scaleX(-1) ${
          primarySelectedFrame.style.transform || ""
        }`.trim(),
      },
    };

    onFrameUpdateAction(updatedFrame);
    sonnerToast.success("Frame flipped horizontally");
  }, [primarySelectedFrame, onFrameUpdateAction]);

  const handleFlipVertical = useCallback(() => {
    if (!primarySelectedFrame) return;

    const updatedFrame = {
      ...primarySelectedFrame,
      style: {
        ...primarySelectedFrame.style,
        transform: `scaleY(-1) ${
          primarySelectedFrame.style.transform || ""
        }`.trim(),
      },
    };

    onFrameUpdateAction(updatedFrame);
    sonnerToast.success("Frame flipped vertically");
  }, [primarySelectedFrame, onFrameUpdateAction]);

  const handleRotationChange = useCallback(
    (degrees: number) => {
      if (!primarySelectedFrame) return;

      setRotation(degrees);
      const updatedFrame = {
        ...primarySelectedFrame,
        style: {
          ...primarySelectedFrame.style,
          transform: `rotate(${degrees}deg)`,
        },
      };

      onFrameUpdateAction(updatedFrame);
    },
    [primarySelectedFrame, onFrameUpdateAction]
  );

  const handleCustomColorChange = useCallback(
    (color: string) => {
      setCustomColor(color);
      handleColorChange(color);
    },
    [handleColorChange]
  );

  const handleShadowUpdate = useCallback(
    (property: string, value: string | number | boolean | undefined) => {
      if (!primarySelectedFrame) return;

      const currentShadow = primarySelectedFrame.style.shadow || {};
      const updatedShadow = {
        ...currentShadow,
        [property]: value,
      };

      handleStyleUpdate("shadow", updatedShadow);
    },
    [primarySelectedFrame, handleStyleUpdate]
  );

  useEffect(() => {
    if (activeTab === "presets" && !isCollapsed) {
      searchInputRef.current?.focus();
    }
  }, [activeTab, isCollapsed]);

  useEffect(() => {
    if (isRenaming && primarySelectedFrame) {
      setTimeout(() => {
        const input = document.querySelector(
          `[data-rename-input="${primarySelectedFrame.id}"]`
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
    }
  }, [isRenaming, primarySelectedFrame]);

  // Update local state when frame selection changes
  useEffect(() => {
    if (primarySelectedFrame) {
      setFillColor(primarySelectedFrame.style.fill || "#ffffff");
      setStrokeColor(primarySelectedFrame.style.stroke || "#e5e7eb");
      setStrokeWidth(primarySelectedFrame.style.strokeWidth || 2);
      setCornerRadius(primarySelectedFrame.style.cornerRadius || 8);
      setOpacity(primarySelectedFrame.style.fillOpacity || 1);
      setShadowBlur(primarySelectedFrame.style.shadow?.blur || 12);
      setShadowOpacity(primarySelectedFrame.style.shadow?.opacity || 0.25);
      setShadowOffsetX(primarySelectedFrame.style.shadow?.offsetX || 0);
      setShadowOffsetY(primarySelectedFrame.style.shadow?.offsetY || 4);
      setShadowColor(primarySelectedFrame.style.shadow?.color || "#000000");
      setRotation(primarySelectedFrame.style.rotation || 0);
      setBrightness(primarySelectedFrame.style.brightness || 100);
      setContrast(primarySelectedFrame.style.contrast || 100);
      setSaturation(primarySelectedFrame.style.saturation || 100);
    }
  }, [primarySelectedFrame]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !hasSelection) return;

      // Check if user is currently renaming (typing in input field)
      if (isRenaming) return;

      // Check if any input/textarea is focused or if it's a rename input specifically
      if (
        document.activeElement &&
        (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) ||
          document.activeElement.getAttribute("contenteditable") === "true" ||
          document.activeElement.hasAttribute("data-rename-input"))
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        if (onFrameDeselectAction) {
          onFrameDeselectAction();
          sonnerToast.info("Selection cleared");
        }
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleDeleteFrame(
          selectedFrames,
          selectedFrameIds,
          onFrameDeleteAction,
          onFrameDeleteMultipleAction
        );
      }
    },
    [
      isActive,
      hasSelection,
      isRenaming,
      selectedFrames,
      selectedFrameIds,
      onFrameDeselectAction,
      onFrameDeleteAction,
      onFrameDeleteMultipleAction,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!isActive) return null;

  return (
    <>
      <button
        ref={eyeButtonRef}
        onMouseDown={handleEyeMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) toggleHidden();
        }}
        style={eyeButtonStyles}
        className={cn(
          "w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-lg border border-slate-200/80",
          "flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300",
          "text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95",
          isDragging && "cursor-grabbing scale-105 ring-2 ring-indigo-500/30",
          isHidden && "animate-pulse"
        )}
        title="Click to show frame toolbar • Drag to move"
        aria-label="Show frame toolbar"
      >
        <Eye size={18} />
      </button>

      <div
        ref={toolbarRef}
        onClick={handleClick}
        className={cn(
          "flex flex-col bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50",
          "transition-all duration-300 ease-out w-[25rem]",
          "max-h-[70vh] min-h-[300px]",
          isDragging &&
            "cursor-grabbing select-none shadow-3xl scale-[1.01] ring-2 ring-indigo-500/20",
          !isDragging && "hover:shadow-3xl",
          isHidden && "opacity-0 pointer-events-none scale-95",
          className
        )}
        style={{
          ...toolbarStyles,
          transform: `scale(${1 / scale})`,
          transformOrigin: "top left",
        }}
        role="toolbar"
        aria-label="Frame tools"
      >
        <header
          className={cn(
            "flex-shrink-0 border-b border-slate-100/80 rounded-t-2xl",
            "bg-gradient-to-r from-slate-50/90 to-white/90 backdrop-blur-sm"
          )}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div
              ref={dragHandleRef}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              className={cn(
                "flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1",
                "transition-all duration-300 rounded-xl px-3 py-2 -mx-3 -my-2 border-2 border-transparent",
                "hover:bg-indigo-50/60 hover:border-indigo-200/50",
                isDragging &&
                  "cursor-grabbing bg-indigo-50/80 border-indigo-300/50 scale-[1.01]"
              )}
              title="Drag to move • Double-click to reset position"
              role="button"
              tabIndex={0}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                  "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                  "bg-gradient-to-br from-indigo-500 to-purple-600"
                )}
              >
                <Frame size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-800 text-sm truncate">
                  Frame Tools
                </h2>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  {hasSelection ? (
                    <>
                      <span>{selectedFrames.length} selected</span>
                      {selectedFrames.length === 1 && (
                        <>
                          <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                          <span>
                            {Math.round(selectedFrames[0].width)} ×{" "}
                            {Math.round(selectedFrames[0].height)}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span>Ready to create frames</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity">
                <Grip size={14} />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={resetPosition}
                className="p-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80"
                title="Reset position"
                aria-label="Reset toolbar position"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={toggleCollapsed}
                className="p-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80"
                title={isCollapsed ? "Expand" : "Collapse"}
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <Maximize2 size={14} />
                ) : (
                  <Minimize2 size={14} />
                )}
              </button>
              <button
                onClick={toggleHidden}
                className="p-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80"
                title="Hide toolbar"
                aria-label="Hide toolbar"
              >
                <EyeOff size={14} />
              </button>
            </div>
          </div>
        </header>

        {isCollapsed && (
          <div
            onClick={toggleCollapsed}
            className="px-5 py-4 border-t border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50 cursor-pointer hover:from-slate-100/60 hover:to-white/60 transition-all duration-200 rounded-b-2xl"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shadow-sm animate-pulse bg-indigo-500" />
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    {hasSelection
                      ? `${selectedFrames.length} Frame${
                          selectedFrames.length !== 1 ? "s" : ""
                        } Selected`
                      : "Frame Tools"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {hasSelection && selectedFrames.length === 1
                      ? selectedFrames[0].name
                      : "Ready to create frames"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1">
                  <Zap size={10} />
                  Ready
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <span>Click to expand</span>
                  <ChevronDown size={10} className="animate-bounce" />
                </p>
              </div>
            </div>
          </div>
        )}

        {!isCollapsed && (
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-5 pt-4">
              {hasSelection && (
                <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/50 rounded-xl border border-indigo-100/60">
                  {selectedFrames.length === 1 && primarySelectedFrame ? (
                    <div>
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            data-rename-input={primarySelectedFrame.id}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              // Always stop propagation for rename input to prevent conflicts
                              e.stopPropagation();
                              
                              if (e.key === "Enter")
                                handleFinishRename(
                                  selectedFrames,
                                  renameValue,
                                  onFrameRenameAction,
                                  setIsRenaming,
                                  setRenameValue
                                );
                              if (e.key === "Escape")
                                handleCancelRename(
                                  setIsRenaming,
                                  setRenameValue
                                );
                            }}
                            onBlur={() =>
                              handleFinishRename(
                                selectedFrames,
                                renameValue,
                                onFrameRenameAction,
                                setIsRenaming,
                                setRenameValue
                              )
                            }
                            className="flex-1 px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                          <button
                            onClick={() =>
                              handleFinishRename(
                                selectedFrames,
                                renameValue,
                                onFrameRenameAction,
                                setIsRenaming,
                                setRenameValue
                              )
                            }
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleCancelRename(setIsRenaming, setRenameValue)
                            }
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-slate-800 truncate">
                              {primarySelectedFrame.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-600 font-medium">
                                {Math.round(primarySelectedFrame.width)} ×{" "}
                                {Math.round(primarySelectedFrame.height)}px
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleStartRename(
                                  selectedFrames,
                                  setIsRenaming,
                                  setRenameValue
                                )
                              }
                              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeselectFrames(onFrameDeselectAction)
                              }
                              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {selectedFrames.length} Frames Selected
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          handleDeselectFrames(onFrameDeselectAction)
                        }
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex bg-slate-100/90 rounded-xl p-1 backdrop-blur-sm">
                {[
                  {
                    id: "presets",
                    label: "Presets",
                    icon: <Layers size={13} />,
                  },
                  {
                    id: "style",
                    label: "Style",
                    icon: <Palette size={13} />,
                    disabled: !hasSelection,
                  },
                  {
                    id: "layout",
                    label: "Layout",
                    icon: <Grid size={13} />,
                    disabled: !hasMultipleSelection,
                  },
                  {
                    id: "actions",
                    label: "Actions",
                    icon: <Settings size={13} />,
                    disabled: !hasSelection,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      !tab.disabled && handleTabChange(tab.id as "presets" | "style" | "layout" | "actions")
                    }
                    disabled={tab.disabled}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-white text-indigo-600 shadow-md shadow-indigo-500/20"
                        : tab.disabled
                        ? "text-slate-400 cursor-not-allowed opacity-50"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/60"
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              {activeTab === "presets" && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search frames..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 placeholder:text-yellow-400 text-sm rounded-lg border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                        selectedCategory === null
                          ? "bg-indigo-500 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      All
                    </button>
                    {Object.entries(categoryInfo).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-colors",
                          selectedCategory === key
                            ? info.color
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {categoryIcons[key as FrameCategory]}
                        {info.label}
                      </button>
                    ))}
                  </div>

                  {/* Placement Mode Indicator */}
                  {isPlacementMode && selectedPreset && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500 rounded-lg text-white">
                            <Crosshair size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-indigo-800">
                              {selectedPreset.name} Ready
                            </h4>
                            <p className="text-xs text-indigo-600">
                              Click anywhere on the canvas to place this frame
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleCancelPlacement}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="Cancel placement"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {Object.entries(groupedPresets).map(([category, presets]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg",
                            categoryInfo[category as FrameCategory].color
                          )}
                        >
                          {categoryIcons[category as FrameCategory]}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">
                            {categoryInfo[category as FrameCategory].label}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {
                              categoryInfo[category as FrameCategory]
                                .description
                            }
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {presets.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetSelect(preset)}
                            className={cn(
                              "flex items-center gap-2.5 p-3 rounded-lg border transition-all duration-200 text-left group",
                              selectedPreset?.id === preset.id
                                ? "bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500/30"
                                : "bg-slate-50 hover:bg-indigo-50 border-slate-200 hover:border-indigo-300"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-lg shadow-sm border transition-shadow",
                              selectedPreset?.id === preset.id
                                ? "bg-indigo-500 border-indigo-600 text-white"
                                : "bg-white border-slate-100 group-hover:shadow-md"
                            )}>
                              {iconMap[preset.icon as keyof typeof iconMap]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm font-medium truncate",
                                selectedPreset?.id === preset.id
                                  ? "text-indigo-800"
                                  : "text-slate-800"
                              )}>
                                {preset.name}
                              </div>
                              <div className={cn(
                                "text-xs",
                                selectedPreset?.id === preset.id
                                  ? "text-indigo-600"
                                  : "text-slate-500"
                              )}>
                                {preset.dimensions.width} ×{" "}
                                {preset.dimensions.height}
                              </div>
                            </div>
                            {selectedPreset?.id === preset.id && (
                              <div className="text-indigo-600">
                                <Check size={16} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "style" && hasSelection && (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                  {/* Colors Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Palette size={14} />
                        Colors
                      </h3>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setColorType("fill")}
                          className={cn(
                            "px-3 py-1 text-xs rounded-md transition-colors font-medium",
                            colorType === "fill"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-600 hover:text-slate-800"
                          )}
                        >
                          <Circle size={12} className="inline mr-1" />
                          Fill
                        </button>
                        <button
                          onClick={() => setColorType("stroke")}
                          className={cn(
                            "px-3 py-1 text-xs rounded-md transition-colors font-medium",
                            colorType === "stroke"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-600 hover:text-slate-800"
                          )}
                        >
                          <Square size={12} className="inline mr-1" />
                          Stroke
                        </button>
                      </div>
                    </div>

                    {/* Color Presets */}
                    <div className="grid grid-cols-5 gap-2">
                      {colorPresets.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => handleColorChange(color.color)}
                          className={cn(
                            "w-full h-9 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md",
                            (colorType === "fill" ? fillColor : strokeColor) ===
                              color.color
                              ? "border-indigo-500 ring-2 ring-indigo-500/30 scale-105"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                          style={{ backgroundColor: color.color }}
                          title={color.name}
                        />
                      ))}
                    </div>

                    {/* Custom Color Picker */}
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <Droplet size={14} className="text-indigo-600" />
                      <span className="text-xs font-medium text-slate-700">
                        Custom Color:
                      </span>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) =>
                          handleCustomColorChange(e.target.value)
                        }
                        className="w-8 h-8 rounded-md border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() => handleColorChange(customColor)}
                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Properties Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sliders size={14} />
                      Properties
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Stroke Width
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {strokeWidth}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={strokeWidth}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setStrokeWidth(value);
                            handleStyleUpdate("strokeWidth", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Corner Radius
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {cornerRadius}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={cornerRadius}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setCornerRadius(value);
                            handleStyleUpdate("cornerRadius", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Opacity
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {Math.round(opacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={opacity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setOpacity(value);
                            handleStyleUpdate("fillOpacity", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Rotation
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {rotation}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={rotation}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            handleRotationChange(value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Effects */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Blend size={14} />
                      Effects
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Brightness
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {brightness}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={brightness}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setBrightness(value);
                            handleStyleUpdate("brightness", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Contrast
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {contrast}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={contrast}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setContrast(value);
                            handleStyleUpdate("contrast", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Saturation
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {saturation}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setSaturation(value);
                            handleStyleUpdate("saturation", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shadow Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Moon size={14} />
                      Shadow
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Shadow Blur
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {shadowBlur}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={shadowBlur}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setShadowBlur(value);
                            handleShadowUpdate("blur", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-slate-600">
                            Shadow Opacity
                          </label>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {Math.round(shadowOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={shadowOpacity}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setShadowOpacity(value);
                            handleShadowUpdate("opacity", value);
                          }}
                          className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-600">
                              Offset X
                            </label>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {shadowOffsetX}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={shadowOffsetX}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setShadowOffsetX(value);
                              handleShadowUpdate("offsetX", value);
                            }}
                            className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-600">
                              Offset Y
                            </label>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {shadowOffsetY}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-20"
                            max="20"
                            value={shadowOffsetY}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setShadowOffsetY(value);
                              handleShadowUpdate("offsetY", value);
                            }}
                            className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg appearance-none cursor-pointer smooth-slider"
                          />
                        </div>
                      </div>

                      {/* Shadow Color */}
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100">
                        <Moon size={14} className="text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">
                          Shadow Color:
                        </span>
                        <input
                          type="color"
                          value={shadowColor}
                          onChange={(e) => {
                            setShadowColor(e.target.value);
                            handleShadowUpdate("color", e.target.value);
                          }}
                          className="w-8 h-8 rounded-md border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <RefreshCw size={14} />
                      Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setOpacity(1);
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setRotation(0);
                          handleStyleUpdate("fillOpacity", 1);
                          handleStyleUpdate("brightness", 100);
                          handleStyleUpdate("contrast", 100);
                          handleStyleUpdate("saturation", 100);
                          handleStyleUpdate("rotation", 0);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <RefreshCw
                          size={14}
                          className="text-slate-600 group-hover:text-indigo-600 transition-colors"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-indigo-600 transition-colors font-medium">
                          Reset Effects
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShadowBlur(0);
                          setShadowOpacity(0);
                          setShadowOffsetX(0);
                          setShadowOffsetY(0);
                          handleShadowUpdate("blur", 0);
                          handleShadowUpdate("opacity", 0);
                          handleShadowUpdate("offsetX", 0);
                          handleShadowUpdate("offsetY", 0);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all duration-200 group"
                      >
                        <Sun
                          size={14}
                          className="text-slate-600 group-hover:text-amber-600 transition-colors"
                        />
                        <span className="text-xs text-slate-600 group-hover:text-amber-600 transition-colors font-medium">
                          Remove Shadow
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "layout" && hasMultipleSelection && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Alignment
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: "left",
                          icon: <AlignLeft size={14} />,
                          label: "Left",
                        },
                        {
                          id: "center",
                          icon: <AlignCenter size={14} />,
                          label: "Center",
                        },
                        {
                          id: "right",
                          icon: <AlignRight size={14} />,
                          label: "Right",
                        },
                        {
                          id: "top",
                          icon: <AlignLeft size={14} className="rotate-90" />,
                          label: "Top",
                        },
                        {
                          id: "middle",
                          icon: <AlignCenter size={14} className="rotate-90" />,
                          label: "Middle",
                        },
                        {
                          id: "bottom",
                          icon: <AlignRight size={14} className="rotate-90" />,
                          label: "Bottom",
                        },
                      ].map((align) => (
                        <button
                          key={align.id}
                          onClick={() =>
                            handleAlignFrames(
                              align.id as "left" | "center" | "right" | "top" | "middle" | "bottom",
                              onFrameAlignAction
                            )
                          }
                          className="flex flex-col items-center gap-1 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                        >
                          <div className="text-slate-600 group-hover:text-indigo-600 transition-colors">
                            {align.icon}
                          </div>
                          <span className="text-xs text-slate-600 group-hover:text-indigo-600 transition-colors">
                            {align.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Distribution
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          handleDistributeFrames(
                            "horizontal",
                            onFrameDistributeAction
                          )
                        }
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <AlignHorizontalDistributeCenter
                          size={16}
                          className="text-slate-600 group-hover:text-indigo-600 transition-colors"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                          Horizontal
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          handleDistributeFrames(
                            "vertical",
                            onFrameDistributeAction
                          )
                        }
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <AlignVerticalDistributeCenter
                          size={16}
                          className="text-slate-600 group-hover:text-indigo-600 transition-colors"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                          Vertical
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "actions" && hasSelection && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Frame Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          handleDuplicateFrames(
                            selectedFrames,
                            primarySelectedFrame,
                            onFrameCreateAction
                          )
                        }
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all duration-200 group"
                      >
                        <Copy
                          size={16}
                          className="text-slate-600 group-hover:text-emerald-600 transition-colors"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">
                          Duplicate
                        </span>
                      </button>

                      <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 group",
                          isLocked
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-slate-50 hover:bg-amber-50 border-slate-200 hover:border-amber-300"
                        )}
                      >
                        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                        <span className="text-sm">
                          {isLocked ? "Unlock" : "Lock"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Transform
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleFlipHorizontal}
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <FlipHorizontal
                          size={16}
                          className="text-slate-600 group-hover:text-indigo-600 transition-colors"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                          Flip H
                        </span>
                      </button>

                      <button
                        onClick={handleFlipVertical}
                        className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all duration-200 group"
                      >
                        <FlipVertical
                          size={16}
                          className="text-slate-600 group-hover:text-indigo-600 transition-colors"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-indigo-600 transition-colors">
                          Flip V
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Danger Zone
                    </h3>

                    <button
                      onClick={() => {
                        handleDeleteFrame(
                          selectedFrames,
                          selectedFrameIds,
                          onFrameDeleteAction,
                          onFrameDeleteMultipleAction
                        );
                      }}
                      className="w-full flex items-center gap-2 p-3 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all duration-200 group"
                    >
                      <Trash2
                        size={16}
                        className="text-rose-600 group-hover:text-rose-700 transition-colors"
                      />
                      <span className="text-sm text-rose-600 group-hover:text-rose-700 transition-colors font-medium">
                        Delete{" "}
                        {selectedFrames.length === 1
                          ? "Frame"
                          : `${selectedFrames.length} Frames`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(148, 163, 184, 0.3) 0%,
            rgba(148, 163, 184, 0.1) 100%
          );
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(148, 163, 184, 0.5) 0%,
            rgba(148, 163, 184, 0.3) 100%
          );
        }
        .slider {
          background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 6px;
          outline: none;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .smooth-slider {
          background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 8px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .smooth-slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4),
            0 0 0 1px rgba(99, 102, 241, 0.1);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 2;
        }
        .smooth-slider::-webkit-slider-thumb:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          transform: scale(1.15);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5),
            0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        .smooth-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.6),
            0 0 0 3px rgba(99, 102, 241, 0.3);
        }
        .smooth-slider:hover {
          background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%);
        }
        .smooth-slider:focus {
          background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Firefox slider styles */
        .smooth-slider::-moz-range-track {
          background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
          border-radius: 8px;
          height: 12px;
          border: none;
        }
        .smooth-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .smooth-slider::-moz-range-thumb:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          transform: scale(1.15);
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
          animation-duration: 300ms;
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
        :global(.toolbar-dragging) {
          cursor: grabbing !important;
          user-select: none !important;
        }
      `}</style>
    </>
  );
}
