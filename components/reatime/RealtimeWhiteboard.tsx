// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   PenTool,
//   Circle,
//   Square,
//   MessageSquare,
//   Type,
//   MousePointer,
//   Users,
//   Share2,
//   Wifi,
//   Save,
//   Triangle,
//   Star,
//   Move,
//   RotateCcw,
//   Copy,
//   Trash2,
//   ZoomIn,
//   ZoomOut,
//   Hand,
//   Eraser,
//   Palette,
//   Layers,
//   Grid3X3,
//   Eye,
//   EyeOff,
//   Settings,
//   Maximize2,
//   Minimize2,
//   Download,
//   Upload,
//   MoreHorizontal,
//   Sparkles,
//   Wand2,
//   Crosshair,
// } from "lucide-react";

// interface Cursor {
//   id: string;
//   name: string;
//   color: string;
//   x: number;
//   y: number;
//   avatar: string;
//   isActive: boolean;
// }

// interface ToolbarItem {
//   icon: React.ComponentType<any>;
//   color: string;
//   gradient: string[];
//   theme: string;
//   active: boolean;
//   name: string;
//   shortcut?: string;
//   description?: string;
//   isFunctional: boolean;
// }

// interface DrawingPath {
//   id: string;
//   path: string;
//   color: string;
//   strokeWidth: number;
//   user: string;
//   opacity?: number;
//   dashArray?: string;
//   timestamp: number;
// }

// interface CanvasElement {
//   id: string;
//   type: "circle" | "rectangle" | "triangle" | "star" | "note" | "text";
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   radius?: number;
//   color: string;
//   content?: string;
//   selected?: boolean;
//   opacity?: number;
//   rotation?: number;
//   strokeWidth?: number;
//   strokeColor?: string;
//   timestamp: number;
// }

// interface ColorPalette {
//   name: string;
//   colors: string[];
//   gradients: string[];
// }

// const ReatimeWhiteboardMock: React.FC = () => {
//   const [activeTool, setActiveTool] = useState(0);
//   const [collaborators, setCollaborators] = useState<Cursor[]>([]);
//   const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
//   const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [zoomLevel, setZoomLevel] = useState(100);
//   const [selectedElement, setSelectedElement] = useState<string | null>(null);
//   const canvasRef = useRef<SVGSVGElement>(null);
//   const [currentPath, setCurrentPath] = useState<string>("");
//   const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
//     null
//   );
//   const canvasWidth = 800;
//   const canvasHeight = 500;
//   const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);
//   const [editingTextContent, setEditingTextContent] = useState<string>("");
//   const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
//   const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
//   const [isPanning, setIsPanning] = useState(false);
//   const [selectedColor, setSelectedColor] = useState<string>("#3b82f6"); // Default color: blue
//   const [showToolInstruction, setShowToolInstruction] = useState(false);
//   const [showColorPicker, setShowColorPicker] = useState(false);
//   const [toolInstructionContent, setToolInstructionContent] = useState<{
//     name: string;
//     description: string;
//     shortcut: string;
//     icon: React.ComponentType<any>; // Add icon to the state
//   }>({ name: "", description: "", shortcut: "", icon: MousePointer }); // Default icon

//   // Simplified collaborator data
//   const mockCollaborators: Cursor[] = useMemo(
//     () => [
//       {
//         id: "user1",
//         name: "Sarah",
//         color: "#3b82f6",
//         x: 150,
//         y: 180,
//         avatar:
//           "https://plus.unsplash.com/premium_photo-1746417461105-51b89a61907f?q=80&w=1006&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         isActive: true,
//       },
//       {
//         id: "user2",
//         name: "Alex",
//         color: "#10b981",
//         x: 320,
//         y: 140,
//         avatar:
//           "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?q=80&w=1496&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         isActive: true,
//       },
//       {
//         id: "user3",
//         name: "Jordan",
//         color: "#8b5cf6",
//         x: 250,
//         y: 280,
//         avatar:
//           "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         isActive: false,
//       },
//     ],
//     []
//   );

//   // Enhanced aesthetic color palettes
//   const colorPalettes: ColorPalette[] = useMemo(() => [
//     {
//       name: "Ocean",
//       colors: ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
//       gradients: ["from-sky-400", "to-blue-600"]
//     },
//     {
//       name: "Forest",
//       colors: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
//       gradients: ["from-emerald-400", "to-green-600"]
//     },
//     {
//       name: "Sunset",
//       colors: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
//       gradients: ["from-amber-400", "to-orange-600"]
//     },
//     {
//       name: "Lavender",
//       colors: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
//       gradients: ["from-violet-400", "to-purple-600"]
//     },
//     {
//       name: "Rose",
//       colors: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
//       gradients: ["from-pink-400", "to-rose-600"]
//     }
//   ], []);

//   // Modern toolbar design with enhanced aesthetics
//   const toolbarItems: ToolbarItem[] = useMemo(
//     () => [
//       {
//         icon: PenTool,
//         color: "#3b82f6",
//         gradient: ["from-blue-400", "to-blue-600"],
//         theme: "blue",
//         active: activeTool === 0,
//         name: "Draw",
//         shortcut: "P",
//         description: "Click and drag to draw freehand lines on the canvas.",
//         isFunctional: true,
//       },
//       {
//         icon: Circle,
//         color: "#10b981",
//         gradient: ["from-emerald-400", "to-green-600"],
//         theme: "emerald",
//         active: activeTool === 1,
//         name: "Circle",
//         shortcut: "C",
//         description: "Click and drag to create perfect circles. Hold Shift for proportional circles.",
//         isFunctional: true,
//       },
//       {
//         icon: Square,
//         color: "#8b5cf6",
//         gradient: ["from-violet-400", "to-purple-600"],
//         theme: "violet",
//         active: activeTool === 2,
//         name: "Rectangle",
//         shortcut: "R",
//         description: "Click and drag to draw rectangles. Hold Shift for perfect squares.",
//         isFunctional: true,
//       },
//       {
//         icon: Triangle,
//         color: "#f59e0b",
//         gradient: ["from-amber-400", "to-orange-600"],
//         theme: "amber",
//         active: activeTool === 3,
//         name: "Triangle",
//         shortcut: "T",
//         description: "Triangular shapes are not yet implemented.",
//         isFunctional: false, // Explicitly set to false as it's a placeholder
//       },
//       {
//         icon: Star,
//         color: "#ec4899",
//         gradient: ["from-pink-400", "to-rose-600"],
//         theme: "pink",
//         active: activeTool === 4,
//         name: "Star",
//         shortcut: "S",
//         description: "Star shapes are not yet implemented.",
//         isFunctional: false, // Explicitly set to false as it's a placeholder
//       },
//       {
//         icon: MessageSquare,
//         color: "#ef4444",
//         gradient: ["from-red-400", "to-red-600"],
//         theme: "red",
//         active: activeTool === 5,
//         name: "Note",
//         shortcut: "N",
//         description: "Click anywhere on the canvas to add a new sticky note. You can then type your content inside it.",
//         isFunctional: true,
//       },
//       {
//         icon: Type,
//         color: "#6366f1",
//         gradient: ["from-indigo-400", "to-indigo-600"],
//         theme: "indigo",
//         active: activeTool === 6,
//         name: "Text",
//         shortcut: "X",
//         description: "Click anywhere to add a text box. Double-click to edit the text.",
//         isFunctional: true,
//       },
//       {
//         icon: Hand,
//         color: "#64748b",
//         gradient: ["from-slate-400", "to-slate-600"],
//         theme: "slate",
//         active: activeTool === 7,
//         name: "Pan",
//         shortcut: "H",
//         description: "Click and drag the canvas to move your view around.",
//         isFunctional: true, // Now functional
//       },
//       {
//         icon: Eraser,
//         color: "#dc2626",
//         gradient: ["from-red-500", "to-red-700"],
//         theme: "red",
//         active: activeTool === 8,
//         name: "Eraser",
//         shortcut: "E",
//         description: "Click on any drawing path or element to erase it from the canvas.",
//         isFunctional: true,
//       },
//       {
//         icon: Palette,
//         color: "#facc15",
//         gradient: ["from-yellow-400", "to-yellow-600"],
//         theme: "yellow",
//         active: activeTool === 9,
//         name: "Color Picker",
//         shortcut: "O",
//         description: "Select an active color from the palette. This color will be used for new drawings, shapes, and notes.",
//         isFunctional: true, // Functional as a picker
//       },
//     ],
//     [activeTool]
//   );

//   // Initialize demo content
//   useEffect(() => {
//     setCollaborators(mockCollaborators);

//     const demoElements: CanvasElement[] = [
//       {
//         id: "demo-circle-1",
//         type: "circle",
//         x: 160,
//         y: 150,
//         radius: 35,
//         color: "#3b82f6",
//         timestamp: Date.now(),
//         opacity: 0.9,
//       },
//       {
//         id: "demo-rect-1",
//         type: "rectangle",
//         x: 280,
//         y: 120,
//         width: 80,
//         height: 60,
//         color: "#10b981",
//         timestamp: Date.now() + 1,
//         opacity: 0.9,
//       },
//       {
//         id: "demo-note-1",
//         type: "note",
//         x: 200,
//         y: 240,
//         width: 120,
//         height: 80,
//         color: "#8b5cf6",
//         content: "Great ideas! 💡",
//         timestamp: Date.now() + 2,
//         opacity: 0.95,
//       },
//     ];
//     setCanvasElements(demoElements);

//     const demoPaths: DrawingPath[] = [
//       {
//         id: "demo-path-1",
//         path: "M100 200 Q150 150 200 200 Q250 250 300 200",
//         color: "#3b82f6",
//         strokeWidth: 3,
//         user: "user1",
//         timestamp: Date.now(),
//         opacity: 0.8,
//       },
//     ];
//     setDrawingPaths(demoPaths);
//     // Removed the line that was resetting selectedColor to toolbarItems[0].color
//   }, [mockCollaborators]); // Removed toolbarItems from dependencies

//   // Subtle collaboration simulation
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCollaborators((prev) =>
//         prev.map((collab) => ({
//           ...collab,
//           x: Math.max(50, Math.min(450, collab.x + (Math.random() - 0.5) * 30)),
//           y: Math.max(50, Math.min(350, collab.y + (Math.random() - 0.5) * 30)),
//           isActive: Math.random() > 0.3,
//         }))
//       );
//     }, 4000);

//     return () => clearInterval(interval);
//   }, []);

//   // Get accurate canvas coordinates
//   const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };

//     const rect = canvas.getBoundingClientRect();
//     // Adjust coordinates based on zoom level and pan offset
//     const displayWidth = canvasWidth * (zoomLevel / 100);
//     const displayHeight = canvasHeight * (zoomLevel / 100);

//     const offsetX = (rect.width - displayWidth) / 2;
//     const offsetY = (rect.height - displayHeight) / 2;

//     const scaleX = canvasWidth / displayWidth;
//     const scaleY = canvasHeight / displayHeight;

//     return {
//       x: ((e.clientX - rect.left - offsetX) * scaleX) - panOffset.x,
//       y: ((e.clientY - rect.top - offsetY) * scaleY) - panOffset.y,
//     };
//   }, [zoomLevel, panOffset]);

//   const handleToolSelect = useCallback((index: number) => {
//     setActiveTool(index);
//     setSelectedElement(null);
//     const selectedTool = toolbarItems[index];
//     if (selectedTool) {
//       if (index === 9) { // Color picker tool
//         setShowColorPicker(true);
//         setShowToolInstruction(false);
//       } else {
//         setShowColorPicker(false);
//         setToolInstructionContent({
//           name: selectedTool.name,
//           description: selectedTool.description || "",
//           shortcut: selectedTool.shortcut || "",
//           icon: selectedTool.icon, // Pass the icon
//         });
//         setShowToolInstruction(true);
//         setTimeout(() => {
//           setShowToolInstruction(false);
//         }, 7000); // 7 seconds timeout
//       }
//     }
//   }, [toolbarItems]);

//   const handleElementSelect = useCallback(
//     (elementId: string) => {
//       setSelectedElement(selectedElement === elementId ? null : elementId);
//       setEditingTextElementId(null); // Exit text editing mode on element select change
//     },
//     [selectedElement]
//   );

//   // Fixed drawing handlers
//   const handleCanvasMouseDown = useCallback(
//     (e: React.MouseEvent) => {
//       const coords = getCanvasCoordinates(e);
//       if (activeTool === 0) {
//         // Drawing tool
//         setIsDrawing(true);
//         setLastPoint(coords);
//         setCurrentPath(`M${coords.x} ${coords.y}`);
//       } else if (activeTool >= 1 && activeTool <= 4) { // Shape tools (Circle, Square, Triangle, Star)
//         // For shape creation, store initial click position
//         setLastPoint(coords);
//         setIsDrawing(true); // Re-using isDrawing for shape creation as well
//       } else if (activeTool === 5) { // Sticky Note tool
//         const newNote: CanvasElement = {
//           id: `note-${Date.now()}`,
//           type: "note",
//           x: coords.x,
//           y: coords.y,
//           width: 150, // Default width
//           height: 100, // Default height
//           color: selectedColor, // Use selected color
//           content: "New Note",
//           opacity: 0.95,
//           timestamp: Date.now(),
//         };
//         setCanvasElements((prev) => [...prev, newNote]);
//         setSelectedElement(newNote.id);
//         setIsDrawing(false); // Notes are single-click, no dragging to draw
//       } else if (activeTool === 6) { // Text tool
//         if (!selectedElement || canvasElements.find(el => el.id === selectedElement)?.type !== "note") {
//           const newTextElement: CanvasElement = {
//             id: `text-${Date.now()}`,
//             type: "text",
//             x: coords.x,
//             y: coords.y,
//             color: selectedColor, // Use selected color
//             content: "New Text",
//             opacity: 0.9,
//             timestamp: Date.now(),
//           };
//           setCanvasElements((prev) => [...prev, newTextElement]);
//           setSelectedElement(newTextElement.id);
//           setEditingTextElementId(newTextElement.id); // Immediately enter edit mode
//           setEditingTextContent(newTextElement.content || "");
//           setIsDrawing(false); // Text is single-click, no dragging to draw
//         } else if (selectedElement && canvasElements.find(el => el.id === selectedElement)?.type === "note") {
//           const element = canvasElements.find(el => el.id === selectedElement);
//           if (element && element.type === "note") {
//             setEditingTextElementId(element.id);
//             setEditingTextContent(element.content || "");
//           }
//         }
//       } else if (activeTool === 7) { // Pan tool
//         setIsPanning(true);
//         setLastPoint({ x: e.clientX, y: e.clientY }); // Store client coordinates for panning
//       } else if (activeTool === 8) { // Eraser tool
//         // Check if a path or element is clicked for deletion
//         const clickedPath = drawingPaths.find(p => {
//           const pathElement = document.getElementById(p.id);
//           if (pathElement instanceof SVGPathElement && canvasRef.current) {
//             const svgPoint = canvasRef.current.createSVGPoint();
//             svgPoint.x = e.clientX;
//             svgPoint.y = e.clientY;
//             const CTM = canvasRef.current.getScreenCTM()?.inverse();
//             if (CTM) {
//               const transformedPoint = svgPoint.matrixTransform(CTM);
//               // Use isPointInStroke for more accurate hit testing
//               // We need to account for stroke width for a better eraser feel
//               // For simplicity in a mock, checking directly on stroke is a good start.
//               return pathElement.isPointInStroke(transformedPoint);
//             }
//           }
//           return false;
//         });

//         if (clickedPath) {
//           setDrawingPaths(prev => prev.filter(p => p.id !== clickedPath.id));
//           return;
//         }

//         const clickedElement = canvasElements.find(el => {
//           // For simple shapes, check if click is within their bounds
//           const transformedElX = (el.x + panOffset.x) * (zoomLevel / 100);
//           const transformedElY = (el.y + panOffset.y) * (zoomLevel / 100);

//           if (el.type === 'circle' && el.radius) {
//             const transformedRadius = el.radius * (zoomLevel / 100);
//             const dist = Math.sqrt(Math.pow(e.clientX - transformedElX, 2) + Math.pow(e.clientY - transformedElY, 2));
//             return dist <= transformedRadius;
//           }
//           if ((el.type === 'rectangle' || el.type === 'note' || el.type === 'triangle' || el.type === 'star') && el.width && el.height) {
//             const transformedWidth = el.width * (zoomLevel / 100);
//             const transformedHeight = el.height * (zoomLevel / 100);
//             return e.clientX >= transformedElX && e.clientX <= transformedElX + transformedWidth &&
//               e.clientY >= transformedElY && e.clientY <= transformedElY + transformedHeight;
//           }
//           return false;
//         });

//         if (clickedElement) {
//           setCanvasElements(prev => prev.filter(el => el.id !== clickedElement.id));
//           setSelectedElement(null);
//           setEditingTextElementId(null);
//         }
//       } else if (selectedElement) {
//         // Allow dragging selected elements
//         const element = canvasElements.find(el => el.id === selectedElement);
//         if (element) {
//           setLastPoint({ x: e.clientX, y: e.clientY }); // Store client coordinates for dragging
//         }
//       } else {
//         setSelectedElement(null);
//       }
//     },
//     [activeTool, getCanvasCoordinates, selectedElement, canvasElements, drawingPaths, canvasRef, panOffset, zoomLevel, selectedColor, toolbarItems]
//   );

//   const handleCanvasMouseMove = useCallback(
//     (e: React.MouseEvent) => {
//       const coords = getCanvasCoordinates(e);

//       if (isDrawing && activeTool === 0 && lastPoint) {
//         // Drawing tool
//         const midX = (lastPoint.x + coords.x) / 2;
//         const midY = (lastPoint.y + coords.y) / 2;
//         setCurrentPath(
//           (prev) => `${prev} Q${lastPoint.x} ${lastPoint.y} ${midX} ${midY}`
//         );
//         setLastPoint(coords);
//       } else if (isDrawing && activeTool >= 1 && activeTool <= 4 && lastPoint) { // Shape tools
//         const startX = lastPoint.x;
//         const startY = lastPoint.y;
//         const currentX = coords.x;
//         const currentY = coords.y;

//         setCanvasElements((prevElements) => {
//           const newElements = prevElements.filter(el => el.id !== 'temp-shape');
//           const width = Math.abs(currentX - startX);
//           const height = Math.abs(currentY - startY);
//           const tempColor = selectedColor; // Use selected color

//           let newShape: CanvasElement | null = null;

//           if (activeTool === 1) { // Circle
//             const radius = Math.sqrt(width * width + height * height) / 2;
//             const centerX = Math.min(startX, currentX) + width / 2;
//             const centerY = Math.min(startY, currentY) + height / 2;
//             newShape = {
//               id: 'temp-shape',
//               type: 'circle',
//               x: centerX,
//               y: centerY,
//               radius: radius,
//               color: tempColor,
//               opacity: 0.9,
//               timestamp: Date.now(),
//             };
//           } else if (activeTool === 2) { // Rectangle
//             newShape = {
//               id: 'temp-shape',
//               type: 'rectangle',
//               x: Math.min(startX, currentX),
//               y: Math.min(startY, currentY),
//               width: width,
//               height: height,
//               color: tempColor,
//               opacity: 0.9,
//               timestamp: Date.now(),
//             };
//           } else if (activeTool === 3) { // Triangle - Simplified placeholder
//             newShape = {
//               id: 'temp-shape',
//               type: 'triangle',
//               x: Math.min(startX, currentX),
//               y: Math.min(startY, currentY),
//               width: width,
//               height: height,
//               color: tempColor,
//               opacity: 0.9,
//               timestamp: Date.now(),
//             };
//           } else if (activeTool === 4) { // Star - Simplified placeholder
//             newShape = {
//               id: 'temp-shape',
//               type: 'star',
//               x: Math.min(startX, currentX),
//               y: Math.min(startY, currentY),
//               width: width,
//               height: height,
//               color: tempColor,
//               opacity: 0.9,
//               timestamp: Date.now(),
//             };
//           }
//           return newShape ? [...newElements, newShape] : newElements;
//         });

//       } else if (isPanning && lastPoint) { // Pan tool
//         const dx = e.clientX - lastPoint.x;
//         const dy = e.clientY - lastPoint.y;
//         setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
//         setLastPoint({ x: e.clientX, y: e.clientY });
//       } else if (selectedElement && lastPoint) {
//         // Dragging an element
//         const dx = e.clientX - lastPoint.x;
//         const dy = e.clientY - lastPoint.y;

//         setCanvasElements((prevElements) =>
//           prevElements.map((el) =>
//             el.id === selectedElement
//               ? { ...el, x: el.x + dx / (zoomLevel / 100), y: el.y + dy / (zoomLevel / 100) } // Adjust for zoom
//               : el
//           )
//         );
//         setLastPoint({ x: e.clientX, y: e.clientY });
//       }
//     },
//     [isDrawing, activeTool, lastPoint, getCanvasCoordinates, selectedElement, canvasElements, toolbarItems, zoomLevel, isPanning, panOffset, selectedColor]
//   );

//   const handleCanvasMouseUp = useCallback(() => {
//     if (isDrawing) {
//       if (activeTool === 0 && currentPath) {
//         // Finalize drawing path
//         const newPath: DrawingPath = {
//           id: `path-${Date.now()}`,
//           path: currentPath,
//           color: selectedColor, // Use selected color
//           strokeWidth: 2,
//           user: "currentUser",
//           timestamp: Date.now(),
//           opacity: 0.9,
//         };
//         setDrawingPaths((prev) => [...prev, newPath]);
//         setCurrentPath("");
//         setLastPoint(null);
//       } else if (activeTool >= 1 && activeTool <= 4) { // Finalize shape creation
//         setCanvasElements((prevElements) =>
//           prevElements.map(el => {
//             if (el.id === 'temp-shape') {
//               return { ...el, id: `${el.type}-${Date.now()}`, color: selectedColor }; // Use selected color for new shapes
//             }
//             return el;
//           })
//         );
//       } else if (activeTool === 5 || activeTool === 6) {
//         // For sticky notes and text, no path/shape to finalize. Simply reset drawing state.
//         setCurrentPath("");
//         setLastPoint(null);
//       }
//     }
//     setIsDrawing(false);
//     setIsPanning(false); // End panning
//   }, [isDrawing, currentPath, toolbarItems, activeTool, selectedColor]);

//   const handleDeleteElement = useCallback(() => {
//     if (selectedElement) {
//       setCanvasElements((prevElements) =>
//         prevElements.filter((el) => el.id !== selectedElement)
//       );
//       setSelectedElement(null);
//       setEditingTextElementId(null);
//     }
//   }, [selectedElement]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       const shortcuts = ["p", "c", "r", "t", "s", "n", "x", "h", "e", "o"]; // Added 'o' for color picker
//       const index = shortcuts.indexOf(e.key.toLowerCase());
//       if (index !== -1) {
//         setActiveTool(index);
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   return (
//     <div className="relative w-full max-w-6xl mx-auto">
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//         {/* Enhanced Modern Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
//           <div className="flex items-center space-x-4">
//             <div className="flex space-x-2">
//               <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"></div>
//               <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm"></div>
//               <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-sm"></div>
//             </div>
//             <div className="flex items-center space-x-4">
//               {/* Simplified Header Logo/Title */}
//               <div className="flex items-center space-x-3">
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
//                   <div className="w-4 h-4 bg-white rounded-md opacity-90"></div>
//                 </div>
//                 <div>
//                   <div className="font-bold text-gray-800 text-base">CyperBoard</div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               {/* Minimal Zoom Controls */}
//               <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
//                 <button
//                   onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
//                   className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Zoom out"
//                 >
//                   <ZoomOut className="w-3 h-3" />
//                 </button>
//                 <span className="text-xs font-semibold text-gray-700 min-w-[35px] text-center">
//                   {zoomLevel}%
//                 </span>
//                 <button
//                   onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
//                   className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Zoom in"
//                 >
//                   <ZoomIn className="w-3 h-3" />
//                 </button>
//               </div>

//               {/* Clean Collaborators Display */}
//               <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md text-green-700 rounded-lg px-3 py-1.5 border border-green-100 shadow-sm">
//                 <div className="flex -space-x-1">
//                   {collaborators
//                     .filter((c) => c.isActive)
//                     .slice(0, 3) // Show max 3 avatars
//                     .map((user) => (
//                       <motion.div
//                         key={user.id}
//                         initial={{ scale: 0, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         exit={{ scale: 0, opacity: 0 }}
//                         className="w-6 h-6 rounded-full border border-white shadow-sm"
//                         style={{
//                           backgroundImage: `url(${user.avatar})`,
//                           backgroundSize: "cover",
//                           backgroundPosition: "center",
//                         }}
//                         title={user.name}
//                       />
//                     ))}
//                   {collaborators.filter((c) => c.isActive).length > 3 && (
//                     <div className="w-6 h-6 rounded-full border border-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">
//                       +{collaborators.filter((c) => c.isActive).length - 3}
//                     </div>
//                   )}
//                 </div>
//                 <Wifi className="w-3 h-3" />
//                 <span className="text-xs font-semibold">
//                   {collaborators.filter((c) => c.isActive).length} online
//                 </span>
//               </div>

//               {/* Simplified Additional Controls */}
//               <div className="flex items-center space-x-1">
//                 <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Grid view">
//                   <Grid3X3 className="w-3 h-3" />
//                 </button>
//                 <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Settings">
//                   <Settings className="w-3 h-3" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Canvas Area */}
//         <div className="relative h-[500px] bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
//           {/* Modern Grid with Depth */}
//           <div className="absolute inset-0">
//             <div
//               className="absolute inset-0"
//               style={{
//                 backgroundImage: `
//                   linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
//                   linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
//                 `,
//                 backgroundSize: "30px 30px, 30px 30px",
//                 opacity: 0.8, // Adjusted opacity for better visibility
//                 backgroundColor: '#fcfcfc', // Very light grey
//               }}
//             />
//           </div>

//           {/* SVG Canvas */}
//           <svg
//             ref={canvasRef}
//             className="absolute inset-0 w-full h-full"
//             viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
//             style={{
//               cursor: activeTool === 0
//                 ? "crosshair"
//                 : activeTool === 7
//                   ? (isPanning ? "grabbing" : "grab")
//                   : "default",
//               transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
//               transformOrigin: 'center center',
//             }}
//             onMouseDown={handleCanvasMouseDown}
//             onMouseMove={handleCanvasMouseMove}
//             onMouseUp={handleCanvasMouseUp}
//             onMouseLeave={handleCanvasMouseUp}
//           >
//             {/* Enhanced Drawing Paths */}
//             {drawingPaths.map((path) => (
//               <g key={path.id}>
//                 {/* Path shadow for depth */}
//                 <path
//                   d={path.path}
//                   stroke={path.color}
//                   strokeWidth={path.strokeWidth + 1}
//                   fill="none"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   opacity="0.1"
//                   transform="translate(1, 1)"
//                 />
//                 {/* Main path */}
//                 <path
//                   d={path.path}
//                   stroke={path.color}
//                   strokeWidth={path.strokeWidth}
//                   fill="none"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   opacity={path.opacity || 0.9}
//                   filter="none" // Removed glow filter
//                   className="transition-all duration-300 hover:opacity-100"
//                 />
//               </g>
//             ))}

//             {/* Enhanced Current Drawing Path */}
//             {currentPath && (
//               <g>
//                 {/* Real-time path with glow effect */}
//                 <path
//                   d={currentPath}
//                   stroke={selectedColor} // Use selected color
//                   strokeWidth="3"
//                   fill="none"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   opacity="0.9"
//                   filter="none" // Removed activeGlow filter
//                   className="animate-pulse"
//                 />
//               </g>
//             )}

//             {/* SVG Filters for Enhanced Effects */}
//             <defs>
//               <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
//                 <feGaussianBlur stdDeviation="2" result="coloredBlur" />
//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//               <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
//                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
//                 <feMerge>
//                   <feMergeNode in="coloredBlur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//               <filter id="elementShadow" x="-50%" y="-50%" width="200%" height="200%">
//                 <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
//               </filter>
//             </defs>

//             {/* Enhanced Canvas Elements */}
//             {canvasElements.map((element) => {
//               const isSelected = selectedElement === element.id;

//               // Adjust element position by panOffset for rendering
//               const renderX = element.x + panOffset.x;
//               const renderY = element.y + panOffset.y;

//               if (element.type === "circle") {
//                 return (
//                   <g key={element.id}>
//                     {/* Circle shadow */}
//                     <circle
//                       cx={renderX + 2}
//                       cy={renderY + 2}
//                       r={element.radius}
//                       fill={element.color}
//                       opacity="0.1"
//                     />
//                     {/* Main circle */}
//                     <circle
//                       cx={renderX}
//                       cy={renderY}
//                       r={element.radius}
//                       stroke={element.color}
//                       strokeWidth={isSelected ? "3" : "2"}
//                       fill={`url(#gradient-${element.id})`}
//                       className="cursor-pointer transition-all duration-300"
//                       onClick={() => handleElementSelect(element.id)}
//                       filter={isSelected ? "url(#elementShadow)" : "none"}
//                       opacity={element.opacity || 0.9}
//                       style={{
//                         strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id ? "4,2" : "none"),
//                         strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
//                         animationDuration: isSelected ? "2s" : "none",
//                         animationIterationCount: isSelected ? "infinite" : "none",
//                       }}
//                       onMouseEnter={() => setHoveredElementId(element.id)}
//                       onMouseLeave={() => setHoveredElementId(null)}
//                     />
//                     {/* Gradient definition */}
//                     <defs>
//                       <radialGradient id={`gradient-${element.id}`} cx="30%" cy="30%">
//                         <stop offset="0%" stopColor={`${element.color}40`} />
//                         <stop offset="70%" stopColor={`${element.color}20`} />
//                         <stop offset="100%" stopColor={`${element.color}10`} />
//                       </radialGradient>
//                     </defs>
//                   </g>
//                 );
//               }

//               if (element.type === "rectangle") {
//                 return (
//                   <g key={element.id}>
//                     {/* Rectangle shadow */}
//                     <rect
//                       x={renderX + 2}
//                       y={renderY + 2}
//                       width={element.width}
//                       height={element.height}
//                       rx="8"
//                       fill={element.color}
//                       opacity="0.1"
//                     />
//                     {/* Main rectangle */}
//                     <rect
//                       x={renderX}
//                       y={renderY}
//                       width={element.width}
//                       height={element.height}
//                       rx="8"
//                       stroke={element.color}
//                       strokeWidth={isSelected ? "3" : "2"}
//                       fill={`url(#rect-gradient-${element.id})`}
//                       className="cursor-pointer transition-all duration-300"
//                       onClick={() => handleElementSelect(element.id)}
//                       filter={isSelected ? "url(#elementShadow)" : "none"}
//                       opacity={element.opacity || 0.9}
//                       style={{
//                         strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id ? "4,2" : "none"),
//                         strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
//                       }}
//                       onMouseEnter={() => setHoveredElementId(element.id)}
//                       onMouseLeave={() => setHoveredElementId(null)}
//                     />
//                     {/* Rectangle gradient */}
//                     <defs>
//                       <linearGradient id={`rect-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
//                         <stop offset="0%" stopColor={`${element.color}30`} />
//                         <stop offset="100%" stopColor={`${element.color}10`} />
//                       </linearGradient>
//                     </defs>
//                   </g>
//                 );
//               }

//               if (element.type === "note") {
//                 return (
//                   <g key={element.id}>
//                     {/* Note shadow */}
//                     <rect
//                       x={renderX + 3}
//                       y={renderY + 3}
//                       width={element.width}
//                       height={element.height}
//                       rx="10"
//                       fill={element.color}
//                       opacity="0.15"
//                     />
//                     {/* Main note */}
//                     <rect
//                       x={renderX}
//                       y={renderY}
//                       width={element.width}
//                       height={element.height}
//                       rx="10"
//                       stroke={element.color}
//                       strokeWidth={isSelected ? "3" : "2"}
//                       fill={`url(#note-gradient-${element.id})`}
//                       className="cursor-pointer transition-all duration-300"
//                       onClick={() => handleElementSelect(element.id)}
//                       filter={isSelected ? "url(#elementShadow)" : "none"}
//                       opacity={element.opacity || 0.95}
//                       style={{
//                         strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id ? "4,2" : "none"),
//                         strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
//                       }}
//                       onMouseEnter={() => setHoveredElementId(element.id)}
//                       onMouseLeave={() => setHoveredElementId(null)}
//                     />
//                     {/* Note header line */}
//                     <line
//                       x1={renderX + 10}
//                       y1={renderY + 20}
//                       x2={renderX + (element.width || 0) - 10}
//                       y2={renderY + 20}
//                       stroke={element.color}
//                       strokeWidth="1"
//                       opacity="0.3"
//                     />
//                     {/* Note text or editor */}
//                     {editingTextElementId === element.id ? (
//                       <foreignObject
//                         x={renderX + 10}
//                         y={renderY + 30}
//                         width={(element.width || 0) - 20}
//                         height={(element.height || 0) - 40}
//                       >
//                         <textarea
//                           value={editingTextContent}
//                           onChange={(e) => setEditingTextContent(e.target.value)}
//                           onBlur={() => {
//                             setCanvasElements((prev) =>
//                               prev.map((el) =>
//                                 el.id === element.id ? { ...el, content: editingTextContent } : el
//                               )
//                             );
//                             setEditingTextElementId(null);
//                             setEditingTextContent("");
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter' && !e.shiftKey) {
//                               e.preventDefault();
//                               (e.target as HTMLTextAreaElement).blur();
//                             }
//                           }}
//                           style={{
//                             width: '100%',
//                             height: '100%',
//                             border: 'none',
//                             resize: 'none',
//                             backgroundColor: 'transparent',
//                             outline: 'none',
//                             fontFamily: 'inherit',
//                             fontSize: '14px',
//                             fontWeight: 'semibold',
//                             color: element.color,
//                             opacity: '0.8',
//                             padding: '0px',
//                             margin: '0px',
//                             overflow: 'hidden',
//                           }}
//                           autoFocus
//                         />
//                       </foreignObject>
//                     ) : (
//                       <text
//                         x={renderX + (element.width || 0) / 2}
//                         y={renderY + (element.height || 0) / 2 + 8}
//                         textAnchor="middle"
//                         className="text-sm font-semibold pointer-events-none select-none"
//                         fill={element.color}
//                         opacity="0.8"
//                       >
//                         {element.content}
//                       </text>
//                     )}
//                     {/* Note gradient */}
//                     <defs>
//                       <linearGradient id={`note-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
//                         <stop offset="0%" stopColor={`${element.color}25`} />
//                         <stop offset="50%" stopColor={`${element.color}15`} />
//                         <stop offset="100%" stopColor={`${element.color}20`} />
//                       </linearGradient>
//                     </defs>
//                   </g>
//                 );
//               }

//               if (element.type === "text") {
//                 return (
//                   <g key={element.id}>
//                     {/* Text element */}
//                     {editingTextElementId === element.id ? (
//                       <foreignObject
//                         x={renderX}
//                         y={renderY}
//                         width="200"
//                         height="50"
//                       >
//                         <textarea
//                           value={editingTextContent}
//                           onChange={(e) => setEditingTextContent(e.target.value)}
//                           onBlur={() => {
//                             setCanvasElements((prev) =>
//                               prev.map((el) =>
//                                 el.id === element.id ? { ...el, content: editingTextContent } : el
//                               )
//                             );
//                             setEditingTextElementId(null);
//                             setEditingTextContent("");
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter' && !e.shiftKey) {
//                               e.preventDefault();
//                               (e.target as HTMLTextAreaElement).blur();
//                             }
//                           }}
//                           style={{
//                             width: '100%',
//                             height: '100%',
//                             border: 'none',
//                             resize: 'none',
//                             backgroundColor: 'transparent',
//                             outline: 'none',
//                             fontFamily: 'inherit',
//                             fontSize: '16px',
//                             fontWeight: 'semibold',
//                             color: element.color,
//                             opacity: '0.9',
//                             padding: '0px',
//                             margin: '0px',
//                             overflow: 'hidden',
//                           }}
//                           autoFocus
//                         />
//                       </foreignObject>
//                     ) : (
//                       <text
//                         x={renderX}
//                         y={renderY + 16}
//                         className="cursor-pointer transition-all duration-300"
//                         onClick={() => handleElementSelect(element.id)}
//                         style={{
//                           fontSize: '16px',
//                           fontWeight: 'semibold',
//                           fill: element.color,
//                           opacity: element.opacity || 0.9,
//                           strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id ? "4,2" : "none"),
//                           strokeWidth: isSelected ? "1" : (hoveredElementId === element.id ? "0.5" : "0"),
//                         }}
//                         onMouseEnter={() => setHoveredElementId(element.id)}
//                         onMouseLeave={() => setHoveredElementId(null)}
//                       >
//                         {element.content}
//                       </text>
//                     )}
//                   </g>
//                 );
//               }

//               return null;
//             })}
//             {/* Color Picker Dialog */}
//             <AnimatePresence>
//               {showColorPicker && (
//                 <motion.foreignObject
//                   x={20}
//                   y={20}
//                   width="400"
//                   height="420"
//                   initial={{ opacity: 0, y: -30, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -30, scale: 0.95 }}
//                   transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                 >
//                   <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 h-full relative flex flex-col">
//                     {/* Close button at top-right */}
//                     <button
//                       onClick={() => setShowColorPicker(false)}
//                       className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 z-10"
//                     >
//                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>

//                     <div className="p-6 pb-2">
//                       {/* Header */}
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
//                           <Palette className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold text-gray-900 leading-tight">
//                             Color Picker
//                           </h3>
//                           <p className="text-sm text-gray-500 font-medium">
//                             Choose your active color
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex-grow p-6 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                       <div className="space-y-6 pr-2">
//                         {/* Current Color Display */}
//                         <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 mt-4">
//                           <div className="flex items-center justify-between">
//                             <span className="text-sm font-semibold text-gray-700">Current Color:</span>
//                             <div className="flex items-center space-x-3">
//                               <div
//                                 className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm transition-all duration-200"
//                                 style={{ backgroundColor: selectedColor }}
//                               />
//                               <span className="font-mono text-sm text-gray-600 font-semibold">{selectedColor}</span>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Color Palettes */}
//                         <div className="space-y-4">
//                           {colorPalettes.map((palette, paletteIndex) => (
//                             <div key={paletteIndex} className="space-y-3">
//                               <h4 className="text-sm font-semibold text-gray-800 flex items-center">
//                                 <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: palette.colors[0] }} />
//                                 {palette.name} Palette
//                               </h4>
//                               <div className="grid grid-cols-6 gap-2">
//                                 {palette.colors.map((color, colorIndex) => (
//                                   <button
//                                     key={colorIndex}
//                                     onClick={() => setSelectedColor(color)}
//                                     className={`
//                                       w-12 h-12 rounded-xl border-2 transition-all duration-200 transform hover:scale-110 active:scale-95
//                                       ${selectedColor === color
//                                         ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105'
//                                         : 'border-gray-200 hover:border-gray-300'
//                                       }
//                                     `}
//                                     style={{ backgroundColor: color }}
//                                     title={`${palette.name} - Color ${colorIndex + 1} (${color})`}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {/* Custom Color Section */}
//                         <div className="space-y-3 pt-4 border-t border-gray-100">
//                           <h4 className="text-sm font-semibold text-gray-800">More Colors</h4>
//                           <div className="grid grid-cols-7 gap-2">
//                             {[
//                               "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1", // Indigo shades
//                               "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", // Red shades
//                               "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", // Green shades
//                               "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", // Orange shades
//                               "#F3E8FF", "#E9D5FF", "#D8B4FE", "#C4B5FD", "#A78BFA", // Purple shades
//                               "#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8", // Sky shades
//                               "#FFFBEB", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", // Amber shades
//                               "#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", // Emerald shades (repeat for more options)
//                               "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", // Rose shades (repeat for more options)
//                             ].map((color, index) => (
//                               <button
//                                 key={index}
//                                 onClick={() => setSelectedColor(color)}
//                                 className={`
//                                   w-10 h-10 rounded-lg border-2 transition-all duration-200 transform hover:scale-110 active:scale-95
//                                   ${selectedColor === color
//                                     ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105'
//                                     : 'border-gray-200 hover:border-gray-300'
//                                   }
//                                 `}
//                                 style={{ backgroundColor: color }}
//                                 title={`Custom Color ${index + 1} (${color})`}
//                               />
//                             ))}
//                           </div>
//                         </div>

//                         {/* Tips Section */}
//                         <div className="bg-yellow-50/80 rounded-xl p-4 border border-yellow-100">
//                           <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
//                             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                             </svg>
//                             Color Tips
//                           </h4>
//                           <ul className="text-xs text-yellow-700 space-y-1">
//                             <li>• Selected color will be used for all new drawings and shapes</li>
//                             <li>• You can also change colors from the toolbar palette</li>
//                             <li>• Different colors help organize your whiteboard content</li>
//                             <li>• Use contrasting colors for better visibility</li>
//                             <li>• Use the custom colors for more diverse options</li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.foreignObject>
//               )}
//             </AnimatePresence>

//             {/* Temporary Floating Tool Instruction Dialog */}
//             <AnimatePresence>
//               {showToolInstruction && ( // Only one instruction dialog, content changes based on activeTool
//                 <motion.foreignObject
//                   x={20}
//                   y={20}
//                   width="320"
//                   height="220" // Increased height to accommodate more content and scrollbar
//                   initial={{ opacity: 0, y: -30, scale: 0.95 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -30, scale: 0.95 }}
//                   transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                   className="z-20" // Ensure it's above other elements
//                 >
//                   <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 h-full relative flex flex-col overflow-hidden">
//                     {/* Close button at top-right */}
//                     <button
//                       onClick={() => setShowToolInstruction(false)}
//                       className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 z-10"
//                     >
//                       <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>

//                     <div className="p-6 pb-2">
//                       {/* Header */}
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
//                           <toolInstructionContent.icon className="w-5 h-5 text-white" />
//                         </div>
//                         <div>
//                           <h3 className="text-xl font-bold text-gray-900 leading-tight">
//                             {toolInstructionContent.name} Tool
//                           </h3>
//                           <p className="text-sm text-gray-500 font-medium">
//                             How to use this tool
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex-grow p-6 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                       <div className="space-y-4 pr-2">
//                         <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
//                           <p className="text-sm text-gray-700 leading-relaxed">
//                             {toolInstructionContent.description}
//                           </p>
//                         </div>

//                         {toolInstructionContent.shortcut && (
//                           <div className="flex items-center space-x-2">
//                             <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                               Keyboard Shortcut:
//                             </span>
//                             <span className="font-mono bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm border border-gray-200">
//                               {toolInstructionContent.shortcut.toUpperCase()}
//                             </span>
//                           </div>
//                         )}

//                         {/* Additional tips section (generic for all tools) */}
//                         <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
//                           <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
//                             <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                             </svg>
//                             Pro Tips
//                           </h4>
//                           <ul className="text-xs text-blue-700 space-y-1">
//                             <li>• Use keyboard shortcuts for faster workflow</li>
//                             <li>• Use the mouse wheel to zoom in/out on the canvas</li>
//                             <li>• Most elements can be moved by clicking and dragging</li>
//                             <li>• Undo/Redo actions are currently being implemented</li>
//                             <li>• Save your work frequently to avoid data loss</li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.foreignObject>
//               )}
//             </AnimatePresence>
//           </svg>

//           {/* Collaborative cursors */}
//           <AnimatePresence>
//             {collaborators.map(
//               (cursor) =>
//                 cursor.isActive && (
//                   <motion.div
//                     key={cursor.id}
//                     className="absolute pointer-events-none z-10"
//                     initial={{ opacity: 0 }}
//                     animate={{
//                       x: cursor.x,
//                       y: cursor.y,
//                       opacity: 1,
//                     }}
//                     exit={{ opacity: 0 }}
//                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                   >
//                     <MousePointer
//                       className="w-5 h-5 drop-shadow-sm"
//                       style={{ color: cursor.color }}
//                     />
//                     <div className="absolute top-5 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
//                       {cursor.name}
//                     </div>
//                   </motion.div>
//                 )
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Enhanced Modern Toolbar */}
//         <div className="px-6 py-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               {/* Main Tool Buttons */}
//               <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-md rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">
//                 {toolbarItems.map((tool, i) => (
//                   <button
//                     key={i}
//                     onClick={() => tool.isFunctional ? handleToolSelect(i) : null}
//                     disabled={!tool.isFunctional}
//                     className={`
//                       relative w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center group overflow-hidden
//                       ${tool.active
//                         ? `bg-gradient-to-br ${tool.gradient.join(' ')} text-white shadow-md shadow-${tool.theme}-500/30`
//                         : tool.isFunctional
//                           ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
//                           : "text-gray-300 cursor-not-allowed opacity-50"
//                       }
//                     `}
//                     title={tool.isFunctional ? `${tool.name} (${tool.shortcut})` : `${tool.name} - Not implemented`}
//                   >
//                     <tool.icon className={`w-4 h-4 transition-transform duration-100 ${tool.active ? 'scale-110' : ''}`} />
//                   </button>
//                 ))}
//               </div>

//               {/* Divider */}
//               <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

//               {/* Simplified Action Buttons */}
//               <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-md rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">
//                 <button className="w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
//                   title="Undo"
//                   disabled={true} // Not implemented
//                 >
//                   <RotateCcw className="w-4 h-4" />
//                 </button>
//                 <button className="w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
//                   title="Duplicate"
//                   onClick={() => { /* Duplicate not implemented */ }}
//                   disabled={true} // Not implemented
//                 >
//                   <Copy className="w-4 h-4" />
//                 </button>
//                 <button className="w-9 h-9 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors duration-200"
//                   title="Delete"
//                   onClick={handleDeleteElement}
//                   disabled={!selectedElement}
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Minimal Color Palette Preview (now showing selected color) */}
//               <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-xl px-3 py-1.5 border border-gray-100 shadow-sm">
//                 <Palette className="w-3 h-3 text-gray-500" />
//                 <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
//                   style={{ backgroundColor: selectedColor }}
//                   title="Current selected color"
//                 />
//               </div>
//             </div>

//             {/* Right Side Actions */}
//             <div className="flex items-center space-x-3">
//               {/* Simplified Status Indicator */}
//               <div className="flex items-center space-x-1 text-xs text-gray-600 bg-white/70 backdrop-blur-md rounded-lg px-2 py-1.5 border border-gray-100 shadow-sm">
//                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
//                 <Save className="w-3 h-3 text-green-500" />
//                 <span className="font-medium">Saved</span>
//               </div>

//               {/* Minimal Export/Import Actions */}
//               <div className="flex items-center space-x-1">
//                 <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Export"
//                   onClick={() => { /* Export not implemented */ }}
//                   disabled={true} // Not implemented
//                 >
//                   <Download className="w-3 h-3" />
//                 </button>
//                 <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
//                   title="Import"
//                   onClick={() => { /* Import not implemented */ }}
//                   disabled={true} // Not implemented
//                 >
//                   <Upload className="w-3 h-3" />
//                 </button>
//               </div>

//               {/* Enhanced Share Button */}
//               <button className="flex items-center space-x-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md shadow-blue-500/30 hover:shadow-lg"
//                 onClick={() => { /* Share not implemented */ }}
//                 disabled={true} // Not implemented
//               >
//                 <Share2 className="w-3 h-3" />
//                 <span className="font-semibold text-sm">Share</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Styling */}
//       <style jsx>{`
//         /* Modern glassmorphism effects */
//         .backdrop-blur-sm {
//           backdrop-filter: blur(8px);
//           -webkit-backdrop-filter: blur(8px);
//         }

//         .backdrop-blur-lg {
//           backdrop-filter: blur(16px);
//           -webkit-backdrop-filter: blur(16px);
//         }

//         .backdrop-blur-xl {
//           backdrop-filter: blur(24px);
//           -webkit-backdrop-filter: blur(24px);
//         }

//         /* Custom scrollbars */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }

//         ::-webkit-scrollbar-track {
//           background: rgba(0, 0, 0, 0.02);
//           border-radius: 4px;
//         }

//         ::-webkit-scrollbar-thumb {
//           background: linear-gradient(
//             180deg,
//             rgba(59, 130, 246, 0.3) 0%,
//             rgba(59, 130, 246, 0.1) 100%
//           );
//           border-radius: 4px;
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         ::-webkit-scrollbar-thumb:hover {
//           background: linear-gradient(
//             180deg,
//             rgba(59, 130, 246, 0.5) 0%,
//             rgba(59, 130, 246, 0.3) 100%
//           );
//         }

//         /* Focus states for accessibility */
//         button:focus-visible {
//           outline: 2px solid rgba(59, 130, 246, 0.6);
//           outline-offset: 2px;
//         }

//         /* Text selection styling */
//         ::selection {
//           background-color: rgba(59, 130, 246, 0.2);
//           color: rgba(59, 130, 246, 1);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ReatimeWhiteboardMock; 
