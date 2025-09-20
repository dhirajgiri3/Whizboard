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
  isFramePlacementMode?: boolean;
  showGrid?: boolean;
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
  isFramePlacementMode = false,
  showGrid: showGridProp = true,
}: UseCanvasInteractionsProps) {
  
  // State
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(showGridProp);
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

  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const lastUpdatePoint = useRef<{ x: number; y: number } | null>(null); // Track last update point
  const performanceMode = useRef(false);
  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);
  // Stylus pressure tracking
  const pressureRef = useRef<number>(1);
  // Keep ref to current lines for proper state tracking
  const linesRef = useRef<ILine[]>(lines);

  // Effect to update lines ref when lines change
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // Enhanced touch gesture support
  const touchGestureRef = useRef<{
    isTouch: boolean;
    touchStartTime: number;
    touchStartPoint: { x: number; y: number } | null;
    lastTouchPoint: { x: number; y: number } | null;
    touchMoveDistance: number;
    isTap: boolean;
    isLongPress: boolean;
    longPressTimer: NodeJS.Timeout | null;
    pinchStart: { distance: number; scale: number } | null;
    isPinching: boolean;
  }>({
    isTouch: false,
    touchStartTime: 0,
    touchStartPoint: null,
    lastTouchPoint: null,
    touchMoveDistance: 0,
    isTap: false,
    isLongPress: false,
    longPressTimer: null,
    pinchStart: null,
    isPinching: false,
  });

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
  const TAP_THRESHOLD = 10; // Maximum movement for tap gesture
  const LONG_PRESS_DURATION = 500; // Duration for long press
  const PINCH_THRESHOLD = 10; // Minimum distance change for pinch

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

  // Touch gesture utilities
  const calculateDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  const calculateCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  const startLongPress = useCallback((point: { x: number; y: number }) => {
    touchGestureRef.current.longPressTimer = setTimeout(() => {
      touchGestureRef.current.isLongPress = true;
      // Switch to select tool on long press for better tablet/mobile UX
      if (onToolChangeAction && tool !== 'select') {
        onToolChangeAction('select');
      }
    }, LONG_PRESS_DURATION);
  }, [onToolChangeAction, tool]);

  const cancelLongPress = useCallback(() => {
    if (touchGestureRef.current.longPressTimer) {
      clearTimeout(touchGestureRef.current.longPressTimer);
      touchGestureRef.current.longPressTimer = null;
    }
    touchGestureRef.current.isLongPress = false;
  }, []);

  const handlePinchZoom = useCallback((touches: TouchList) => {
    if (touches.length !== 2) return;

    const touch1 = touches[0];
    const touch2 = touches[1];
    const distance = calculateDistance(touch1, touch2);
    const center = calculateCenter(touch1, touch2);

    if (!touchGestureRef.current.pinchStart) {
      touchGestureRef.current.pinchStart = {
        distance,
        scale: stageScale
      };
      touchGestureRef.current.isPinching = true;
      return;
    }

    const scale = (distance / touchGestureRef.current.pinchStart.distance) * touchGestureRef.current.pinchStart.scale;
    const newScale = Math.max(0.1, Math.min(5, scale));

    if (Math.abs(newScale - stageScale) > 0.01) {
      const stage = stageRef.current;
      if (stage) {
        const stageBox = stage.container().getBoundingClientRect();
        const pointer = {
          x: center.x - stageBox.left,
          y: center.y - stageBox.top
        };

        const mousePointTo = {
          x: (pointer.x - stagePos.x) / stageScale,
          y: (pointer.y - stagePos.y) / stageScale,
        };

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };

        setStageScale(newScale);
        setStagePos(newPos);
        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        stage.batchDraw();
      }
    }
  }, [stageScale, stagePos, calculateDistance, calculateCenter]);

  const resetTouchGesture = useCallback(() => {
    cancelLongPress();
    touchGestureRef.current.isTouch = false;
    touchGestureRef.current.touchStartTime = 0;
    touchGestureRef.current.touchStartPoint = null;
    touchGestureRef.current.lastTouchPoint = null;
    touchGestureRef.current.touchMoveDistance = 0;
    touchGestureRef.current.isTap = false;
    touchGestureRef.current.pinchStart = null;
    touchGestureRef.current.isPinching = false;
  }, [cancelLongPress]);

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
    console.log('useCanvasInteractions fitToScreen called');
    const stage = stageRef.current;
    if (!stage) {
      console.log('No stage available in useCanvasInteractions');
      return;
    }
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    // Check lines
    lines.forEach(line => {
      // Skip lines that don't have valid points
      if (!line.points || !Array.isArray(line.points) || line.points.length === 0) {
        return;
      }
      
      for (let i = 0; i < line.points.length; i += 2) {
        const x = line.points[i];
        const y = line.points[i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });
    
    // Check frames
    frames.forEach(frame => {
      if (frame) {
        const frameX = frame.x || 0;
        const frameY = frame.y || 0;
        const frameWidth = frame.width || 0;
        const frameHeight = frame.height || 0;
        
        minX = Math.min(minX, frameX);
        minY = Math.min(minY, frameY);
        maxX = Math.max(maxX, frameX + frameWidth);
        maxY = Math.max(maxY, frameY + frameHeight);
      }
    });
    
    // If no content found, set default bounds
    if (minX === Infinity) {
      minX = 0;
      minY = 0;
      maxX = 1000;
      maxY = 1000;
    }
    
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
    console.log('useCanvasInteractions fitToScreen completed successfully');
  }, [stageRef, lines, frames, dimensions]);

  // Enhanced event handlers with better line interaction support
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.currentTarget.getStage();
    if (!stage) return;

    // Enhanced touch gesture detection
    const isTouch = e.evt.type === 'touchstart' || (e.evt as any).touches;
    // Capture stylus pressure when available
    const getPressureScale = (evt: any) => {
      const raw = typeof evt?.pressure === 'number' ? evt.pressure : (evt?.touches?.[0]?.force ?? 0.5);
      const clamped = Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 0.5));
      // Map [0,1] -> [0.6, 1.6]
      return 0.6 + clamped;
    };
    pressureRef.current = getPressureScale(e.evt as any);
    if (isTouch) {
      const touches = (e.evt as any).touches || [(e.evt as any)];
      touchGestureRef.current.isTouch = true;
      touchGestureRef.current.touchStartTime = Date.now();

      // Three-finger tap: toggle grid quickly (mobile convenience)
      if (touches.length === 3) {
        touchGestureRef.current.isTap = true;
        cancelLongPress();
        setShowGrid(prev => !prev);
        resetTouchGesture();
        return;
      }

      if (touches.length === 1) {
        const touch = touches[0];
        const stageBox = stage.container().getBoundingClientRect();
        const point = { 
          x: touch.clientX - stageBox.left, 
          y: touch.clientY - stageBox.top 
        };
        touchGestureRef.current.touchStartPoint = point;
        touchGestureRef.current.lastTouchPoint = point;
        touchGestureRef.current.touchMoveDistance = 0;
        touchGestureRef.current.isTap = true;
        // Start long press detection for single touch
        startLongPress(point);
      } else if (touches.length === 2) {
        // Two-finger tap (no move): quick reset zoom
        touchGestureRef.current.isTap = true;
        cancelLongPress();
        // Initialize pinch if movement occurs; otherwise treat as two-finger tap
        touchGestureRef.current.pinchStart = null;
        touchGestureRef.current.isPinching = false;
        // Defer: if no movement within short window, reset zoom
        const timeout = setTimeout(() => {
          if (touchGestureRef.current.isTap && !touchGestureRef.current.isPinching) {
            resetZoom();
            resetTouchGesture();
          }
        }, 180);
        // Store timer locally on ref to clear if movement happens
        (touchGestureRef.current as any)._twoFingerTimer = timeout;
        return; // Don't proceed with drawing for multi-touch
      } else {
        // More than 3 touches - cancel all gestures
        resetTouchGesture();
        return;
      }
    }

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
      // Delegate frame creation to external handler for better control
      if (onCanvasClickAction) {
        onCanvasClickAction(e);
      }
      return; // Skip internal frame-draw flow
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

    if (tool === 'shapes') {
      // For shapes tool, pass the click to canvas click handler for shape creation
      if (onCanvasClickAction) {
        onCanvasClickAction(e);
      }
      return;
    }

    if (tool === 'image') {
      // For image tool, pass the click to canvas click handler for image creation
      if (onCanvasClickAction) {
        onCanvasClickAction(e);
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

    const baseWidth = tool === 'highlighter' ? strokeWidth * 2 : strokeWidth;
    const appliedWidth = Math.max(1, Math.round(baseWidth * pressureRef.current));
    const newLine: ILine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: targetFrame 
        ? (() => {
            const clippedPoint = handleDrawingInFrame(stagePos, targetFrame);
            return [clippedPoint.x, clippedPoint.y];
          })()
        : [stagePos.x, stagePos.y],
      tool,
      strokeWidth: appliedWidth,
      color,
      frameId: targetFrame?.id,
    };

    setLines(currentLines => [...currentLines, newLine]);
    setIsDrawing(true);
    lastPointer.current = stagePos;
    lastUpdatePoint.current = null; // Reset for new drawing

    if (onRealTimeDrawingAction) {
      onRealTimeDrawingAction(newLine);
    }

    // If we are in preset frame placement mode, forward the event and exit early
    if (isFramePlacementMode && onCanvasClickAction) {
      onCanvasClickAction(e);
      return;
    }
  }, [tool, strokeWidth, color, lines, findFrameAtPoint, handleDrawingInFrame, onRealTimeDrawingAction, frames.length, onCanvasClickAction, isFramePlacementMode, startLongPress, cancelLongPress, resetZoom, resetTouchGesture, setShowGrid]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    // Enhanced touch gesture handling
    const isTouch = e.evt.type === 'touchmove' || (e.evt as any).touches;
    // Update pressure on move for stylus
    const getPressureScale = (evt: any) => {
      const raw = typeof evt?.pressure === 'number' ? evt.pressure : (evt?.touches?.[0]?.force ?? 0.5);
      const clamped = Math.max(0, Math.min(1, Number.isFinite(raw) ? raw : 0.5));
      return 0.6 + clamped;
    };
    pressureRef.current = getPressureScale(e.evt as any);
    if (isTouch && touchGestureRef.current.isTouch) {
      const touches = (e.evt as any).touches || [(e.evt as any)];

      if (touches.length === 2) {
        // If there was a pending two-finger tap timer, cancel it because we started moving
        const pending = (touchGestureRef.current as any)._twoFingerTimer as NodeJS.Timeout | undefined;
        if (pending) {
          clearTimeout(pending);
          (touchGestureRef.current as any)._twoFingerTimer = undefined;
        }
        // Handle pinch zoom safely
        handlePinchZoom(touches);
        touchGestureRef.current.isPinching = true;
        touchGestureRef.current.isTap = false;
        return;
      }
      // Track movement distance for tap detection
      const touch = touches[0];
      const stageBox = stage?.container().getBoundingClientRect();
      if (!stageBox) return;
      if (touchGestureRef.current.touchStartPoint) {
        const currentPoint = { 
          x: touch.clientX - stageBox.left, 
          y: touch.clientY - stageBox.top 
        };

        const distance = Math.sqrt(
          Math.pow(currentPoint.x - touchGestureRef.current.touchStartPoint.x, 2) +
          Math.pow(currentPoint.y - touchGestureRef.current.touchStartPoint.y, 2)
        );

        touchGestureRef.current.touchMoveDistance = distance;
        touchGestureRef.current.lastTouchPoint = currentPoint;

        // Cancel tap if movement exceeds threshold
        if (distance > TAP_THRESHOLD) {
          touchGestureRef.current.isTap = false;
          cancelLongPress();
        }
      }
    }

    moveCursorAction(point.x, point.y);

    if (isPanning.current) return;

    // Frame creation is now handled externally through onCanvasClickAction
    // No internal frame creation logic needed here

    if (!isDrawing) return;

    const transform = stage?.getAbsoluteTransform().copy();
    if (!transform) return;

    transform.invert();
    const stagePoint = transform.point(point);

    if (isDrawingInFrame && activeFrameId) {
      const frame = frames.find(f => f.id === activeFrameId);
      const currentLines = linesRef.current;
      if (frame && currentLines.length > 0) {
        const lastLine = currentLines[currentLines.length - 1];
        if (!lastLine.points || !Array.isArray(lastLine.points)) {
          return; // Skip if the last line doesn't have valid points
        }
        
        const clippedPoint = handleDrawingInFrame(stagePoint, frame);
        const newPoints = [...lastLine.points, clippedPoint.x, clippedPoint.y];
        
        const updatedLine = {
          ...lastLine,
          points: newPoints,
          // Apply pressure-based width dynamically
          strokeWidth: Math.max(1, Math.round((lastLine.tool === 'highlighter' ? strokeWidth * 2 : strokeWidth) * pressureRef.current)),
        };

        setLines(currentLines => currentLines.map((line, i) =>
          i === currentLines.length - 1 ? updatedLine : line
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
      const currentLines = linesRef.current;
      if (currentLines.length === 0) {
        return; // Skip if there are no lines to update
      }

      const lastLine = currentLines[currentLines.length - 1];
      if (!lastLine.points || !Array.isArray(lastLine.points)) {
        return; // Skip if the last line doesn't have valid points
      }
      
      const newPoints = [...lastLine.points, stagePoint.x, stagePoint.y];
      
      const updatedLine = {
        ...lastLine,
        points: newPoints,
        strokeWidth: Math.max(1, Math.round((lastLine.tool === 'highlighter' ? strokeWidth * 2 : strokeWidth) * pressureRef.current)),
      };

      setLines(currentLines => currentLines.map((line, i) =>
        i === currentLines.length - 1 ? updatedLine : line
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
  }, [isDrawing, frames, activeFrameId, isDrawingInFrame, handleDrawingInFrame, onRealTimeLineUpdateAction, moveCursorAction, handlePinchZoom, tool, strokeWidth]);

  const handleMouseUp = useCallback(() => {
    // Enhanced touch gesture completion
    if (touchGestureRef.current.isTouch) {
      const touchDuration = Date.now() - touchGestureRef.current.touchStartTime;

      // Clear any pending two-finger timer
      const pending = (touchGestureRef.current as any)._twoFingerTimer as NodeJS.Timeout | undefined;
      if (pending) {
        clearTimeout(pending);
        (touchGestureRef.current as any)._twoFingerTimer = undefined;
      }

      // Handle tap gesture
      if (touchGestureRef.current.isTap && 
          touchGestureRef.current.touchMoveDistance <= TAP_THRESHOLD &&
          touchDuration < LONG_PRESS_DURATION) {
        // Tap is handled by normal click logic
      }

      // Handle long press completion
      if (touchGestureRef.current.isLongPress) {
        // Could trigger context menu or tool switch in future
      }

      // Reset touch gesture state
      resetTouchGesture();
    }

    // Frame creation is now handled externally through onCanvasClickAction

    setIsDrawing(false);
    setIsDrawingInFrame(false);
    setActiveFrameId(null);
    lastPointer.current = null;
    lastUpdatePoint.current = null; // Reset for next drawing
    isPanning.current = false;
    // Critical fix: Only call onDrawEndAction if we were actually drawing with pen/highlighter
    if (isDrawing && (tool === 'pen' || tool === 'highlighter')) {
      // Use ref to get current lines and defer the callback to avoid setState during render
      const currentLines = linesRef.current;
      Promise.resolve().then(() => {
        onDrawEndAction(currentLines);
      });
    }
  }, [isDrawing, tool, onDrawEndAction, resetTouchGesture]);

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
      case 'frame': return 'crosshair';
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

  useEffect(() => {
    setShowGrid(showGridProp);
  }, [showGridProp]);

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