// src/components/whiteboard/RealtimeWhiteboard.tsx

"use client";

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import WhiteboardCanvas from "./WhiteboardCanvas";
import WhiteboardHeader from "./WhiteboardHeader";
import WhiteboardToolbar from "./WhiteboardToolbar";
import ColorPickerDialog from "./ColorPickerDialog";
import ToolInstructionDialog from "./ToolInstructionDialog";
import { Cursor, CanvasElement, DrawingPath } from "./types";
import { useWhiteboardTools } from "./hooks/useWhiteboardTools";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { MousePointer } from "lucide-react"; 

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

    // Responsive canvas dimensions
    const [canvasWidth, setCanvasWidth] = useState(800);
    const [canvasHeight, setCanvasHeight] = useState(500);

    // Update canvas dimensions based on screen size
    useEffect(() => {
        const updateCanvasDimensions = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const vh85 = screenHeight * 0.85;
            
            if (screenWidth < 640) { // mobile
                setCanvasWidth(Math.min(screenWidth - 32, 350));
                setCanvasHeight(Math.min(vh85 - 200, 400));
            } else if (screenWidth < 768) { // tablet
                setCanvasWidth(Math.min(screenWidth - 64, 600));
                setCanvasHeight(Math.min(vh85 - 180, 500));
            } else if (screenWidth < 1024) { // small desktop
                setCanvasWidth(Math.min(screenWidth - 96, 700));
                setCanvasHeight(Math.min(vh85 - 160, 600));
            } else { // large desktop
                setCanvasWidth(800);
                setCanvasHeight(Math.min(vh85 - 140, 700));
            }
        };

        updateCanvasDimensions();
        window.addEventListener('resize', updateCanvasDimensions);
        return () => window.removeEventListener('resize', updateCanvasDimensions);
    }, []);

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
        const selectedTool = toolbarItems[index];
        if (selectedTool) {
            if (index === 9) {
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
                }, 7000);
            }
        }
    }, [toolbarItems]);

    const handleElementSelect = useCallback(
        (elementId: string) => {
            setSelectedElement(selectedElement === elementId ? null : elementId);
            setEditingTextElementId(null);
        },
        [selectedElement]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const shortcuts = ["p", "c", "r", "t", "s", "n", "x", "h", "e", "o"];
            const index = shortcuts.indexOf(e.key.toLowerCase());
            if (index !== -1) {
                setActiveTool(index);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-0 canvas-container whiteboard-container" style={{ height: '85vh' }}>
            <div className="relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 overflow-hidden h-full flex flex-col">
                <WhiteboardHeader
                    zoomLevel={zoomLevel}
                    setZoomLevel={setZoomLevel}
                    collaborators={collaborators}
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
                    />
                </div>

                <ColorPickerDialog
                    showColorPicker={showColorPicker}
                    setShowColorPicker={setShowColorPicker}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    colorPalettes={colorPalettes}
                />

                <ToolInstructionDialog
                    showToolInstruction={showToolInstruction}
                    setShowToolInstruction={setShowToolInstruction}
                    toolInstructionContent={toolInstructionContent}
                />

                <WhiteboardToolbar
                    toolbarItems={toolbarItems}
                    activeTool={activeTool}
                    selectedColor={selectedColor}
                    selectedElement={selectedElement}
                    handleToolSelect={handleToolSelect}
                    handleDeleteElement={handleDeleteElement}
                />
            </div>

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

        /* Custom scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
          transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        /* Dialog specific scrollbars */
        .dialog-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .dialog-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 2px;
        }

        .dialog-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 2px;
        }

        .dialog-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.6);
        }

        /* Focus states for accessibility */
        button:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.6);
          outline-offset: 2px;
        }

        /* Text selection styling */
        ::selection {
          background-color: rgba(59, 130, 246, 0.2);
          color: rgba(59, 130, 246, 1);
        }

        /* Prevent text selection on canvas */
        .canvas-container {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Improve touch interactions */
        .canvas-container * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Smooth transitions for better UX */
        * {
          transition: all 0.2s ease-in-out;
        }

        /* Ensure proper height handling */
        .whiteboard-container {
          height: 85vh;
          max-height: 85vh;
          min-height: 400px;
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
      `}</style>
        </div>
    );
};

export default RealtimeWhiteboard;