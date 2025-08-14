// src/components/whiteboard/RealtimeWhiteboard.tsx

"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { motion } from "framer-motion";
import WhiteboardCanvas from "./WhiteboardCanvas";
import WhiteboardHeader from "./WhiteboardHeader";
import WhiteboardToolbar from "./WhiteboardToolbar";
import ColorPickerDialog from "./ColorPickerDialog";
import ToolInstructionDialog from "./ToolInstructionDialog";
import { Cursor, CanvasElement, DrawingPath } from "./types";
import { useWhiteboardTools } from "./hooks/useWhiteboardTools";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { MousePointer, Hand, Lightbulb, ArrowRight } from "lucide-react"; 

const RealtimeWhiteboard: React.FC = () => {
    const [activeTool, setActiveTool] = useState(0);
    const [collaborators, setCollaborators] = useState<Cursor[]>([]);
    const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
    const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const canvasRef = useRef<SVGSVGElement | null>(null);
    const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);
    const [editingTextContent, setEditingTextContent] = useState<string>("");
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [selectedColor, setSelectedColor] = useState<string>("#3b82f6");
    const [showToolInstruction, setShowToolInstruction] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [toolInstructionContent, setToolInstructionContent] = useState<{
        name: string;
        description: string;
        shortcut: string;
        icon: React.ComponentType<any>;
    }>({ name: "", description: "", shortcut: "", icon: MousePointer });

    // Enhanced responsive canvas dimensions
    const [canvasWidth, setCanvasWidth] = useState(800);
    const [canvasHeight, setCanvasHeight] = useState(500);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Interactive hints state
    const [showInteractiveHints, setShowInteractiveHints] = useState(false);
    const [hintIndex, setHintIndex] = useState(0);
    const [userInteractions, setUserInteractions] = useState(0);

    const interactiveHints = [
        { icon: Hand, text: "Try drawing here!", position: { x: 120, y: 180 } },
        { icon: ArrowRight, text: "Click tools to explore", position: { x: 280, y: 120 } },
        { icon: Lightbulb, text: "Add your ideas!", position: { x: 180, y: 280 } },
        { icon: Hand, text: "Pan and zoom around", position: { x: 150, y: 220 } },
        { icon: ArrowRight, text: "Use keyboard shortcuts", position: { x: 250, y: 150 } },
        { icon: Lightbulb, text: "Change colors with picker", position: { x: 200, y: 300 } },
    ];

    // Update canvas dimensions and device detection based on screen size
    useEffect(() => {
        const updateCanvasDimensions = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const vh90 = screenHeight * 0.9;
            
            // Device detection
            setIsMobile(screenWidth < 640);
            setIsTablet(screenWidth >= 640 && screenWidth < 1024);
            
            if (screenWidth < 480) { // small mobile
                setCanvasWidth(Math.min(screenWidth - 16, 320));
                setCanvasHeight(Math.min(vh90 - 160, 400));
            } else if (screenWidth < 640) { // mobile
                setCanvasWidth(Math.min(screenWidth - 24, 400));
                setCanvasHeight(Math.min(vh90 - 140, 450));
            } else if (screenWidth < 768) { // tablet
                setCanvasWidth(Math.min(screenWidth - 48, 600));
                setCanvasHeight(Math.min(vh90 - 120, 550));
            } else if (screenWidth < 1024) { // small desktop
                setCanvasWidth(Math.min(screenWidth - 64, 700));
                setCanvasHeight(Math.min(vh90 - 100, 650));
            } else if (screenWidth < 1280) { // desktop
                setCanvasWidth(Math.min(screenWidth - 80, 800));
                setCanvasHeight(Math.min(vh90 - 80, 700));
            } else { // large desktop
                setCanvasWidth(Math.min(screenWidth - 96, 900));
                setCanvasHeight(Math.min(vh90 - 60, 750));
            }
        };

        updateCanvasDimensions();
        window.addEventListener('resize', updateCanvasDimensions);
        return () => window.removeEventListener('resize', updateCanvasDimensions);
    }, []);

    // Show interactive hints immediately and keep them visible
    useEffect(() => {
        setShowInteractiveHints(true);
    }, []);

    // Rotate through hints continuously
    useEffect(() => {
        const interval = setInterval(() => {
            setHintIndex((prev) => (prev + 1) % interactiveHints.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [interactiveHints.length]);

    const { toolbarItems, colorPalettes } = useWhiteboardTools(activeTool);

    const {
        isDrawing,
        currentPath,
        lastPoint,
        isPanning,
        isDragging,
        hoveredElementId,
        setIsDrawing,
        setCurrentPath,
        setLastPoint,
        setIsPanning,
        setHoveredElementId,
        getCanvasCoordinates,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        handleDeleteElement,
    } = useCanvasInteraction({
        activeTool,
        zoomLevel,
        panOffset,
        selectedColor,
        canvasElements,
        selectedElement,
        setCanvasElements,
        setDrawingPaths,
        setSelectedElement,
        setEditingTextElementId,
        setEditingTextContent,
        canvasRef,
        canvasWidth,
        canvasHeight,
        setPanOffset,
    });

    const mockCollaborators: Cursor[] = useMemo(
        () => [
            {
                id: "user1",
                name: "Akash Pandey",
                color: "#3b82f6",
                x: 150,
                y: 180,
                avatar: "https://plus.unsplash.com/premium_photo-1746417461105-51b89a61907f?q=80&w=1006&auto=format&fit=crop&ixlib=rb-4.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                isActive: true,
            },
            {
                id: "user2",
                name: "Rajendra Patel",
                color: "#10b981",
                x: 320,
                y: 140,
                avatar: "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1496&auto=format&fit=crop&ixlib=rb-4.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                isActive: true,
            },
            {
                id: "user3",
                name: "Ravi Shrivastava",
                color: "#8b5cf6",
                x: 250,
                y: 280,
                avatar: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                isActive: false,
            },
        ],
        []
    );

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
                id: "demo-path-2",
                path: "M10 300 C 100 200 200 400 300 300 S 400 200 500 400 S 600 200 700 400 L 750 350 C 650 250 550 450 450 350 S 350 250 250 450 S 150 250 50 450 L 10 300",
                color: "#3b82f6",
                strokeWidth: 2.5,
                user: "user2",
                timestamp: Date.now() + 1000,
                opacity: 0.85,
            }
        ];
        setDrawingPaths(demoPaths);
    }, [mockCollaborators]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCollaborators((prev) =>
                prev.map((collab) => ({
                    ...collab,
                    x: Math.max(50, Math.min(canvasWidth - 50, collab.x + (Math.random() - 0.5) * 40)),
                    y: Math.max(50, Math.min(canvasHeight - 50, collab.y + (Math.random() - 0.5) * 40)),
                    isActive: Math.random() > 0.2,
                }))
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [canvasWidth, canvasHeight]);

    const handleToolSelect = useCallback((index: number) => {
        setActiveTool(index);
        setSelectedElement(null);
        
        // Cycle hint when user interacts with tools
        setHintIndex((prev) => (prev + 1) % interactiveHints.length);
        
        const selectedTool = toolbarItems[index];
        if (selectedTool) {
            if (index === 10) {
                setShowColorPicker(true);
                setShowToolInstruction(false);
            } else {
                setShowColorPicker(false);
                setToolInstructionContent({
                    name: selectedTool.name,
                    description: selectedTool.description || "",
                    shortcut: selectedTool.shortcut || "",
                    icon: selectedTool.icon,
                });
                setShowToolInstruction(true);
                setTimeout(() => {
                    setShowToolInstruction(false);
                }, isMobile ? 5000 : 7000);
            }
        }
    }, [toolbarItems, isMobile, interactiveHints.length]);

    const handleElementSelect = useCallback(
        (elementId: string) => {
            setSelectedElement(selectedElement === elementId ? null : elementId);
            setEditingTextElementId(null);
            
            // Cycle hint when user selects elements
            setHintIndex((prev) => (prev + 1) % interactiveHints.length);
        },
        [selectedElement, interactiveHints.length]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const shortcuts = ["p", "c", "r", "t", "s", "n", "x", "i", "h", "e", "o"];
            const index = shortcuts.indexOf(e.key.toLowerCase());
            if (index !== -1) {
                handleToolSelect(index);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleToolSelect]);

    return (
          <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 canvas-container" 
             style={{ 
                 height: isMobile ? '85vh' : isTablet ? '88vh' : '92vh',
                 minHeight: isMobile ? '500px' : isTablet ? '600px' : '700px'
             }}>
            <div className="relative overflow-hidden h-full flex flex-col rounded-xl">
                <WhiteboardHeader
                    zoomLevel={zoomLevel}
                    setZoomLevel={setZoomLevel}
                    collaborators={collaborators}
                    isMobile={isMobile}
                    isTablet={isTablet}
                />

                <div className="flex-1 relative overflow-hidden">
                    <WhiteboardCanvas
                        canvasRef={canvasRef}
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        zoomLevel={zoomLevel}
                        panOffset={panOffset}
                        activeTool={activeTool}
                        drawingPaths={drawingPaths}
                        currentPath={currentPath}
                        canvasElements={canvasElements}
                        selectedColor={selectedColor}
                        selectedElement={selectedElement}
                        editingTextElementId={editingTextElementId}
                        editingTextContent={editingTextContent}
                        collaborators={collaborators}
                        hoveredElementId={hoveredElementId}
                        handleCanvasMouseDown={handleCanvasMouseDown}
                        handleCanvasMouseMove={handleCanvasMouseMove}
                        handleCanvasMouseUp={handleCanvasMouseUp}
                        setEditingTextContent={setEditingTextContent}
                        setEditingTextElementId={setEditingTextElementId}
                        setCanvasElements={setCanvasElements}
                        handleElementSelect={handleElementSelect}
                        setHoveredElementId={setHoveredElementId}
                        setSelectedElement={setSelectedElement}
                        isPanning={isPanning}
                        isDragging={isDragging}
                        isMobile={isMobile}
                        isTablet={isTablet}
                    />

                    {/* Interactive Floating Hints - Always Visible */}
                    <div className="absolute inset-0 pointer-events-none z-20">
                        {interactiveHints.map((hint, index) => (
                            <motion.div
                                key={index}
                                className="absolute"
                                style={{
                                    left: `${hint.position.x}px`,
                                    top: `${hint.position.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ 
                                    opacity: index === hintIndex ? 1 : 0,
                                    scale: index === hintIndex ? 1 : 0.8,
                                    y: index === hintIndex ? 0 : 20
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                            >
                                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <hint.icon className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {hint.text}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <ColorPickerDialog
                    showColorPicker={showColorPicker}
                    setShowColorPicker={setShowColorPicker}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colorPalettes={colorPalettes}
                    isMobile={isMobile}
                    isTablet={isTablet}
                />

                <ToolInstructionDialog
                    showToolInstruction={showToolInstruction}
                    setShowToolInstruction={setShowToolInstruction}
                    toolInstructionContent={toolInstructionContent}
                    isMobile={isMobile}
                    isTablet={isTablet}
                />

                <WhiteboardToolbar
                    toolbarItems={toolbarItems}
                    activeTool={activeTool}
                    selectedColor={selectedColor}
                    selectedElement={selectedElement}
                    handleToolSelect={handleToolSelect}
                    handleDeleteElement={handleDeleteElement}
                    isMobile={isMobile}
                    isTablet={isTablet}
                />
            </div>

            <style jsx>{`
        /* Enhanced glassmorphism effects with better performance */
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

        /* Optimized scrollbars for better mobile experience */
        ::-webkit-scrollbar {
          width: ${isMobile ? '4px' : '6px'};
          height: ${isMobile ? '4px' : '6px'};
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: ${isMobile ? '2px' : '3px'};
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: ${isMobile ? '2px' : '3px'};
          transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        /* Dialog specific scrollbars */
        .dialog-scrollbar::-webkit-scrollbar {
          width: ${isMobile ? '3px' : '4px'};
        }

        .dialog-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: ${isMobile ? '1.5px' : '2px'};
        }

        .dialog-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: ${isMobile ? '1.5px' : '2px'};
        }

        .dialog-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }

        /* Enhanced focus states for better accessibility */
        button:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.6);
          outline-offset: ${isMobile ? '1px' : '2px'};
        }

        /* Improved text selection styling */
        ::selection {
          background-color: rgba(59, 130, 246, 0.2);
          color: rgba(59, 130, 246, 1);
        }

        /* Prevent text selection on canvas with better touch handling */
        .canvas-container {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          touch-action: manipulation;
        }

        /* Enhanced touch interactions for mobile */
        .canvas-container * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          touch-action: manipulation;
        }

        /* Optimized transitions for better performance */
        * {
          transition: all 0.2s ease-in-out;
        }

        /* Responsive height handling */
        .whiteboard-container {
          height: ${isMobile ? '85vh' : isTablet ? '88vh' : '92vh'};
          max-height: ${isMobile ? '85vh' : isTablet ? '88vh' : '92vh'};
          min-height: ${isMobile ? '500px' : isTablet ? '600px' : '700px'};
        }

        /* Remove borders and outlines from canvas elements */
        .canvas-container svg,
        .canvas-container div {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        .canvas-container svg:focus,
        .canvas-container div:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        .canvas-container svg:hover,
        .canvas-container div:hover {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .canvas-container {
            touch-action: manipulation;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Reduce animation complexity on mobile */
          * {
            transition: all 0.15s ease-in-out;
          }
        }

        /* Tablet-specific optimizations */
        @media (min-width: 641px) and (max-width: 1023px) {
          .canvas-container {
            touch-action: manipulation;
          }
        }

        /* Desktop-specific enhancements */
        @media (min-width: 1024px) {
          .canvas-container {
            touch-action: auto;
          }
        }

        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .canvas-container svg {
            shape-rendering: geometricPrecision;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
        </div>
    );
};

export default RealtimeWhiteboard;