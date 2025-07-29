// src/components/whiteboard/hooks/useCanvasInteraction.ts

import { useState, useCallback } from "react";
import { CanvasElement, DrawingPath } from "../types";

interface UseCanvasInteractionProps {
  activeTool: number;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  selectedColor: string;
  canvasElements: CanvasElement[];
  selectedElement: string | null;
  setCanvasElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setDrawingPaths: React.Dispatch<React.SetStateAction<DrawingPath[]>>;
  setSelectedElement: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingTextElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingTextContent: React.Dispatch<React.SetStateAction<string>>;
  canvasRef: React.RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

export const useCanvasInteraction = ({
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
}: UseCanvasInteractionProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const displayWidth = canvasWidth * (zoomLevel / 100);
    const displayHeight = canvasHeight * (zoomLevel / 100);

    const offsetX = (rect.width - displayWidth) / 2;
    const offsetY = (rect.height - displayHeight) / 2;

    const scaleX = canvasWidth / displayWidth;
    const scaleY = canvasHeight / displayHeight;

    return {
      x: ((e.clientX - rect.left - offsetX) * scaleX) - panOffset.x,
      y: ((e.clientY - rect.top - offsetY) * scaleY) - panOffset.y,
    };
  }, [zoomLevel, panOffset, canvasRef, canvasWidth, canvasHeight]);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const coords = getCanvasCoordinates(e);
      
      if (activeTool === 0) {
        // Drawing tool
        setIsDrawing(true);
        setLastPoint(coords);
        setCurrentPath(`M${coords.x} ${coords.y}`);
      } else if (activeTool === 1) { // Circle tool
        setLastPoint(coords);
        setIsDrawing(true);
      } else if (activeTool === 2) { // Rectangle tool
        setLastPoint(coords);
        setIsDrawing(true);
      } else if (activeTool === 3) { // Triangle tool
        setLastPoint(coords);
        setIsDrawing(true);
      } else if (activeTool === 4) { // Star tool
        setLastPoint(coords);
        setIsDrawing(true);
      } else if (activeTool === 5) { // Sticky Note tool
        const newNote: CanvasElement = {
          id: `note-${Date.now()}`,
          type: "note",
          x: coords.x,
          y: coords.y,
          width: 150,
          height: 100,
          color: selectedColor,
          content: "New Note",
          opacity: 0.95,
          timestamp: Date.now(),
        };
        setCanvasElements((prev) => [...prev, newNote]);
        setSelectedElement(newNote.id);
        setIsDrawing(false);
      } else if (activeTool === 6) { // Text tool
        if (!e.target || !(e.target as Element).closest('.canvas-element-text-editor')) {
          const element = canvasElements.find(el => el.id === hoveredElementId);
          if (element && (element.type === "note" || element.type === "text")) {
              setSelectedElement(element.id);
              setEditingTextElementId(element.id);
              setEditingTextContent(element.content || "");
          } else {
            const newText: CanvasElement = {
              id: `text-${Date.now()}`,
              type: "text",
              x: coords.x,
              y: coords.y,
              content: "New Text",
              color: selectedColor,
              opacity: 0.9,
              timestamp: Date.now(),
            };
            setCanvasElements((prev) => [...prev, newText]);
            setSelectedElement(newText.id);
            setEditingTextElementId(newText.id);
            setEditingTextContent("New Text");
          }
        }
      } else if (activeTool === 7) { // Pan tool
        setIsPanning(true);
        setLastPoint({ x: e.clientX, y: e.clientY });
      } else if (activeTool === 8) { // Eraser tool
        // Handle eraser logic here
        setIsDrawing(false);
      } else {
        // Default selection/dragging behavior
        if (hoveredElementId) {
          setSelectedElement(hoveredElementId);
          setIsDragging(true);
          setLastPoint({ x: e.clientX, y: e.clientY });
        } else {
          setSelectedElement(null);
          setEditingTextElementId(null);
        }
      }
    },
    [activeTool, getCanvasCoordinates, selectedColor, canvasElements, hoveredElementId, setCanvasElements, setSelectedElement, setEditingTextElementId, setEditingTextContent]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const coords = getCanvasCoordinates(e);

      // Set hovered element for all tools except pan
      if (activeTool !== 7) {
        const elementUnderCursor = canvasElements.find(el => {
          if (!canvasRef.current) return false;
          const elementSvg = document.getElementById(el.id);
          if (elementSvg && elementSvg.contains(e.target as Node)) {
            return true;
          }
          return false;
        });
        setHoveredElementId(elementUnderCursor ? elementUnderCursor.id : null);
      }

      if (isDrawing && lastPoint) {
        if (activeTool === 0) {
          // Drawing tool - use quadratic curves for smooth lines
          const midX = (lastPoint.x + coords.x) / 2;
          const midY = (lastPoint.y + coords.y) / 2;
          setCurrentPath((prev) => `${prev} Q${lastPoint.x} ${lastPoint.y} ${midX} ${midY}`);
          setLastPoint(coords);
        } else if (activeTool >= 1 && activeTool <= 4) { // Shape tools
          const startX = lastPoint.x;
          const startY = lastPoint.y;
          const currentX = coords.x;
          const currentY = coords.y;
          const width = Math.abs(currentX - startX);
          const height = Math.abs(currentY - startY);
          const tempColor = selectedColor;

          setCanvasElements((prevElements) => {
            const newElements = prevElements.filter(el => el.id !== 'temp-shape');
            let newShape: CanvasElement | null = null;

            if (activeTool === 1) { // Circle tool
              const radius = Math.sqrt(width * width + height * height) / 2;
              const centerX = Math.min(startX, currentX) + width / 2;
              const centerY = Math.min(startY, currentY) + height / 2;
              newShape = {
                id: 'temp-shape',
                type: 'circle',
                x: centerX,
                y: centerY,
                radius: radius,
                color: tempColor,
                opacity: 0.9,
                timestamp: Date.now(),
              };
            } else if (activeTool === 2) { // Rectangle tool
              newShape = {
                id: 'temp-shape',
                type: 'rectangle',
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                width: width,
                height: height,
                color: tempColor,
                opacity: 0.9,
                timestamp: Date.now(),
              };
            } else if (activeTool === 3) { // Triangle tool
              newShape = {
                id: 'temp-shape',
                type: 'triangle',
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                width: width,
                height: height,
                color: tempColor,
                opacity: 0.9,
                timestamp: Date.now(),
              };
            } else if (activeTool === 4) { // Star tool
              newShape = {
                id: 'temp-shape',
                type: 'star',
                x: Math.min(startX, currentX),
                y: Math.min(startY, currentY),
                width: width,
                height: height,
                color: tempColor,
                opacity: 0.9,
                timestamp: Date.now(),
              };
            }
            return newShape ? [...newElements, newShape] : newElements;
          });
        }
      } else if (isPanning && lastPoint) {
        // Smooth panning with improved performance
        const dx = e.clientX - lastPoint.x;
        const dy = e.clientY - lastPoint.y;
        setPanOffset((prev) => ({ 
          x: prev.x + dx, 
          y: prev.y + dy 
        }));
        setLastPoint({ x: e.clientX, y: e.clientY });
      } else if (isDragging && lastPoint && hoveredElementId) {
        // Smooth element dragging with zoom level compensation
        const dx = (e.clientX - lastPoint.x) / (zoomLevel / 100);
        const dy = (e.clientY - lastPoint.y) / (zoomLevel / 100);

        setCanvasElements((prevElements) =>
          prevElements.map((el) =>
            el.id === hoveredElementId
              ? { 
                  ...el, 
                  x: el.x + dx, 
                  y: el.y + dy,
                  timestamp: Date.now() // Update timestamp for real-time sync
                }
              : el
          )
        );
        setLastPoint({ x: e.clientX, y: e.clientY });
      } else if (selectedElement && lastPoint) {
        // Allow dragging selected elements even when not in dragging mode
        const dx = (e.clientX - lastPoint.x) / (zoomLevel / 100);
        const dy = (e.clientY - lastPoint.y) / (zoomLevel / 100);

        setCanvasElements((prevElements) =>
          prevElements.map((el) =>
            el.id === selectedElement
              ? { 
                  ...el, 
                  x: el.x + dx, 
                  y: el.y + dy,
                  timestamp: Date.now()
                }
              : el
          )
        );
        setLastPoint({ x: e.clientX, y: e.clientY });
      }
    },
    [isDrawing, isDragging, activeTool, lastPoint, getCanvasCoordinates, selectedColor, canvasElements, zoomLevel, isPanning, setCanvasElements, setPanOffset, hoveredElementId, selectedElement]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (isDrawing) {
      if (activeTool === 0 && currentPath) {
        // Finalize drawing path
        const newPath: DrawingPath = {
          id: `path-${Date.now()}`,
          path: currentPath,
          color: selectedColor,
          strokeWidth: 2,
          user: "currentUser",
          timestamp: Date.now(),
          opacity: 0.9,
        };
        setDrawingPaths((prev) => [...prev, newPath]);
        setCurrentPath("");
        setLastPoint(null);
      } else if (activeTool >= 1 && activeTool <= 4) { // Finalize shape creation
        setCanvasElements((prevElements) =>
          prevElements.map(el => {
            if (el.id === 'temp-shape') {
              return { ...el, id: `${el.type}-${Date.now()}`, color: selectedColor };
            }
            return el;
          })
        );
      }
    }
    
    // Reset all interaction states
    setIsDrawing(false);
    setIsPanning(false);
    setIsDragging(false);
    setLastPoint(null);
  }, [isDrawing, currentPath, activeTool, selectedColor, setDrawingPaths, setCanvasElements]);

  const handleDeleteElement = useCallback(() => {
    setSelectedElement((prevSelectedId) => {
      if (prevSelectedId) {
        setCanvasElements((prevElements) =>
          prevElements.filter((el) => el.id !== prevSelectedId)
        );
        setEditingTextElementId(null);
      }
      return null;
    });
  }, [setCanvasElements, setEditingTextElementId, setSelectedElement]);

  return {
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
  };
};