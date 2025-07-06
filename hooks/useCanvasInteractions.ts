import { useState, useRef, useCallback, useEffect } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { Tool } from '@/components/toolbar/MainToolbar';
import { FrameElement, ILine } from '@/types';

interface UseCanvasInteractionsProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  tool: Tool;
  color: string;
  strokeWidth: number;
  lines: ILine[];
  setLines: React.Dispatch<React.SetStateAction<ILine[]>>;
  frames: FrameElement[];
  dimensions: { width: number; height: number };
  onDrawEndAction: (lines: ILine[]) => void;
  onEraseAction?: (lineId: string) => void;
  onCanvasClickAction?: (e: KonvaEventObject<MouseEvent>) => void;
  onToolChangeAction?: (tool: Tool) => void;
  onRealTimeDrawingAction?: (line: ILine) => void;
  onRealTimeLineUpdateAction?: (line: ILine) => void;
  onRealTimeFrameAction?: (frame: FrameElement) => void;
  onFrameAddAction?: (frame: FrameElement) => void;
  addFrame: (frame: FrameElement) => void;
  moveCursorAction: (x: number, y: number) => void;
}

// Add point simplification utility
const simplifyPoints = (points: number[], tolerance: number = 2): number[] => {
  if (points.length <= 4) return points; // Need at least 2 points (4 values)
  
  const simplified: number[] = [];
  simplified.push(points[0], points[1]); // Always keep first point
  
  for (let i = 2; i < points.length - 2; i += 2) {
    const prevX = simplified[simplified.length - 2];
    const prevY = simplified[simplified.length - 1];
    const currX = points[i];
    const currY = points[i + 1];
    
    // Calculate distance from previous point
    const distance = Math.sqrt((currX - prevX) ** 2 + (currY - prevY) ** 2);
    
    // Only add point if it's far enough from the previous one
    if (distance > tolerance) {
      simplified.push(currX, currY);
    }
  }
  
  // Always keep last point
  if (points.length >= 2) {
    simplified.push(points[points.length - 2], points[points.length - 1]);
  }
  
  return simplified;
};

export function useCanvasInteractions({
  stageRef,
  tool,
  color,
  strokeWidth,
  lines,
  setLines,
  frames,
  dimensions,
  onDrawEndAction,
  onEraseAction,
  onCanvasClickAction,
  onToolChangeAction,
  onRealTimeDrawingAction,
  onRealTimeLineUpdateAction,
  onRealTimeFrameAction,
  onFrameAddAction,
  addFrame,
  moveCursorAction,
}: UseCanvasInteractionsProps) {
  
  // State
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [isStickyNoteDragging, setIsStickyNoteDragging] = useState(false);
  const [isFrameDragging, setIsFrameDragging] = useState(false);
  const [showFrameAlignment, setShowFrameAlignment] = useState(false);
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null);
  const [isDrawingInFrame, setIsDrawingInFrame] = useState(false);
  
  // Refs
  const frameCreationModeRef = useRef<{
    isCreating: boolean;
    startPoint: { x: number; y: number } | null;
    currentFrame: Partial<FrameElement> | null;
  }>({
    isCreating: false,
    startPoint: null,
    currentFrame: null,
  });
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const lastUpdatePoint = useRef<{ x: number; y: number } | null>(null); // Track last update point
  const performanceMode = useRef(false);
  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);

  // Enhanced line selection state
  const lineSelectionRef = useRef<{
    selectedLineIndex: number | null;
    isSelecting: boolean;
    lastClickTime: number;
  }>({
    selectedLineIndex: null,
    isSelecting: false,
    lastClickTime: 0,
  });

  // Constants
  const MIN_UPDATE_DISTANCE = 5; // Minimum distance before sending real-time update

  // Helper functions
  const isPointInFrame = useCallback((point: { x: number; y: number }, frame: FrameElement): boolean => {
    return (
      point.x >= frame.x &&
      point.x <= frame.x + frame.width &&
      point.y >= frame.y &&
      point.y <= frame.y + frame.height
    );
  }, []);

  const findFrameAtPoint = useCallback((point: { x: number; y: number }): FrameElement | null => {
    // Sort frames by creation order (z-index) to get the topmost frame
    const sortedFrames = [...frames].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    for (let i = 0; i < sortedFrames.length; i++) {
      if (isPointInFrame(point, sortedFrames[i])) {
        return sortedFrames[i];
      }
    }
    return null;
  }, [frames, isPointInFrame]);

  const handleDrawingInFrame = useCallback((point: { x: number; y: number }, frame: FrameElement) => {
    const clippedX = Math.max(frame.x, Math.min(frame.x + frame.width, point.x));
    const clippedY = Math.max(frame.y, Math.min(frame.y + frame.height, point.y));
    return { x: clippedX, y: clippedY };
  }, []);

  // Enhanced line click handler with better reliability
  const handleLineClick = useCallback((lineIdx: number) => {
    const now = Date.now();
    const doubleClickThreshold = 300; // ms
    
    // Prevent rapid successive clicks
    if (now - lineSelectionRef.current.lastClickTime < 100) {
      return;
    }
    
    lineSelectionRef.current.lastClickTime = now;
    
    // Handle eraser tool
    if (tool === 'eraser' && onEraseAction) {
      const line = lines[lineIdx];
      if (line && 'id' in line) {
        onEraseAction(line.id as string);
        return;
      }
    }
    
    // Handle tool switching for pen lines
    if (tool !== 'pen' && onToolChangeAction) {
      const line = lines[lineIdx];
      if (line && line.tool === 'pen') {
        // Set selection state
        lineSelectionRef.current.selectedLineIndex = lineIdx;
        lineSelectionRef.current.isSelecting = true;
        
        // Switch to pen tool
        onToolChangeAction('pen');
        
        // Clear selection after a delay
        setTimeout(() => {
          lineSelectionRef.current.isSelecting = false;
          lineSelectionRef.current.selectedLineIndex = null;
        }, 2000);
        
        return;
      }
    }
    
    // Handle double-click for line selection
    if (now - lineSelectionRef.current.lastClickTime < doubleClickThreshold) {
      // Double-click detected - could be used for line editing in the future
      console.log('Double-click on line:', lineIdx);
    }
  }, [tool, onEraseAction, onToolChangeAction, lines]);

  // Zoom functions
  const resetZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const newScale = 1;
    const newPos = { x: 0, y: 0 };
    
    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.4,
      easing: Konva.Easings.EaseInOut,
    });
    
    setStageScale(newScale);
    setStagePos(newPos);
  }, [stageRef]);

  const zoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const newScale = Math.min(8, oldScale * 1.3);
    
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseOut,
    });
    
    setStageScale(newScale);
    setStagePos(newPos);
  }, [stageRef, dimensions]);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const newScale = Math.max(0.05, oldScale / 1.3);
    
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseOut,
    });
    
    setStageScale(newScale);
    setStagePos(newPos);
  }, [stageRef, dimensions]);

  const fitToScreen = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || lines.length === 0) return;
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    lines.forEach(line => {
      for (let i = 0; i < line.points.length; i += 2) {
        const x = line.points[i];
        const y = line.points[i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });
    
    if (minX === Infinity) return;
    
    const padding = 50;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const scaleX = (dimensions.width - padding * 2) / contentWidth;
    const scaleY = (dimensions.height - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 2);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newPos = {
      x: dimensions.width / 2 - centerX * newScale,
      y: dimensions.height / 2 - centerY * newScale,
    };
    
    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });
    
    setStageScale(newScale);
    setStagePos(newPos);
  }, [stageRef, lines, dimensions]);

  // Enhanced event handlers with better line interaction support
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.currentTarget.getStage();
    if (!stage) return;

    if (isSpacePressed.current || tool === 'select') {
      isPanning.current = true;
      return;
    }

    // Check if clicked on sticky note
    let clickedOnStickyNote = false;
    let currentNode: Konva.Node | Konva.Stage | null = e.target;
    while (currentNode && currentNode !== stage) {
      if (typeof currentNode.hasName === 'function' && currentNode.hasName('sticky-note')) {
        clickedOnStickyNote = true;
        break;
      }
      currentNode = currentNode.getParent();
    }

    if (clickedOnStickyNote) return;

    if (tool === 'sticky-note') {
      if (onCanvasClickAction) {
        onCanvasClickAction(e);
      }
      return;
    }

    if (tool === 'frame') {
      const framePos = stage.getPointerPosition();
      if (framePos) {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const stagePoint = transform.point(framePos);
        
        if (stagePoint) {
          frameCreationModeRef.current = {
            isCreating: true,
            startPoint: stagePoint,
            currentFrame: {
              id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'frame',
              x: stagePoint.x,
              y: stagePoint.y,
              width: 0,
              height: 0,
              name: 'New Frame',
              frameType: 'basic',
              isCreating: true,
              style: {
                fill: 'rgba(255, 255, 255, 1.0)',
                stroke: '#22c55e',
                strokeWidth: 2,
              },
              metadata: {
                labels: [],
                tags: [],
                status: 'draft',
                priority: 'low',
                comments: [],
              },
              hierarchy: {
                childIds: [],
                level: 0,
                order: frames.length,
              },
              createdBy: 'current-user',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              version: 1,
            },
          };
        }
      }
      return;
    }

    if (tool === 'text') {
      // Detect if click is on existing text element to prevent creating a new one
      let clickedOnText = false;
      let node: Konva.Node | Konva.Stage | null = e.target;
      while (node && node !== stage) {
        if (typeof node.hasName === 'function' && node.hasName('text-element')) {
          clickedOnText = true;
          break;
        }
        node = node.getParent();
      }

      if (clickedOnText) {
        // Automatically switch to select tool for better UX
        if (onToolChangeAction) {
          onToolChangeAction('select');
        }
        // Let the existing text element handle its own click/selection
        // The text element will handle its own selection through its click handlers
        return;
      }

      const textPos = stage.getPointerPosition();
      if (textPos) {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const stagePoint = transform.point(textPos);
        
        if (stagePoint && onCanvasClickAction) {
          // Pass the click event with position data for text element creation
          const customEvent = {
            ...e,
            stagePoint,
            tool: 'text',
          };
          onCanvasClickAction(customEvent as any);
        }
      }
      return;
    }
    
    if (tool !== 'pen' && tool !== 'eraser' && tool !== 'highlighter') return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePos = transform.point(pos);

    const targetFrame = findFrameAtPoint(stagePos);
    setActiveFrameId(targetFrame?.id || null);
    setIsDrawingInFrame(!!targetFrame);

    const newLine: ILine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: targetFrame 
        ? (() => {
            const clippedPoint = handleDrawingInFrame(stagePos, targetFrame);
            return [clippedPoint.x, clippedPoint.y];
          })()
        : [stagePos.x, stagePos.y],
      tool,
      strokeWidth: tool === 'highlighter' ? strokeWidth * 2 : strokeWidth,
      color,
      frameId: targetFrame?.id,
    };

    setLines([...lines, newLine]);
    setIsDrawing(true);
    lastPointer.current = stagePos;
    lastUpdatePoint.current = null; // Reset for new drawing

    if (onRealTimeDrawingAction) {
      onRealTimeDrawingAction(newLine);
    }
  }, [tool, strokeWidth, color, lines, findFrameAtPoint, handleDrawingInFrame, onRealTimeDrawingAction, frames.length, onCanvasClickAction]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    moveCursorAction(point.x, point.y);

    if (isPanning.current) return;

    // Handle frame creation
    if (frameCreationModeRef.current.isCreating && frameCreationModeRef.current.startPoint && frameCreationModeRef.current.currentFrame) {
      const transform = stage?.getAbsoluteTransform().copy();
      if (transform) {
        transform.invert();
        const stagePoint = transform.point(point);
        
        if (stagePoint) {
          const startX = Math.min(frameCreationModeRef.current.startPoint.x, stagePoint.x);
          const startY = Math.min(frameCreationModeRef.current.startPoint.y, stagePoint.y);
          const width = Math.abs(stagePoint.x - frameCreationModeRef.current.startPoint.x);
          const height = Math.abs(stagePoint.y - frameCreationModeRef.current.startPoint.y);
          
          frameCreationModeRef.current = {
            ...frameCreationModeRef.current,
            currentFrame: {
              ...frameCreationModeRef.current.currentFrame,
              x: startX,
              y: startY,
              width: Math.max(width, 20),
              height: Math.max(height, 20),
            },
          };
        }
      }
      return;
    }

    if (!isDrawing) return;

    const transform = stage?.getAbsoluteTransform().copy();
    if (!transform) return;

    transform.invert();
    const stagePoint = transform.point(point);

    if (isDrawingInFrame && activeFrameId) {
      const frame = frames.find(f => f.id === activeFrameId);
      if (frame) {
        const clippedPoint = handleDrawingInFrame(stagePoint, frame);
        const newPoints = [...lines[lines.length - 1].points, clippedPoint.x, clippedPoint.y];
        
        const updatedLine = {
          ...lines[lines.length - 1],
          points: newPoints,
        };

        setLines(lines.map((line, i) => 
          i === lines.length - 1 ? updatedLine : line
        ));

        // Check distance threshold before sending real-time update
        const shouldSendUpdate = !lastUpdatePoint.current || 
          Math.sqrt(
            (clippedPoint.x - lastUpdatePoint.current.x) ** 2 + 
            (clippedPoint.y - lastUpdatePoint.current.y) ** 2
          ) > MIN_UPDATE_DISTANCE;

        if (onRealTimeLineUpdateAction && shouldSendUpdate) {
          // Send simplified points for real-time updates to reduce API calls
          const simplifiedPoints = simplifyPoints(newPoints, 3); // Slightly higher tolerance for real-time
          onRealTimeLineUpdateAction({
            ...updatedLine,
            points: simplifiedPoints,
          });
          lastUpdatePoint.current = clippedPoint;
        }
      }
    } else {
      const newPoints = [...lines[lines.length - 1].points, stagePoint.x, stagePoint.y];
      
      const updatedLine = {
        ...lines[lines.length - 1],
        points: newPoints,
      };

      setLines(lines.map((line, i) => 
        i === lines.length - 1 ? updatedLine : line
      ));

      // Check distance threshold before sending real-time update
      const shouldSendUpdate = !lastUpdatePoint.current || 
        Math.sqrt(
          (stagePoint.x - lastUpdatePoint.current.x) ** 2 + 
          (stagePoint.y - lastUpdatePoint.current.y) ** 2
        ) > MIN_UPDATE_DISTANCE;

      if (onRealTimeLineUpdateAction && shouldSendUpdate) {
        // Send simplified points for real-time updates to reduce API calls
        const simplifiedPoints = simplifyPoints(newPoints, 3); // Slightly higher tolerance for real-time
        onRealTimeLineUpdateAction({
          ...updatedLine,
          points: simplifiedPoints,
        });
        lastUpdatePoint.current = stagePoint;
      }
    }

    lastPointer.current = stagePoint;
  }, [isDrawing, lines, frames, activeFrameId, isDrawingInFrame, handleDrawingInFrame, onRealTimeLineUpdateAction, moveCursorAction]);

  const handleMouseUp = useCallback(() => {
    if (frameCreationModeRef.current.isCreating && frameCreationModeRef.current.currentFrame) {
      const currentFrame = frameCreationModeRef.current.currentFrame;
      
      if (currentFrame.width && currentFrame.height && 
          currentFrame.width > 20 && currentFrame.height > 20) {
        
        const newFrame: FrameElement = {
          id: currentFrame.id || `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'frame',
          x: currentFrame.x || 0,
          y: currentFrame.y || 0,
          width: currentFrame.width,
          height: currentFrame.height,
          name: currentFrame.name || 'New Frame',
          frameType: currentFrame.frameType || 'basic',
          isCreating: false,
          style: {
            fill: 'rgba(255, 255, 255, 1.0)',
            stroke: '#3b82f6',
            strokeWidth: 2,
            fillOpacity: 1,
            strokeOpacity: 1,
          },
          metadata: {
            labels: [],
            tags: [],
            status: 'draft',
            priority: 'low',
            comments: [],
          },
          hierarchy: {
            childIds: [],
            level: 0,
            order: frames.length,
          },
          createdBy: 'current-user',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
        };
        
        addFrame(newFrame);
        
        if (onFrameAddAction) {
          onFrameAddAction(newFrame);
        }
        
        if (onRealTimeFrameAction) {
          onRealTimeFrameAction(newFrame);
        }
      }
      
      frameCreationModeRef.current = {
        isCreating: false,
        startPoint: null,
        currentFrame: null,
      };
    }

    setIsDrawing(false);
    setIsDrawingInFrame(false);
    setActiveFrameId(null);
    lastPointer.current = null;
    lastUpdatePoint.current = null; // Reset for next drawing
    isPanning.current = false;
    onDrawEndAction(lines);
  }, [lines, onDrawEndAction, addFrame, onFrameAddAction, onRealTimeFrameAction, frames.length]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.15;
    const newScale = e.evt.deltaY > 0 
      ? Math.max(0.05, oldScale / scaleBy)
      : Math.min(8, oldScale * scaleBy);

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    
    setStageScale(newScale);
    setStagePos(newPos);
    
    performanceMode.current = newScale < 0.2;
  }, []);

  // Utility functions
  const getCursor = () => {
    if (isSpacePressed.current) return 'grab';
    if (isPanning.current) return 'grabbing';
    
    switch (tool) {
      case 'select': return 'default';
      case 'pen': return 'crosshair';
      case 'highlighter': return 'crosshair';
      case 'eraser': return 'cell';
      case 'sticky-note': return 'copy';
      case 'frame': return frameCreationModeRef.current.isCreating ? 'crosshair' : 'copy';
      default: return 'crosshair';
    }
  };

  const getZoomLevel = () => {
    if (stageScale >= 2) return 'text-emerald-600';
    if (stageScale >= 1) return 'text-blue-600';
    if (stageScale >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isSpacePressed.current = true;
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            resetZoom();
            break;
          case 'g':
            e.preventDefault();
            setShowGrid(prev => !prev);
            break;
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case 'h':
            e.preventDefault();
            setShowControls(prev => !prev);
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressed.current = false;
        isPanning.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetZoom, zoomIn, zoomOut]);

  return {
    stageScale,
    stagePos,
    showGrid,
    showControls,
    controlsCollapsed,
    isDrawing,
    hoveredLineIndex,
    isStickyNoteDragging,
    isFrameDragging,
    showFrameAlignment,
    frameCreationMode: frameCreationModeRef.current,
    activeFrameId,
    isDrawingInFrame,
    performanceMode: performanceMode.current,
    isSpacePressed: isSpacePressed.current,
    isPanning: isPanning.current,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    handleLineClick,
    resetZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    setShowGrid,
    setShowControls,
    setControlsCollapsed,
    setHoveredLineIndex,
    setIsStickyNoteDragging,
    setIsFrameDragging,
    setShowFrameAlignment,
    getCursor,
    getZoomLevel,
  };
}