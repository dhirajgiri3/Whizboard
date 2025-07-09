"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Circle,
  Square,
  MessageSquare,
  Type,
  MousePointer,
  Users,
  Share2,
  Wifi,
  Save,
  Triangle,
  Star,
  Move,
  RotateCcw,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Hand,
  Eraser,
  Palette,
  Layers,
  Grid3X3,
  Eye,
  EyeOff,
  Settings,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  MoreHorizontal,
  Sparkles,
  Wand2,
  Crosshair,
} from "lucide-react";

interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  avatar: string;
  isActive: boolean;
}

interface ToolbarItem {
  icon: React.ComponentType<any>;
  color: string;
  gradient: string[];
  theme: string;
  active: boolean;
  name: string;
  shortcut?: string;
  description?: string;
}

interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  user: string;
  opacity?: number;
  dashArray?: string;
  timestamp: number;
}

interface CanvasElement {
  id: string;
  type: "circle" | "rectangle" | "triangle" | "star" | "note" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  content?: string;
  selected?: boolean;
  opacity?: number;
  rotation?: number;
  strokeWidth?: number;
  strokeColor?: string;
  timestamp: number;
}

interface ColorPalette {
  name: string;
  colors: string[];
  gradients: string[];
}

const CleanWhiteboard: React.FC = () => {
  const [activeTool, setActiveTool] = useState(0);
  const [collaborators, setCollaborators] = useState<Cursor[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  // Simplified collaborator data
  const mockCollaborators: Cursor[] = useMemo(
    () => [
      {
        id: "user1",
        name: "Sarah",
        color: "#3b82f6",
        x: 150,
        y: 180,
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
        isActive: true,
      },
      {
        id: "user2",
        name: "Alex",
        color: "#10b981",
        x: 320,
        y: 140,
        avatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face",
        isActive: true,
      },
      {
        id: "user3",
        name: "Jordan",
        color: "#8b5cf6",
        x: 250,
        y: 280,
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
        isActive: false,
      },
    ],
    []
  );

  // Enhanced aesthetic color palettes
  const colorPalettes: ColorPalette[] = useMemo(() => [
    {
      name: "Ocean",
      colors: ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
      gradients: ["from-sky-400", "to-blue-600"]
    },
    {
      name: "Forest",
      colors: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
      gradients: ["from-emerald-400", "to-green-600"]
    },
    {
      name: "Sunset",
      colors: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
      gradients: ["from-amber-400", "to-orange-600"]
    },
    {
      name: "Lavender",
      colors: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
      gradients: ["from-violet-400", "to-purple-600"]
    },
    {
      name: "Rose",
      colors: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
      gradients: ["from-pink-400", "to-rose-600"]
    }
  ], []);

  // Modern toolbar design with enhanced aesthetics
  const toolbarItems: ToolbarItem[] = useMemo(
    () => [
      {
        icon: PenTool,
        color: "#3b82f6",
        gradient: ["from-blue-400", "to-blue-600"],
        theme: "blue",
        active: activeTool === 0,
        name: "Draw",
        shortcut: "P",
        description: "Freehand drawing",
      },
      {
        icon: Circle,
        color: "#10b981",
        gradient: ["from-emerald-400", "to-green-600"],
        theme: "emerald",
        active: activeTool === 1,
        name: "Circle",
        shortcut: "C",
        description: "Perfect circles",
      },
      {
        icon: Square,
        color: "#8b5cf6",
        gradient: ["from-violet-400", "to-purple-600"],
        theme: "violet",
        active: activeTool === 2,
        name: "Rectangle",
        shortcut: "R",
        description: "Rectangles & squares",
      },
      {
        icon: Triangle,
        color: "#f59e0b",
        gradient: ["from-amber-400", "to-orange-600"],
        theme: "amber",
        active: activeTool === 3,
        name: "Triangle",
        shortcut: "T",
        description: "Triangular shapes",
      },
      {
        icon: Star,
        color: "#ec4899",
        gradient: ["from-pink-400", "to-rose-600"],
        theme: "pink",
        active: activeTool === 4,
        name: "Star",
        shortcut: "S",
        description: "Star shapes",
      },
      {
        icon: MessageSquare,
        color: "#ef4444",
        gradient: ["from-red-400", "to-red-600"],
        theme: "red",
        active: activeTool === 5,
        name: "Note",
        shortcut: "N",
        description: "Sticky notes",
      },
      {
        icon: Type,
        color: "#6366f1",
        gradient: ["from-indigo-400", "to-indigo-600"],
        theme: "indigo",
        active: activeTool === 6,
        name: "Text",
        shortcut: "X",
        description: "Text elements",
      },
      {
        icon: Hand,
        color: "#64748b",
        gradient: ["from-slate-400", "to-slate-600"],
        theme: "slate",
        active: activeTool === 7,
        name: "Pan",
        shortcut: "H",
        description: "Move around canvas",
      },
      {
        icon: Eraser,
        color: "#dc2626",
        gradient: ["from-red-500", "to-red-700"],
        theme: "red",
        active: activeTool === 8,
        name: "Eraser",
        shortcut: "E",
        description: "Remove elements",
      },
    ],
    [activeTool]
  );

  // Initialize demo content
  useEffect(() => {
    setCollaborators(mockCollaborators);

    const demoElements: CanvasElement[] = [
      {
        id: "demo-circle-1",
        type: "circle",
        x: 160,
        y: 150,
        radius: 35,
        color: "#3b82f6",
        timestamp: Date.now(),
        opacity: 0.9,
      },
      {
        id: "demo-rect-1",
        type: "rectangle",
        x: 280,
        y: 120,
        width: 80,
        height: 60,
        color: "#10b981",
        timestamp: Date.now() + 1,
        opacity: 0.9,
      },
      {
        id: "demo-note-1",
        type: "note",
        x: 200,
        y: 240,
        width: 120,
        height: 80,
        color: "#8b5cf6",
        content: "Great ideas! 💡",
        timestamp: Date.now() + 2,
        opacity: 0.95,
      },
    ];
    setCanvasElements(demoElements);

    const demoPaths: DrawingPath[] = [
      {
        id: "demo-path-1",
        path: "M100 200 Q150 150 200 200 Q250 250 300 200",
        color: "#3b82f6",
        strokeWidth: 3,
        user: "user1",
        timestamp: Date.now(),
        opacity: 0.8,
      },
    ];
    setDrawingPaths(demoPaths);
  }, [mockCollaborators]);

  // Subtle collaboration simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators((prev) =>
        prev.map((collab) => ({
          ...collab,
          x: Math.max(50, Math.min(450, collab.x + (Math.random() - 0.5) * 30)),
          y: Math.max(50, Math.min(350, collab.y + (Math.random() - 0.5) * 30)),
          isActive: Math.random() > 0.3,
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Get accurate canvas coordinates
  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const viewBox = canvas.viewBox.baseVal;

    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleToolSelect = useCallback((index: number) => {
    setActiveTool(index);
    setSelectedElement(null);
  }, []);

  const handleElementSelect = useCallback(
    (elementId: string) => {
      setSelectedElement(selectedElement === elementId ? null : elementId);
    },
    [selectedElement]
  );

  // Fixed drawing handlers
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === 0) {
        // Drawing tool
        const coords = getCanvasCoordinates(e);
        setIsDrawing(true);
        setLastPoint(coords);
        setCurrentPath(`M${coords.x} ${coords.y}`);
      }
    },
    [activeTool, getCanvasCoordinates]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDrawing && activeTool === 0 && lastPoint) {
        const coords = getCanvasCoordinates(e);

        // Smooth drawing with quadratic curves
        const midX = (lastPoint.x + coords.x) / 2;
        const midY = (lastPoint.y + coords.y) / 2;

        setCurrentPath(
          (prev) => `${prev} Q${lastPoint.x} ${lastPoint.y} ${midX} ${midY}`
        );
        setLastPoint(coords);
      }
    },
    [isDrawing, activeTool, lastPoint, getCanvasCoordinates]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing && currentPath) {
      const newPath: DrawingPath = {
        id: `path-${Date.now()}`,
        path: currentPath,
        color: toolbarItems[activeTool].color,
        strokeWidth: 2,
        user: "currentUser",
        timestamp: Date.now(),
        opacity: 0.9,
      };
      setDrawingPaths((prev) => [...prev, newPath]);
      setCurrentPath("");
      setLastPoint(null);
    }
    setIsDrawing(false);
  }, [isDrawing, currentPath, toolbarItems, activeTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcuts = ["p", "c", "r", "t", "s", "n", "x", "h", "e"];
      const index = shortcuts.indexOf(e.key.toLowerCase());
      if (index !== -1) {
        setActiveTool(index);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Enhanced Modern Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-sm"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                <div className="w-5 h-5 bg-white rounded-lg opacity-90"></div>
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">CyperBoard</div>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Collaborative Canvas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enhanced Zoom Controls */}
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-gray-700 min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Enhanced Collaborators */}
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-xl px-4 py-2 border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex -space-x-1">
                {collaborators
                  .filter((c) => c.isActive)
                  .map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200 cursor-pointer"
                      style={{
                        backgroundImage: `url(${user.avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      title={user.name}
                    />
                  ))}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {collaborators.filter((c) => c.isActive).length} online
                </span>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Grid view">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Canvas Area */}
        <div className="relative h-[500px] bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
          {/* Modern Grid with Depth */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px),
                  radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 2px, transparent 2px)
                `,
                backgroundSize: "30px 30px, 30px 30px, 60px 60px",
              }}
            />
          </div>

          {/* Subtle Canvas Texture */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, 0.02) 2px,
                    rgba(0, 0, 0, 0.02) 4px
                  )
                `,
              }}
            />
          </div>

          {/* SVG Canvas */}
          <svg
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 800 500"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ cursor: activeTool === 0 ? "crosshair" : "default" }}
          >
            {/* Enhanced Drawing Paths */}
            {drawingPaths.map((path) => (
              <g key={path.id}>
                {/* Path shadow for depth */}
                <path
                  d={path.path}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth + 1}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.1"
                  transform="translate(1, 1)"
                />
                {/* Main path */}
                <path
                  d={path.path}
                  stroke={path.color}
                  strokeWidth={path.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={path.opacity || 0.9}
                  filter="url(#glow)"
                  className="transition-all duration-300 hover:opacity-100"
                />
              </g>
            ))}

            {/* Enhanced Current Drawing Path */}
            {currentPath && (
              <g>
                {/* Real-time path with glow effect */}
                <path
                  d={currentPath}
                  stroke={toolbarItems[activeTool].color}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                  filter="url(#activeGlow)"
                  className="animate-pulse"
                />
              </g>
            )}

            {/* SVG Filters for Enhanced Effects */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="elementShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2"/>
              </filter>
            </defs>

            {/* Enhanced Canvas Elements */}
            {canvasElements.map((element) => {
              const isSelected = selectedElement === element.id;

              if (element.type === "circle") {
                return (
                  <g key={element.id}>
                    {/* Circle shadow */}
                    <circle
                      cx={element.x + 2}
                      cy={element.y + 2}
                      r={element.radius}
                      fill={element.color}
                      opacity="0.1"
                    />
                    {/* Main circle */}
                    <circle
                      cx={element.x}
                      cy={element.y}
                      r={element.radius}
                      stroke={element.color}
                      strokeWidth={isSelected ? "3" : "2"}
                      fill={`url(#gradient-${element.id})`}
                      className="cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => handleElementSelect(element.id)}
                      filter={isSelected ? "url(#elementShadow)" : "none"}
                      opacity={element.opacity || 0.9}
                      style={{
                        strokeDasharray: isSelected ? "6,3" : "none",
                        animationDuration: isSelected ? "2s" : "none",
                        animationIterationCount: isSelected ? "infinite" : "none",
                      }}
                    />
                    {/* Gradient definition */}
                    <defs>
                      <radialGradient id={`gradient-${element.id}`} cx="30%" cy="30%">
                        <stop offset="0%" stopColor={`${element.color}40`} />
                        <stop offset="70%" stopColor={`${element.color}20`} />
                        <stop offset="100%" stopColor={`${element.color}10`} />
                      </radialGradient>
                    </defs>
                  </g>
                );
              }

              if (element.type === "rectangle") {
                return (
                  <g key={element.id}>
                    {/* Rectangle shadow */}
                    <rect
                      x={element.x + 2}
                      y={element.y + 2}
                      width={element.width}
                      height={element.height}
                      rx="8"
                      fill={element.color}
                      opacity="0.1"
                    />
                    {/* Main rectangle */}
                    <rect
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      rx="8"
                      stroke={element.color}
                      strokeWidth={isSelected ? "3" : "2"}
                      fill={`url(#rect-gradient-${element.id})`}
                      className="cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => handleElementSelect(element.id)}
                      filter={isSelected ? "url(#elementShadow)" : "none"}
                      opacity={element.opacity || 0.9}
                      style={{
                        strokeDasharray: isSelected ? "6,3" : "none",
                      }}
                    />
                    {/* Rectangle gradient */}
                    <defs>
                      <linearGradient id={`rect-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={`${element.color}30`} />
                        <stop offset="100%" stopColor={`${element.color}10`} />
                      </linearGradient>
                    </defs>
                  </g>
                );
              }

              if (element.type === "note") {
                return (
                  <g key={element.id}>
                    {/* Note shadow */}
                    <rect
                      x={element.x + 3}
                      y={element.y + 3}
                      width={element.width}
                      height={element.height}
                      rx="10"
                      fill={element.color}
                      opacity="0.15"
                    />
                    {/* Main note */}
                    <rect
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      rx="10"
                      stroke={element.color}
                      strokeWidth={isSelected ? "3" : "2"}
                      fill={`url(#note-gradient-${element.id})`}
                      className="cursor-pointer transition-all duration-300 hover:scale-105"
                      onClick={() => handleElementSelect(element.id)}
                      filter={isSelected ? "url(#elementShadow)" : "none"}
                      opacity={element.opacity || 0.95}
                      style={{
                        strokeDasharray: isSelected ? "6,3" : "none",
                      }}
                    />
                    {/* Note header line */}
                    <line
                      x1={element.x + 10}
                      y1={element.y + 20}
                      x2={element.x + (element.width || 0) - 10}
                      y2={element.y + 20}
                      stroke={element.color}
                      strokeWidth="1"
                      opacity="0.3"
                    />
                    {/* Note text */}
                    <text
                      x={element.x + (element.width || 0) / 2}
                      y={element.y + (element.height || 0) / 2 + 8}
                      textAnchor="middle"
                      className="text-sm font-semibold pointer-events-none select-none"
                      fill={element.color}
                      opacity="0.8"
                    >
                      {element.content}
                    </text>
                    {/* Note gradient */}
                    <defs>
                      <linearGradient id={`note-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={`${element.color}25`} />
                        <stop offset="50%" stopColor={`${element.color}15`} />
                        <stop offset="100%" stopColor={`${element.color}20`} />
                      </linearGradient>
                    </defs>
                  </g>
                );
              }

              return null;
            })}
          </svg>

          {/* Collaborative cursors */}
          <AnimatePresence>
            {collaborators.map(
              (cursor) =>
                cursor.isActive && (
                  <motion.div
                    key={cursor.id}
                    className="absolute pointer-events-none z-10"
                    initial={{ opacity: 0 }}
                    animate={{
                      x: cursor.x,
                      y: cursor.y,
                      opacity: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <MousePointer
                      className="w-5 h-5 drop-shadow-sm"
                      style={{ color: cursor.color }}
                    />
                    <div className="absolute top-5 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                      {cursor.name}
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Modern Toolbar */}
        <div className="px-6 py-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Main Tool Buttons */}
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 border border-gray-200/50 shadow-sm">
                {toolbarItems.map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => handleToolSelect(i)}
                    className={`
                      relative w-12 h-12 rounded-xl border-2 transition-all duration-300 flex items-center justify-center group overflow-hidden
                      ${
                        tool.active
                          ? `border-${tool.theme}-500 bg-gradient-to-br ${tool.gradient.join(' ')} text-white shadow-lg shadow-${tool.theme}-500/30 scale-105`
                          : "border-gray-200/50 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:scale-105 hover:shadow-md"
                      }
                    `}
                    title={`${tool.name} (${tool.shortcut}) - ${tool.description}`}
                  >
                    <tool.icon className={`w-5 h-5 transition-transform duration-200 ${tool.active ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {tool.active && (
                      <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 border border-gray-200/50 shadow-sm">
                <button className="w-10 h-10 rounded-xl border border-gray-200/50 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                        title="Undo">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200/50 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                        title="Duplicate">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-xl border border-gray-200/50 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-md"
                        title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Color Palette Preview */}
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 border border-gray-200/50 shadow-sm">
                <Palette className="w-4 h-4 text-gray-500" />
                <div className="flex space-x-1">
                  {colorPalettes[0].colors.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200 cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={`Color ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200/50 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Save className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Auto-saved</span>
                </div>
              </div>

              {/* Export/Import Actions */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Export">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Import">
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Share Button */}
              <button className="flex items-center space-x-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105">
                <Share2 className="w-4 h-4" />
                <span className="font-semibold">Share</span>
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Styling */}
      <style jsx>{`
        /* Modern glassmorphism effects */
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        /* Enhanced animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced hover states */
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }

        .group:hover .group-hover\\:opacity-100 {
          opacity: 1;
        }

        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(59, 130, 246, 0.3) 0%,
            rgba(59, 130, 246, 0.1) 100%
          );
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(59, 130, 246, 0.5) 0%,
            rgba(59, 130, 246, 0.3) 100%
          );
        }

        /* Focus states for accessibility */
        button:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.6);
          outline-offset: 2px;
        }

        /* Animation delays for staggered effects */
        .delay-75 {
          animation-delay: 75ms;
        }

        .delay-150 {
          animation-delay: 150ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        /* Text selection styling */
        ::selection {
          background-color: rgba(59, 130, 246, 0.2);
          color: rgba(59, 130, 246, 1);
        }

        /* Enhanced shadow utilities */
        .shadow-luxury {
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.1),
            0 8px 16px -8px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .shadow-luxury:hover {
          box-shadow: 
            0 32px 64px -16px rgba(0, 0, 0, 0.15),
            0 12px 24px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        /* Responsive design helpers */
        @media (max-width: 768px) {
          .responsive-hide {
            display: none;
          }
        }

        /* Enhanced button states */
        .button-enhanced {
          position: relative;
          overflow: hidden;
        }

        .button-enhanced::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.3s, height 0.3s;
        }

        .button-enhanced:hover::before {
          width: 100%;
          height: 100%;
        }

        /* Canvas interaction states */
        .canvas-interactive {
          cursor: crosshair;
        }

        .canvas-interactive.pan-mode {
          cursor: grab;
        }

        .canvas-interactive.pan-mode:active {
          cursor: grabbing;
        }

        .canvas-interactive.select-mode {
          cursor: default;
        }

        /* Element selection indicators */
        .element-selected {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        /* Loading states */
        .loading-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .border-gray-200 {
            border-color: #000;
          }
          
          .text-gray-500 {
            color: #000;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CleanWhiteboard;
