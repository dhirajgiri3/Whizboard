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

  const getCanvasCoordinates = useCallback((e: React.MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    // Get client coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Use SVG's built-in coordinate transformation
    const svgPoint = canvas.createSVGPoint();
    svgPoint.x = clientX;
    svgPoint.y = clientY;
    
    // Get the current transform matrix and convert to SVG coordinates
    const ctm = canvas.getScreenCTM();
    if (ctm) {
      const transformedPoint = svgPoint.matrixTransform(ctm.inverse());
      return {
        x: transformedPoint.x,
        y: transformedPoint.y,
      };
    }

    // Fallback calculation if getScreenCTM fails
    const rect = canvas.getBoundingClientRect();
    const zoomFactor = zoomLevel / 100;
    
    // Simple coordinate mapping
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    // Convert to SVG coordinates
    const svgX = (relativeX - panOffset.x) / zoomFactor;
    const svgY = (relativeY - panOffset.y) / zoomFactor;
    
    // Map to canvas coordinates using the actual canvas dimensions
    const canvasX = (svgX / rect.width) * canvasWidth;
    const canvasY = (svgY / rect.height) * canvasHeight;
    
    return {
      x: canvasX,
      y: canvasY,
    };
  }, [canvasRef, zoomLevel, panOffset, canvasWidth, canvasHeight]);

  // Enhanced element detection function
  const findElementAtPoint = useCallback((coords: { x: number; y: number }) => {
    // Check canvas elements first (shapes, notes, text)
    for (let i = canvasElements.length - 1; i >= 0; i--) {
      const element = canvasElements[i];
      let isInside = false;

      switch (element.type) {
        case 'circle':
          const distance = Math.sqrt(
            Math.pow(coords.x - element.x, 2) + Math.pow(coords.y - element.y, 2)
          );
          isInside = distance <= (element.radius || 0);
          break;
        case 'rectangle':
          isInside = coords.x >= element.x && 
                    coords.x <= element.x + (element.width || 0) &&
                    coords.y >= element.y && 
                    coords.y <= element.y + (element.height || 0);
          break;
        case 'triangle':
          // Simplified triangle hit detection
          isInside = coords.x >= element.x && 
                    coords.x <= element.x + (element.width || 0) &&
                    coords.y >= element.y && 
                    coords.y <= element.y + (element.height || 0);
          break;
        case 'star':
          isInside = coords.x >= element.x && 
                    coords.x <= element.x + (element.width || 0) &&
                    coords.y >= element.y && 
                    coords.y <= element.y + (element.height || 0);
          break;
        case 'note':
        case 'text':
          isInside = coords.x >= element.x && 
                    coords.x <= element.x + (element.width || 0) &&
                    coords.y >= element.y && 
                    coords.y <= element.y + (element.height || 0);
          break;
      }

      if (isInside) {
        return { id: element.id, type: 'element' };
      }
    }

    return null;
  }, [canvasElements]);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent | TouchEvent) => {
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
        setLastPoint({ x: 'clientX' in e ? e.clientX : e.touches[0].clientX, y: 'clientY' in e ? e.clientY : e.touches[0].clientY });
      } else if (activeTool === 8) { // Eraser tool
        // Enhanced eraser functionality
        const elementAtPoint = findElementAtPoint(coords);
        if (elementAtPoint) {
          if (elementAtPoint.type === 'element') {
            setCanvasElements((prevElements) =>
              prevElements.filter((el) => el.id !== elementAtPoint.id)
            );
          }
          setSelectedElement(null);
          setEditingTextElementId(null);
        }
        setIsDrawing(true); // Enable drawing mode for continuous erasing
      } else {
        // Default selection/dragging behavior
        const elementAtPoint = findElementAtPoint(coords);
        if (elementAtPoint) {
          setSelectedElement(elementAtPoint.id);
          setHoveredElementId(elementAtPoint.id);
          setIsDragging(true);
          setLastPoint({ x: 'clientX' in e ? e.clientX : e.touches[0].clientX, y: 'clientY' in e ? e.clientY : e.touches[0].clientY });
        } else {
          setSelectedElement(null);
          setEditingTextElementId(null);
          setHoveredElementId(null);
        }
      }
    },
    [activeTool, getCanvasCoordinates, selectedColor, canvasElements, hoveredElementId, setCanvasElements, setSelectedElement, setEditingTextElementId, setEditingTextContent, findElementAtPoint]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent | TouchEvent) => {
      const coords = getCanvasCoordinates(e);

      // Set hovered element for all tools except pan
      if (activeTool !== 7) {
        const elementAtPoint = findElementAtPoint(coords);
        setHoveredElementId(elementAtPoint ? elementAtPoint.id : null);
        
        // Handle continuous erasing when dragging with eraser tool
        if (activeTool === 8 && elementAtPoint && isDrawing) {
          if (elementAtPoint.type === 'element') {
            setCanvasElements((prevElements) =>
              prevElements.filter((el) => el.id !== elementAtPoint.id)
            );
          }
          setSelectedElement(null);
          setEditingTextElementId(null);
        }
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
        const currentClientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
        const currentClientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
        const dx = currentClientX - lastPoint.x;
        const dy = currentClientY - lastPoint.y;
        setPanOffset((prev) => ({ 
          x: prev.x + dx, 
          y: prev.y + dy 
        }));
        setLastPoint({ x: currentClientX, y: currentClientY });
      } else if (isDragging && lastPoint && hoveredElementId) {
        // Smooth element dragging with zoom level compensation
        const currentClientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
        const currentClientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
        const dx = (currentClientX - lastPoint.x) / (zoomLevel / 100);
        const dy = (currentClientY - lastPoint.y) / (zoomLevel / 100);

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
        setLastPoint({ x: currentClientX, y: currentClientY });
      } else if (selectedElement && lastPoint) {
        // Allow dragging selected elements even when not in dragging mode
        const currentClientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
        const currentClientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
        const dx = (currentClientX - lastPoint.x) / (zoomLevel / 100);
        const dy = (currentClientY - lastPoint.y) / (zoomLevel / 100);

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
        setLastPoint({ x: currentClientX, y: currentClientY });
      }
    },
    [isDrawing, isDragging, activeTool, lastPoint, getCanvasCoordinates, selectedColor, canvasElements, zoomLevel, isPanning, setCanvasElements, setPanOffset, hoveredElementId, selectedElement, findElementAtPoint]
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
        // Remove from canvas elements
        setCanvasElements((prevElements) =>
          prevElements.filter((el) => el.id !== prevSelectedId)
        );
        // Also remove from drawing paths if it's a path
        setDrawingPaths((prevPaths) =>
          prevPaths.filter((path) => path.id !== prevSelectedId)
        );
        setEditingTextElementId(null);
      }
      return null;
    });
  }, [setCanvasElements, setDrawingPaths, setEditingTextElementId, setSelectedElement]);

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