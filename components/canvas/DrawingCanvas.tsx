import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { Tool } from '@/types';
import { StickyNoteElement, FrameElement, ILine, TextElement, ShapeElement } from '@/types';
import { useFrameManager } from '@/hooks/useFrameManager';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { CanvasLayers } from './CanvasLayers';
import { CanvasControls } from './CanvasControls';
import { Cursor } from '../reatime/LiveCursors';
import TextEditor from './text/TextEditor';

interface DrawingCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  tool: Tool;
  color: string;
  strokeWidth: number;
  initialLines: ILine[];
  initialStickyNotes?: StickyNoteElement[];
  initialFrames?: FrameElement[];
  initialTextElements?: TextElement[];
  initialShapes?: ShapeElement[];
  isFramePlacementMode?: boolean;
  selectedStickyNote?: string | null;
  selectedFrame?: string | null;
  selectedTextElement?: string | null;
  editingTextElement?: TextElement | null;
  selectedShape?: string | null;
  selectedShapes?: string[];
  isMobile?: boolean;
  isTablet?: boolean;
  showGrid?: boolean;
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
  onTextElementAddAction?: (textElement: TextElement) => void;
  onTextElementUpdateAction?: (textElement: TextElement) => void;
  onTextElementDeleteAction?: (textElementId: string) => void;
  onTextElementSelectAction?: (textElementId: string) => void;
  onTextElementStartEditAction?: (textElement: TextElement) => void;
  onTextElementFinishEditAction?: () => void;
  onTextElementDragStartAction?: () => void;
  onTextElementDragEndAction?: () => void;
  onShapeAddAction?: (shape: ShapeElement) => void;
  onShapeUpdateAction?: (shape: ShapeElement) => void;
  onShapeDeleteAction?: (shapeId: string) => void;
  onShapeSelectAction?: (shapeId: string) => void;
  onShapeDragStartAction?: () => void;
  onShapeDragEndAction?: () => void;
  onCanvasClickAction?: (e: KonvaEventObject<MouseEvent>) => void;
  onToolChangeAction?: (tool: Tool) => void;
  cursors: Record<string, Cursor>;
  moveCursorAction: (x: number, y: number) => void;
  onRealTimeDrawingAction?: (line: ILine) => void;
  onRealTimeLineUpdateAction?: (line: ILine) => void;
  onRealTimeFrameAction?: (frame: FrameElement) => void;
  onRealTimeFrameDeleteAction?: (frameId: string) => void;
  onRealTimeTextElementAction?: (textElement: TextElement) => void;
  onRealTimeTextElementDeleteAction?: (textElementId: string) => void;
}

export default function DrawingCanvas({
  stageRef,
  tool,
  color,
  strokeWidth,
  initialLines,
  initialStickyNotes = [],
  initialFrames = [],
  initialTextElements = [],
  initialShapes = [],
  isFramePlacementMode = false,
  selectedStickyNote,
  selectedFrame,
  selectedTextElement,
  editingTextElement,
  selectedShape,
  selectedShapes,
  isMobile = false,
  isTablet = false,
  showGrid: showGridProp = true,
  onDrawEndAction,
  onEraseAction,
  onStickyNoteAddAction,
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
  onTextElementAddAction,
  onTextElementUpdateAction,
  onTextElementDeleteAction,
  onTextElementSelectAction,
  onTextElementStartEditAction,
  onTextElementFinishEditAction,
  onTextElementDragStartAction,
  onTextElementDragEndAction,
  onShapeAddAction,
  onShapeUpdateAction,
  onShapeDeleteAction,
  onShapeSelectAction,
  onShapeDragStartAction,
  onShapeDragEndAction,
  onCanvasClickAction,
  onToolChangeAction,
  cursors,
  moveCursorAction,
  onRealTimeDrawingAction,
  onRealTimeLineUpdateAction,
  onRealTimeFrameAction,
  onRealTimeFrameDeleteAction,
  onRealTimeTextElementAction,
  onRealTimeTextElementDeleteAction,
}: DrawingCanvasProps) {
  // State management
  const [lines, setLines] = useState<ILine[]>(initialLines);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteElement[]>(initialStickyNotes);
  const [textElements, setTextElements] = useState<TextElement[]>(initialTextElements);
  const [shapes, setShapes] = useState<ShapeElement[]>(initialShapes);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1920, 
    height: typeof window !== 'undefined' ? window.innerHeight : 1080 
  });

  // Frame management
  const {
    frames,
    selectedFrameIds,
    addFrame,
    updateFrame: managerUpdateFrame,
    deleteFrame: managerDeleteFrame,
    selectFrame,
    selectFrames,
    clearSelection,
    replaceFrames,
    selectAll,
  } = useFrameManager(initialFrames);

  // Canvas interactions hook
  const {
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
    frameCreationMode,
    activeFrameId,
    isDrawingInFrame,
    performanceMode,
    isSpacePressed,
    isPanning,
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
    getCursor,
    getZoomLevel,
  } = useCanvasInteractions({
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
    isFramePlacementMode,
    showGrid: showGridProp,
  });

  // Responsive canvas settings
  const isSmallScreen = isMobile || isTablet;
  const touchOptimized = isMobile;

  // Enhanced touch handling for mobile and tablet
  useEffect(() => {
    if (!touchOptimized && !isTablet) return;

    const preventDefaultTouch = (e: TouchEvent) => {
      // Prevent default touch behaviors that interfere with canvas
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent pinch zoom on multi-touch
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Enhanced tablet-specific touch handling
    const handleTabletTouch = (e: TouchEvent) => {
      // For tablets, allow more sophisticated touch interactions
      if (isTablet) {
        // Allow pinch-to-zoom with two fingers
        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
          );
          
          // Store initial distance for pinch detection
          if (!e.target.dataset.initialDistance) {
            e.target.dataset.initialDistance = distance.toString();
          }
          
          // Allow the gesture to continue for zoom
          return;
        }
        
        // Prevent gestures with more than 2 touches
        if (e.touches.length > 2) {
          e.preventDefault();
        }
      }
    };

    // Enhanced touch event handling for better tablet experience
    const handleTouchMove = (e: TouchEvent) => {
      if (isTablet && e.touches.length === 1) {
        // For single touch on tablet, ensure smooth drawing
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Emit cursor movement for better collaboration
        if (moveCursorAction) {
          moveCursorAction(x, y);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    
    if (isTablet) {
      document.addEventListener('touchstart', handleTabletTouch, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventDefaultTouch);
      if (isTablet) {
        document.removeEventListener('touchstart', handleTabletTouch);
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [touchOptimized, isTablet, moveCursorAction]);

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Account for mobile browser UI changes
      const adjustedHeight = isMobile 
        ? newHeight - (window.innerHeight - window.visualViewport?.height || 0)
        : newHeight;
      
      setDimensions({
        width: newWidth, 
        height: adjustedHeight 
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Listen for viewport changes on mobile
    if (window.visualViewport && isMobile) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport && isMobile) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [isMobile]);

  // Sync with initial props
  useEffect(() => {
    setLines(initialLines);
  }, [initialLines]);
  
  useEffect(() => {
    setShapes(initialShapes);
  }, [initialShapes]);

  useEffect(() => {
    setStickyNotes(initialStickyNotes);
  }, [initialStickyNotes]);

  useEffect(() => {
    replaceFrames(initialFrames);
  }, [initialFrames, replaceFrames]);

  useEffect(() => {
    setTextElements(initialTextElements);
  }, [initialTextElements]);

  // Event handlers
  const handleStickyNoteDragStart = useCallback(() => {
    if (onStickyNoteDragStartAction) {
      onStickyNoteDragStartAction();
    }
  }, [onStickyNoteDragStartAction]);

  const handleStickyNoteDragEnd = useCallback(() => {
    if (onStickyNoteDragEndAction) {
      onStickyNoteDragEndAction();
    }
  }, [onStickyNoteDragEndAction]);

  const handleFrameSelect = useCallback((frameId: string, e?: KonvaEventObject<MouseEvent>) => {
    // Prevent event propagation to avoid canvas click
    if (e) {
      e.cancelBubble = true;
      e.evt.stopPropagation();
    }
    
    const multiSelect = !!(e?.evt.shiftKey || e?.evt.ctrlKey || e?.evt.metaKey);
    
    // Select the frame using the frame manager
    selectFrame(frameId, multiSelect);
    
    // Notify parent component for toolbar activation
    if (onFrameSelectAction) {
      onFrameSelectAction(frameId);
    }
    
    // Log for debugging
    console.log('Frame selected:', frameId, 'Multi-select:', multiSelect);
  }, [selectFrame, onFrameSelectAction]);

  const handleFrameUpdate = useCallback((updatedFrame: FrameElement) => {
    // Update local state
    managerUpdateFrame(updatedFrame.id, updatedFrame);
    
    // Notify parent components
    if (onFrameUpdateAction) {
      onFrameUpdateAction(updatedFrame);
    }
    
    // Broadcast to collaborators
    if (onRealTimeFrameAction) {
      onRealTimeFrameAction({
        ...updatedFrame,
        updatedAt: Date.now(),
      });
    }
  }, [managerUpdateFrame, onFrameUpdateAction, onRealTimeFrameAction]);

  const handleFrameDelete = useCallback((frameId: string) => {
    // Update local state
    managerDeleteFrame(frameId);
    clearSelection();
    
    // Notify parent components
    if (onFrameDeleteAction) {
      onFrameDeleteAction(frameId);
    }
    
    // Broadcast deletion to collaborators
    if (onRealTimeFrameDeleteAction) {
      onRealTimeFrameDeleteAction(frameId);
    }
  }, [managerDeleteFrame, clearSelection, onFrameDeleteAction, onRealTimeFrameDeleteAction]);

  const handleFrameDragStart = useCallback(() => {
    if (onFrameDragStartAction) {
      onFrameDragStartAction();
    }
  }, [onFrameDragStartAction]);

  const handleFrameDragEnd = useCallback(() => {
    if (onFrameDragEndAction) {
      onFrameDragEndAction();
    }
  }, [onFrameDragEndAction]);

  const handleTextElementDragStart = useCallback(() => {
    if (onTextElementDragStartAction) {
      onTextElementDragStartAction();
    }
  }, [onTextElementDragStartAction]);

  const handleTextElementDragEnd = useCallback(() => {
    if (onTextElementDragEndAction) {
      onTextElementDragEndAction();
    }
  }, [onTextElementDragEndAction]);

  // Enhanced stage configuration for mobile/tablet
  const stageConfig = {
    width: dimensions.width,
    height: dimensions.height,
    draggable: tool === "select" || isSpacePressed,
    // Enhanced touch settings for mobile
    ...(touchOptimized && {
      preventDefault: false,
      listening: true,
    }),
    // Tablet-specific optimizations
    ...(isTablet && {
      hitGraphEnabled: true,
      pixelRatio: window.devicePixelRatio || 1,
    })
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Enhanced Stage with responsive configuration */}
      <Stage
        ref={stageRef}
        {...stageConfig}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ 
          cursor: getCursor(),
          // Enhanced touch action for mobile and tablet
          touchAction: (touchOptimized || isTablet) ? 'none' : 'auto',
          // Prevent text selection on mobile and tablet
          userSelect: 'none',
          WebkitUserSelect: 'none',
          // Improve performance on mobile and tablet
          willChange: isSmallScreen ? 'transform' : 'auto',
          // Tablet-specific optimizations
          ...(isTablet && {
            transform: 'translateZ(0)', // Hardware acceleration
            backfaceVisibility: 'hidden', // Prevent flickering
            perspective: '1000px', // Better 3D rendering
          })
        }}
        // Enhanced touch events for mobile and tablet
        onTouchStart={(touchOptimized || isTablet) ? (e) => {
          // Convert touch to mouse event for compatibility
          const touch = e.evt.touches[0];
          if (touch) {
            const mouseEvent = {
              ...e,
              evt: {
                ...e.evt,
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0,
                preventDefault: () => e.evt.preventDefault(),
                stopPropagation: () => e.evt.stopPropagation(),
              }
            };
            handleMouseDown(mouseEvent as any);
          }
        } : undefined}
        onTouchMove={(touchOptimized || isTablet) ? (e) => {
          const touch = e.evt.touches[0];
          if (touch) {
            const mouseEvent = {
              ...e,
              evt: {
                ...e.evt,
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.evt.preventDefault(),
                stopPropagation: () => e.evt.stopPropagation(),
              }
            };
            handleMouseMove(mouseEvent as any);
          }
        } : undefined}
        onTouchEnd={(touchOptimized || isTablet) ? (e) => {
          const mouseEvent = {
            ...e,
            evt: {
              ...e.evt,
              preventDefault: () => e.evt.preventDefault(),
              stopPropagation: () => e.evt.stopPropagation(),
            }
          };
          handleMouseUp(mouseEvent as any);
        } : undefined}
      >
        <CanvasLayers
          /* Core canvas state */
          showGrid={showGrid}
          dimensions={dimensions}
          stageScale={stageScale}
          stagePos={stagePos}
          lines={lines}
          stickyNotes={stickyNotes}
          frames={frames}
          textElements={textElements}
          shapes={shapes}
          selectedFrameIds={selectedFrameIds}
          selectedStickyNote={selectedStickyNote}
          selectedFrame={selectedFrame}
          selectedTextElement={selectedTextElement}
          editingTextElement={editingTextElement}
          selectedShape={selectedShape}
          selectedShapes={selectedShapes}
          tool={tool}
          strokeWidth={strokeWidth}
          hoveredLineIndex={hoveredLineIndex}
          showFrameAlignment={showFrameAlignment}
          frameCreationMode={frameCreationMode}
          activeFrameId={activeFrameId}
          isDrawingInFrame={isDrawingInFrame}
          performanceMode={performanceMode}
          cursors={cursors}
          handleLineClick={handleLineClick}
          setHoveredLineIndex={setHoveredLineIndex}
          handleFrameSelect={handleFrameSelect}
          handleFrameUpdate={onFrameUpdateAction}
          handleFrameDelete={onFrameDeleteAction}
          handleFrameDragStart={onFrameDragStartAction}
          handleFrameDragEnd={onFrameDragEndAction}
          onStickyNoteSelectAction={onStickyNoteSelectAction}
          onStickyNoteUpdateAction={onStickyNoteUpdateAction}
          onStickyNoteDeleteAction={onStickyNoteDeleteAction}
          handleStickyNoteDragStart={onStickyNoteDragStartAction}
          handleStickyNoteDragEnd={onStickyNoteDragEndAction}
          onTextElementSelectAction={onTextElementSelectAction}
          onTextElementUpdateAction={onTextElementUpdateAction}
          onTextElementDeleteAction={onTextElementDeleteAction}
          onTextElementStartEditAction={onTextElementStartEditAction}
          onTextElementFinishEditAction={onTextElementFinishEditAction}
          handleTextElementDragStart={onTextElementDragStartAction}
          handleTextElementDragEnd={onTextElementDragEndAction}
          onShapeSelectAction={onShapeSelectAction}
          onShapeUpdateAction={onShapeUpdateAction}
          onShapeDeleteAction={onShapeDeleteAction}
          handleShapeDragStart={onShapeDragStartAction}
          handleShapeDragEnd={onShapeDragEndAction}
          selectFrames={selectFrames}
          stageRef={stageRef}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </Stage>
      
      {/* Responsive Canvas Controls */}
      <CanvasControls
        showControls={showControls && !isSmallScreen}
        controlsCollapsed={controlsCollapsed}
        stageScale={stageScale}
        getZoomLevel={getZoomLevel}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetZoom={resetZoom}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        fitToScreen={fitToScreen}
        setShowControls={setShowControls}
        setControlsCollapsed={setControlsCollapsed}
        hasLines={lines.length > 0}
        performanceMode={performanceMode}
        isSpacePressed={isSpacePressed}
        isPanning={isPanning}
        isStickyNoteDragging={isStickyNoteDragging}
        isFrameDragging={isFrameDragging}
        frameCreationMode={frameCreationMode}
        hoveredLineIndex={hoveredLineIndex}
        tool={tool}
        isDrawingInFrame={isDrawingInFrame}
        activeFrameId={activeFrameId}
      />

      {/* Mobile-specific zoom indicator */}
      {isSmallScreen && (
        <div className={`absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm ${getZoomLevel()}`}>
          {Math.round(stageScale * 100)}%
        </div>
      )}

      {/* Text Editor for mobile/tablet - positioned better */}
      {editingTextElement && (
        <div className={`absolute z-50 ${isSmallScreen ? 'inset-4' : ''}`}>
        <TextEditor
            textElement={editingTextElement}
            onUpdate={onTextElementUpdateAction}
            onFinish={onTextElementFinishEditAction}
            stageRef={stageRef}
            isMobile={isMobile}
            isTablet={isTablet}
        />
        </div>
      )}
    </div>
  );
}