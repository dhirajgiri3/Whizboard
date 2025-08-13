import React from "react";
import {
  Grid,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  EyeOff,
  Settings,
  Move,
  Maximize2,
  ChevronUp,
  ChevronDown,
  PenTool,
} from "lucide-react";
import { Tool } from "@/types";

interface CanvasControlsProps {
  showControls: boolean;
  controlsCollapsed: boolean;
  stageScale: number;
  getZoomLevel: () => string;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  fitToScreen: () => void;
  setShowControls: (show: boolean) => void;
  setControlsCollapsed: (collapsed: boolean) => void;
  hasLines: boolean;
  performanceMode: boolean;
  isSpacePressed: boolean;
  isPanning: boolean;
  isStickyNoteDragging: boolean;
  isFrameDragging: boolean;

  hoveredLineIndex: number | null;
  tool: Tool;
  isDrawingInFrame: boolean;
  activeFrameId: string | null;
}

export function CanvasControls({
  showControls,
  controlsCollapsed,
  stageScale,
  getZoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  showGrid,
  setShowGrid,
  fitToScreen,
  setShowControls,
  setControlsCollapsed,
  hasLines,
  performanceMode,
  isSpacePressed,
  isPanning,
  isStickyNoteDragging,
  isFrameDragging,

  hoveredLineIndex,
  tool,
  isDrawingInFrame,
  activeFrameId,
}: CanvasControlsProps) {
  return (
    <>
      {/* Top Right Controls */}
      {showControls && (
        <div className="absolute top-6 right-6 z-30 flex flex-col gap-3 max-w-xs">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            <div className="p-4 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-semibold ${getZoomLevel()}`}>
                    {Math.round(stageScale * 100)}%
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <div className="text-xs text-gray-500 font-medium">
                    Canvas
                  </div>
                </div>
                <button
                  onClick={() => setControlsCollapsed(!controlsCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-gray-500 hover:scale-110"
                  title={
                    controlsCollapsed ? "Expand controls" : "Collapse controls"
                  }
                >
                  {controlsCollapsed ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronUp size={14} />
                  )}
                </button>
              </div>
            </div>

            {!controlsCollapsed && (
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Zoom
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={zoomIn}
                      className="flex-1 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-700 group"
                      title="Zoom In (Ctrl + +)"
                    >
                      <ZoomIn
                        size={16}
                        className="mx-auto group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={zoomOut}
                      className="flex-1 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-700 group"
                      title="Zoom Out (Ctrl + -)"
                    >
                      <ZoomOut
                        size={16}
                        className="mx-auto group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={resetZoom}
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 text-gray-600 hover:text-gray-700 group"
                      title="Reset Zoom (Ctrl + 0)"
                    >
                      <RotateCcw
                        size={16}
                        className="mx-auto group-hover:rotate-180 transition-transform duration-300"
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    View
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`flex-1 p-2.5 rounded-xl transition-all duration-200 group ${
                        showGrid
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700"
                      }`}
                      title="Toggle Grid (Ctrl + G)"
                    >
                      <Grid
                        size={16}
                        className="mx-auto group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() => {
                        console.log('CanvasControls fitToScreen button clicked');
                        fitToScreen();
                      }}
                      className="flex-1 p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 transition-all duration-200 text-purple-600 hover:text-purple-700 group disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Fit to Screen"
                      disabled={false}
                    >
                      <Maximize2
                        size={16}
                        className="mx-auto group-hover:scale-110 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() => setShowControls(false)}
                      className="flex-1 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 text-red-600 hover:text-red-700 group"
                      title="Hide Controls (Ctrl + H)"
                    >
                      <EyeOff
                        size={16}
                        className="mx-auto group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-6 right-6 z-30 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 hover:bg-white hover:shadow-2xl transition-all duration-300 text-gray-700 hover:text-gray-900 group"
          title="Show Controls (Ctrl + H)"
        >
          <Settings
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>
      )}

      {/* Bottom Status Indicators */}
      <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {performanceMode && (
            <div className="bg-amber-50/90 backdrop-blur-sm text-amber-700 border border-amber-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm">
              ⚡ Performance Mode
            </div>
          )}

          {isSpacePressed && (
            <div className="bg-blue-50/90 backdrop-blur-sm text-blue-700 border border-blue-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2">
              <Move size={12} />
              Pan Mode
            </div>
          )}

          {isStickyNoteDragging && (
            <div className="bg-purple-50/90 backdrop-blur-sm text-purple-700 border border-purple-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2">
              <Move size={12} />
              Dragging Note
            </div>
          )}

          {isFrameDragging && (
            <div className="bg-indigo-50/90 backdrop-blur-sm text-indigo-700 border border-indigo-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2">
              <Move size={12} />
              Moving Frame
            </div>
          )}



          {hoveredLineIndex !== null && tool !== "pen" && tool !== "eraser" && tool !== "highlighter" && (
            <div className="bg-indigo-50/90 backdrop-blur-sm text-indigo-700 border border-indigo-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2 animate-pulse">
              <PenTool size={12} />
              Click to activate pen tool
            </div>
          )}

          {tool === "highlighter" && (
            <div className="bg-yellow-50/90 backdrop-blur-sm text-yellow-700 border border-yellow-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2">
              <PenTool size={12} />
              Highlighter Mode
            </div>
          )}

          {isDrawingInFrame && activeFrameId && (
            <div className="bg-blue-50/90 backdrop-blur-sm text-blue-700 border border-blue-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2 animate-pulse">
              <PenTool size={12} />
              Drawing in Frame
            </div>
          )}


          {tool === 'frame' && (
            <div className="bg-green-50/90 backdrop-blur-sm text-green-700 border border-green-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2">
              <Grid size={12} />
              Drag to create frame
            </div>
          )}
        </div>
      </div>
    </>
  );
}
