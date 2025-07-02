import { Stage, Layer, Line, Circle } from 'react-konva';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Tool } from '../toolbar/MainToolbar';
import type { KonvaEventObject } from 'konva/lib/Node';
import { ILine } from '@/app/board/[id]/page';
import { StickyNoteElement, FrameElement } from '@/types';
import LiveCursors, { Cursor } from './LiveCursors';
import StickyNote from './StickyNote';
import Frame from './Frame';
import Konva from 'konva';
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
  PenTool
} from 'lucide-react';

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function smoothPoints(points: number[] | undefined, smoothness: number = 0.3): number[] {
  if (!points || !Array.isArray(points) || points.length < 6) {
    return points || [];
  }
  
  const smoothed: number[] = [];
  smoothed.push(points[0], points[1]);
  
  for (let i = 2; i < points.length - 2; i += 2) {
    const prevX = points[i - 2];
    const prevY = points[i - 1];
    const currX = points[i];
    const currY = points[i + 1];
    const nextX = points[i + 2];
    const nextY = points[i + 3];
    
    if (typeof prevX !== 'number' || typeof prevY !== 'number' || 
        typeof currX !== 'number' || typeof currY !== 'number' ||
        typeof nextX !== 'number' || typeof nextY !== 'number') {
      smoothed.push(currX || 0, currY || 0);
      continue;
    }
    
    const smoothX = currX + (nextX - prevX) * smoothness * 0.1;
    const smoothY = currY + (nextY - prevY) * smoothness * 0.1;
    
    smoothed.push(smoothX, smoothY);
  }
  
  smoothed.push(points[points.length - 2], points[points.length - 1]);
  return smoothed;
}

interface DrawingCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  tool: Tool;
  color: string;
  strokeWidth: number;
  initialLines: ILine[];
  initialStickyNotes?: StickyNoteElement[];
  initialFrames?: FrameElement[];
  selectedStickyNote?: string | null;
  selectedFrame?: string | null;
  onDrawEndAction: (lines: ILine[]) => void;
  onEraseAction?: (lineId: string) => void;
  onStickyNoteAddAction?: (stickyNote: StickyNoteElement) => void;
  onStickyNoteUpdateAction?: (stickyNote: StickyNoteElement) => void;
  onStickyNoteDeleteAction?: (stickyNoteId: string) => void;
  onStickyNoteSelectAction?: (stickyNoteId: string) => void;
  onStickyNoteDragStartAction?: () => void;
  onStickyNoteDragEndAction?: () => void;
  onFrameAddAction?: (frame: FrameElement) => void;
  onFrameUpdateAction?: (frame: FrameElement) => void;
  onFrameDeleteAction?: (frameId: string) => void;
  onFrameSelectAction?: (frameId: string) => void;
  onFrameDragStartAction?: () => void;
  onFrameDragEndAction?: () => void;
  onCanvasClickAction?: (e: KonvaEventObject<MouseEvent>) => void;
  onToolChangeAction?: (tool: Tool) => void; // New prop for tool activation
  cursors: Record<string, Cursor>;
  moveCursorAction: (x: number, y: number) => void;
  onRealTimeDrawingAction?: (line: ILine) => void;
  onRealTimeLineUpdateAction?: (line: ILine) => void;
  onRealTimeFrameAction?: (frame: FrameElement) => void;
}

interface GridProps {
  width: number;
  height: number;
  scale: number;
  x: number;
  y: number;
}

function EnhancedGrid({ width, height, scale, x, y }: GridProps) {
  const lines = [];
  const gridSize = 20;
  const opacity = Math.min(Math.max(scale * 0.4, 0.05), 0.2);
  
  if (scale < 0.1) return null;
  
  const startX = Math.floor((-x / scale) / gridSize) * gridSize;
  const startY = Math.floor((-y / scale) / gridSize) * gridSize;
  const endX = startX + (width / scale) + gridSize * 2;
  const endY = startY + (height / scale) + gridSize * 2;
  
  const majorOpacity = Math.min(Math.max(scale * 0.6, 0.08), 0.3);
  
  for (let i = startX; i < endX; i += gridSize) {
    const isMajor = Math.abs(i) % (gridSize * 5) === 0;
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, startY, i, endY]}
        stroke={isMajor ? "#64748b" : "#e2e8f0"}
        strokeWidth={(isMajor ? 0.6 : 0.25) / scale}
        opacity={isMajor ? majorOpacity : opacity}
        perfectDrawEnabled={false}
        listening={false}
      />
    );
  }
  
  for (let i = startY; i < endY; i += gridSize) {
    const isMajor = Math.abs(i) % (gridSize * 5) === 0;
    lines.push(
      <Line
        key={`h-${i}`}
        points={[startX, i, endX, i]}
        stroke={isMajor ? "#64748b" : "#e2e8f0"}
        strokeWidth={(isMajor ? 0.6 : 0.25) / scale}
        opacity={isMajor ? majorOpacity : opacity}
        perfectDrawEnabled={false}
        listening={false}
      />
    );
  }
  
  return <>{lines}</>;
}

export default function DrawingCanvas({
  stageRef,
  tool,
  color,
  strokeWidth,
  initialLines,
  initialStickyNotes = [],
  initialFrames = [],
  selectedStickyNote,
  selectedFrame,
  onDrawEndAction,
  onEraseAction,
  onStickyNoteUpdateAction,
  onStickyNoteDeleteAction,
  onStickyNoteSelectAction,
  onStickyNoteDragStartAction,
  onStickyNoteDragEndAction,
  onFrameAddAction,
  onFrameUpdateAction,
  onFrameDeleteAction,
  onFrameSelectAction,
  onFrameDragStartAction,
  onFrameDragEndAction,
  onCanvasClickAction,
  onToolChangeAction,
  cursors,
  moveCursorAction,
  onRealTimeDrawingAction,
  onRealTimeLineUpdateAction,
  onRealTimeFrameAction,
}: DrawingCanvasProps) {
  const [lines, setLines] = useState<ILine[]>(initialLines);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteElement[]>(initialStickyNotes);
  const [frames, setFrames] = useState<FrameElement[]>(initialFrames);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1920, 
    height: typeof window !== 'undefined' ? window.innerHeight : 1080 
  });
  
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const [isStickyNoteDragging, setIsStickyNoteDragging] = useState(false);
  const [isFrameDragging, setIsFrameDragging] = useState(false);
  const [frameCreationMode, setFrameCreationMode] = useState<{
    isCreating: boolean;
    startPoint: { x: number; y: number } | null;
    currentFrame: Partial<FrameElement> | null;
  }>({
    isCreating: false,
    startPoint: null,
    currentFrame: null,
  });
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const performanceMode = useRef(false);
  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);
  
  const handleLineClick = useCallback(
    (lineIdx: number) => {
      if (tool === 'eraser' && onEraseAction) {
        const line = lines[lineIdx];
        if (line && 'id' in line) {
          onEraseAction(line.id as string);
        }
      } else if (tool !== 'pen' && onToolChangeAction) {
        // Activate pen tool when clicking on a pen-drawn line
        const line = lines[lineIdx];
        if (line && line.tool === 'pen') {
          onToolChangeAction('pen');
        }
      }
    },
    [tool, onEraseAction, onToolChangeAction, lines]
  );

  const memoizedLines = useMemo(() => {
    return lines.map((line, i) => {
      if (!line || !line.points || !Array.isArray(line.points) || line.points.length === 0) {
        return null;
      }
      
      const validPoints = line.points.filter((point) => 
        typeof point === 'number' && !isNaN(point) && isFinite(point)
      );
      
      if (validPoints.length < 2) {
        return null;
      }
      
      const points = performanceMode.current ? validPoints : smoothPoints(validPoints, 0.5);
      const uniqueKey = line.id ? `line-${line.id}-idx-${i}` : `line-noId-${i}`;
      
      // Determine if line should be clickable
      const isClickable = tool === 'eraser' || (tool !== 'pen' && line.tool === 'pen');
      const isHovered = hoveredLineIndex === i;
      const isPenLine = line.tool === 'pen';
      
      // Calculate shadow properties
      const shadowColor = isPenLine && isHovered && tool !== 'eraser' 
        ? '#3b82f6' 
        : (line.tool === 'pen' ? line.color : undefined);
      const shadowBlur = isPenLine && isHovered && tool !== 'eraser' 
        ? 4 
        : (line.tool === 'pen' ? 1 : 0);
      const shadowOpacity = isPenLine && isHovered && tool !== 'eraser' ? 0.4 : 0.1;
      
      return (
        <Line
          key={uniqueKey}
          points={points}
          stroke={line.color || '#000000'}
          strokeWidth={line.strokeWidth || 2}
          tension={0.4}
          lineCap="round"
          lineJoin="round"
          shadowColor={shadowColor}
          shadowBlur={shadowBlur}
          shadowOpacity={shadowOpacity}
          globalCompositeOperation={
            line.tool === 'eraser' ? 'destination-out' : 'source-over'
          }
          perfectDrawEnabled={false}
          listening={isClickable}
          onClick={isClickable ? () => handleLineClick(i) : undefined}
          onTap={isClickable ? () => handleLineClick(i) : undefined} // For touch devices
          onMouseEnter={isClickable && isPenLine && tool !== 'eraser' ? () => setHoveredLineIndex(i) : undefined}
          onMouseLeave={isClickable && isPenLine && tool !== 'eraser' ? () => setHoveredLineIndex(null) : undefined}
          hitStrokeWidth={Math.max(line.strokeWidth || 2, 8)} // Make lines easier to click
          // Add hover effects for pen lines
          opacity={isPenLine && isHovered && tool !== 'eraser' ? 0.8 : 1}
        />
      );
    }).filter(Boolean);
  }, [lines, tool, handleLineClick, hoveredLineIndex]);

  useEffect(() => {
    setLines(initialLines);
  }, [initialLines]);

  useEffect(() => {
    setStickyNotes(initialStickyNotes);
  }, [initialStickyNotes]);

  useEffect(() => {
    setFrames(initialFrames);
  }, [initialFrames]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            setShowGrid(!showGrid);
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
            setShowControls(!showControls);
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
  });

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

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.currentTarget.getStage();
    if (!stage) return;

    if (isSpacePressed.current || tool === 'select') {
      isPanning.current = true;
      if (tool === 'select' && e.target === stage && onStickyNoteSelectAction) {
        onStickyNoteSelectAction('');
      }
      return;
    }

    let clickedOnStickyNote = false;
    let currentNode: Konva.Node | Konva.Stage | null = e.target;
    while (currentNode && currentNode !== stage) {
      if (typeof currentNode.hasName === 'function' && currentNode.hasName('sticky-note')) {
        clickedOnStickyNote = true;
        break;
      }
      currentNode = currentNode.getParent();
    }

    if (clickedOnStickyNote) {
      return;
    }
    
    if (tool === 'sticky-note') {
      if (onCanvasClickAction) {
        onCanvasClickAction(e);
      }
      return;
    }

    if (tool === 'frame') {
      // Start frame creation  
      const framePos = stage.getPointerPosition();
      if (framePos) {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const stagePoint = transform.point(framePos);
        
        if (stagePoint) {
          setFrameCreationMode({
            isCreating: true,
            startPoint: stagePoint,
            currentFrame: {
              id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              x: stagePoint.x,
              y: stagePoint.y,
              width: 0,
              height: 0,
              name: 'New Frame',
              frameType: 'basic',
              style: {
                fill: 'rgba(255, 255, 255, 0.8)',
                stroke: '#3b82f6',
                strokeWidth: 2,
              },
            },
          });
        }
      }
      return;
    }
    
    if (tool !== 'pen' && tool !== 'eraser') {
      return;
    }

    setIsDrawing(true);
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePos = transform.point(pos);
    
    const newLine: ILine = { 
      id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points: [stagePos.x, stagePos.y], 
      tool, 
      color, 
      strokeWidth: tool === 'eraser' ? strokeWidth * 2.5 : strokeWidth 
    };
    
    setLines(prev => [...prev, newLine]);
    if (onRealTimeDrawingAction) {
      onRealTimeDrawingAction(newLine);
    }
  }, [tool, color, strokeWidth, onRealTimeDrawingAction, onCanvasClickAction, onStickyNoteSelectAction, isSpacePressed]);

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;

    moveCursorAction(point.x, point.y);

    if (isPanning.current) {
      return;
    }

    // Handle frame creation
    if (frameCreationMode.isCreating && frameCreationMode.startPoint && frameCreationMode.currentFrame) {
      const stage = e.target.getStage();
      const transform = stage?.getAbsoluteTransform().copy();
      if (transform) {
        transform.invert();
        const stagePoint = transform.point(point);
        
        if (stagePoint) {
          const startX = Math.min(frameCreationMode.startPoint.x, stagePoint.x);
          const startY = Math.min(frameCreationMode.startPoint.y, stagePoint.y);
          const width = Math.abs(stagePoint.x - frameCreationMode.startPoint.x);
          const height = Math.abs(stagePoint.y - frameCreationMode.startPoint.y);
          
          setFrameCreationMode(prev => ({
            ...prev,
            currentFrame: prev.currentFrame ? {
              ...prev.currentFrame,
              x: startX,
              y: startY,
              width,
              height,
            } : null,
          }));
        }
      }
      return;
    }

    if (!isDrawing) return;

    const transform = stage?.getAbsoluteTransform().copy();
    if (!transform) return;
    
    transform.invert();
    const stagePoint = transform.point(point);

    if (lastPointer.current) {
      const dist = getDistance(lastPointer.current, stagePoint);
      if (dist < 0.5) return;
    }
    
    lastPointer.current = stagePoint;

    setLines(prev => {
      const newLines = [...prev];
      const lastLine = newLines[newLines.length - 1];
      if (lastLine) {
        const updatedLine = {
          ...lastLine,
          points: [...lastLine.points, stagePoint.x, stagePoint.y]
        };
        newLines[newLines.length - 1] = updatedLine;
        
        if (onRealTimeLineUpdateAction) {
          onRealTimeLineUpdateAction(updatedLine);
        }
      }
      return newLines;
    });
  }, [isDrawing, moveCursorAction, onRealTimeLineUpdateAction]);

  const handleMouseUp = useCallback(() => {
    // Handle frame creation completion
    if (frameCreationMode.isCreating && frameCreationMode.currentFrame) {
      const currentFrame = frameCreationMode.currentFrame;
      
      // Only create frame if it has meaningful dimensions
      if (currentFrame.width && currentFrame.height && 
          currentFrame.width > 10 && currentFrame.height > 10) {
        
        const newFrame: FrameElement = {
          ...currentFrame,
          type: 'frame',
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
          createdBy: 'current-user', // You can get this from session
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
        } as FrameElement;
        
        setFrames(prev => [...prev, newFrame]);
        
        if (onFrameAddAction) {
          onFrameAddAction(newFrame);
        }
        
        if (onRealTimeFrameAction) {
          onRealTimeFrameAction(newFrame);
        }
      }
      
      // Reset frame creation mode
      setFrameCreationMode({
        isCreating: false,
        startPoint: null,
        currentFrame: null,
      });
    }

    setIsDrawing(false);
    lastPointer.current = null;
    isPanning.current = false;
    onDrawEndAction(lines);
  }, [frameCreationMode, frames, onFrameAddAction, onRealTimeFrameAction, lines, onDrawEndAction]);

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

  const handleStickyNoteDragStart = useCallback(() => {
    setIsStickyNoteDragging(true);
    if (onStickyNoteDragStartAction) {
      onStickyNoteDragStartAction();
    }
  }, [onStickyNoteDragStartAction]);

  const handleStickyNoteDragEnd = useCallback(() => {
    setIsStickyNoteDragging(false);
    if (onStickyNoteDragEndAction) {
      onStickyNoteDragEndAction();
    }
  }, [onStickyNoteDragEndAction]);

  // Frame event handlers
  const handleFrameSelect = useCallback((frameId: string) => {
    if (onFrameSelectAction) {
      onFrameSelectAction(frameId);
    }
  }, [onFrameSelectAction]);

  const handleFrameUpdate = useCallback((updatedFrame: FrameElement) => {
    setFrames(prev => prev.map(frame => 
      frame.id === updatedFrame.id ? updatedFrame : frame
    ));
    
    if (onFrameUpdateAction) {
      onFrameUpdateAction(updatedFrame);
    }
    
    if (onRealTimeFrameAction) {
      onRealTimeFrameAction(updatedFrame);
    }
  }, [onFrameUpdateAction, onRealTimeFrameAction]);

  const handleFrameDelete = useCallback((frameId: string) => {
    setFrames(prev => prev.filter(frame => frame.id !== frameId));
    
    if (onFrameDeleteAction) {
      onFrameDeleteAction(frameId);
    }
  }, [onFrameDeleteAction]);

  const handleFrameDragStart = useCallback(() => {
    setIsFrameDragging(true);
    if (onFrameDragStartAction) {
      onFrameDragStartAction();
    }
  }, [onFrameDragStartAction]);

  const handleFrameDragEnd = useCallback(() => {
    setIsFrameDragging(false);
    if (onFrameDragEndAction) {
      onFrameDragEndAction();
    }
  }, [onFrameDragEndAction]);

  const getCursor = () => {
    if (isSpacePressed.current) return 'grab';
    if (isPanning.current) return 'grabbing';
    
    switch (tool) {
      case 'select': return 'default';
      case 'pen': return 'crosshair';
      case 'eraser': return 'cell';
      case 'sticky-note': return 'copy';
      case 'frame': return frameCreationMode.isCreating ? 'crosshair' : 'copy';
      default: return 'crosshair';
    }
  };

  const getZoomLevel = () => {
    if (stageScale >= 2) return 'text-emerald-600';
    if (stageScale >= 1) return 'text-blue-600';
    if (stageScale >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
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
                  <div className="text-xs text-gray-500 font-medium">Canvas</div>
                </div>
                <button
                  onClick={() => setControlsCollapsed(!controlsCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-gray-100/80 transition-all duration-200 text-gray-500 hover:scale-110"
                  title={controlsCollapsed ? "Expand controls" : "Collapse controls"}
                >
                  {controlsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>
              </div>
            </div>
            
            {!controlsCollapsed && (
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Zoom</div>
                  <div className="flex gap-1">
                    <button
                      onClick={zoomIn}
                      className="flex-1 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-700 group"
                      title="Zoom In (Ctrl + +)"
                    >
                      <ZoomIn size={16} className="mx-auto group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={zoomOut}
                      className="flex-1 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-all duration-200 text-blue-600 hover:text-blue-700 group"
                      title="Zoom Out (Ctrl + -)"
                    >
                      <ZoomOut size={16} className="mx-auto group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={resetZoom}
                      className="flex-1 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 text-gray-600 hover:text-gray-700 group"
                      title="Reset Zoom (Ctrl + 0)"
                    >
                      <RotateCcw size={16} className="mx-auto group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">View</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowGrid(!showGrid)}
                      className={`flex-1 p-2.5 rounded-xl transition-all duration-200 group ${
                        showGrid 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-700'
                      }`}
                      title="Toggle Grid (Ctrl + G)"
                    >
                      <Grid size={16} className="mx-auto group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={fitToScreen}
                      className="flex-1 p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 transition-all duration-200 text-purple-600 hover:text-purple-700 group"
                      title="Fit to Screen"
                      disabled={lines.length === 0}
                    >
                      <Maximize2 size={16} className="mx-auto group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => setShowControls(false)}
                      className="flex-1 p-2.5 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 text-red-600 hover:text-red-700 group"
                      title="Hide Controls (Ctrl + H)"
                    >
                      <EyeOff size={16} className="mx-auto group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-6 right-6 z-30 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 hover:bg-white hover:shadow-2xl transition-all duration-300 text-gray-700 hover:text-gray-900 group"
          title="Show Controls (Ctrl + H)"
        >
          <Settings size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        draggable={tool === 'select' || isSpacePressed.current}
        style={{ cursor: getCursor() }}
        hitOnDragEnabled={true}
      >
        <Layer>
          {showGrid && (
            <EnhancedGrid 
              width={dimensions.width} 
              height={dimensions.height} 
              scale={stageScale}
              x={stagePos.x}
              y={stagePos.y}
            />
          )}
        </Layer>
        
        <Layer>
          {memoizedLines}
        </Layer>
        
        <Layer>
          {/* Render existing frames */}
          {frames.map((frame, index) => (
            <Frame
              key={`frame-${frame.id}-idx-${index}`}
              frame={frame}
              isSelected={selectedFrame === frame.id}
              isDraggable={tool === 'select' || tool === 'frame'}
              onSelect={handleFrameSelect}
              onUpdate={handleFrameUpdate}
              onDelete={handleFrameDelete}
              onDragStart={handleFrameDragStart}
              onDragEnd={handleFrameDragEnd}
              scale={stageScale}
              stageRef={stageRef}
            />
          ))}
          
          {/* Render frame being created */}
          {frameCreationMode.isCreating && frameCreationMode.currentFrame && (
            <Frame
              frame={frameCreationMode.currentFrame as FrameElement}
              isSelected={true}
              isDraggable={false}
              onSelect={() => {}}
              onUpdate={() => {}}
              onDelete={() => {}}
              scale={stageScale}
              stageRef={stageRef}
            />
          )}
        </Layer>
        
        <Layer>
          {stickyNotes.map((stickyNote, index) => (
            <StickyNote
              key={`sticky-${stickyNote.id}-idx-${index}`}
              id={stickyNote.id}
              x={stickyNote.x}
              y={stickyNote.y}
              width={stickyNote.width}
              height={stickyNote.height}
              text={stickyNote.text}
              color={stickyNote.color}
              fontSize={stickyNote.fontSize}
              isSelected={selectedStickyNote === stickyNote.id}
              onSelectAction={onStickyNoteSelectAction || (() => {})}
              onTextChangeAction={(id, text) => {
                if (onStickyNoteUpdateAction) {
                  const updatedStickyNote = {
                    ...stickyNote,
                    text,
                    updatedAt: Date.now(),
                  };
                  onStickyNoteUpdateAction(updatedStickyNote);
                }
              }}
              onPositionChangeAction={(id, x, y) => {
                if (onStickyNoteUpdateAction) {
                  onStickyNoteUpdateAction({
                    ...stickyNote,
                    x,
                    y,
                    updatedAt: Date.now(),
                  });
                }
              }}
              onDeleteAction={onStickyNoteDeleteAction || (() => {})}
              onDragStartAction={() => handleStickyNoteDragStart()}
              onDragEndAction={() => handleStickyNoteDragEnd()}
              isDraggable={tool === 'select' || tool === 'sticky-note'}
            />
          ))}
        </Layer>
        
        <Layer>
          <LiveCursors cursors={cursors} />
        </Layer>
        
        <Layer>
          {tool === 'eraser' && lastPointer.current && (
            <Circle
              x={lastPointer.current.x}
              y={lastPointer.current.y}
              radius={strokeWidth * 1.2}
              stroke="#ef4444"
              strokeWidth={2}
              dash={[4, 4]}
              opacity={0.8}
            />
          )}
        </Layer>
      </Stage>

      <div className="absolute bottom-6 left-6 right-6 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {performanceMode.current && (
            <div className="bg-amber-50/90 backdrop-blur-sm text-amber-700 border border-amber-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm">
              ⚡ Performance Mode
            </div>
          )}
          
          {isSpacePressed.current && (
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

          {frameCreationMode.isCreating && (
            <div className="bg-blue-50/90 backdrop-blur-sm text-blue-700 border border-blue-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2 animate-pulse">
              <Grid size={12} />
              Creating Frame
            </div>
          )}

          {hoveredLineIndex !== null && tool !== 'pen' && tool !== 'eraser' && (
            <div className="bg-indigo-50/90 backdrop-blur-sm text-indigo-700 border border-indigo-200/60 rounded-full px-4 py-2 text-xs font-medium shadow-sm flex items-center gap-2 animate-pulse">
              <PenTool size={12} />
              Click to activate pen tool
            </div>
          )}
        </div>
      </div>
    </div>
  );
}