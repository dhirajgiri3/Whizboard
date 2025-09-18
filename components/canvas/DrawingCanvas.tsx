import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { Tool } from '@/types';
import { StickyNoteElement, FrameElement, ILine, TextElement, ShapeElement, ImageElement } from '@/types';
import { useFrameManager } from '@/hooks/useFrameManager';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { CanvasLayers } from './CanvasLayers';
import { CanvasControls } from './CanvasControls';
import { EnhancedCursor } from '@/types';
import TextEditor from './text/TextEditor';
import { useMemoryProfiler } from '@/lib/performance/MemoryProfiler';
import { markStart, markEnd, usePerformanceMeasure } from '@/lib/performance/PerformanceMarkers';

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
  initialImageElements?: ImageElement[];
  isFramePlacementMode?: boolean;
  selectedStickyNote?: string | null;
  selectedFrame?: string | null;
  selectedTextElement?: string | null;
  editingTextElement?: TextElement | null;
  selectedShape?: string | null;
  selectedShapes?: string[];
  selectedImageElement?: string | null;
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
  onImageElementAddAction?: (imageElement: ImageElement) => void;
  onImageElementUpdateAction?: (imageElement: ImageElement) => void;
  onImageElementDeleteAction?: (imageElementId: string) => void;
  onImageElementSelectAction?: (imageElementId: string) => void;
  onImageElementDragStartAction?: () => void;
  onImageElementDragEndAction?: () => void;
  onCanvasClickAction?: (e: KonvaEventObject<MouseEvent>) => void;
  onToolChangeAction?: (tool: Tool) => void;
  cursors: Record<string, EnhancedCursor>;
  moveCursorAction: (x: number, y: number) => void;
  onRealTimeDrawingAction?: (line: ILine) => void;
  onRealTimeLineUpdateAction?: (line: ILine) => void;
  onRealTimeFrameAction?: (frame: FrameElement) => void;
  onRealTimeFrameDeleteAction?: (frameId: string) => void;
  onRealTimeTextElementAction?: (textElement: TextElement) => void;
  onRealTimeTextElementDeleteAction?: (textElementId: string) => void;
  onRealTimeImageElementAction?: (imageElement: ImageElement) => void;
  onRealTimeImageElementDeleteAction?: (imageElementId: string) => void;
}

const DrawingCanvas = memo(function DrawingCanvas({
  stageRef,
  tool,
  color,
  strokeWidth,
  initialLines,
  initialStickyNotes = [],
  initialFrames = [],
  initialTextElements = [],
  initialShapes = [],
  initialImageElements = [],
  isFramePlacementMode = false,
  selectedStickyNote,
  selectedFrame,
  selectedTextElement,
  editingTextElement,
  selectedShape,
  selectedShapes,
  selectedImageElement,
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
  onImageElementAddAction,
  onImageElementUpdateAction,
  onImageElementDeleteAction,
  onImageElementSelectAction,
  onImageElementDragStartAction,
  onImageElementDragEndAction,
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
  onRealTimeImageElementAction,
  onRealTimeImageElementDeleteAction,
}: DrawingCanvasProps) {
  // Development profiling
  useMemoryProfiler('DrawingCanvas');
  usePerformanceMeasure('DrawingCanvas');
  // State management
  const [lines, setLines] = useState<ILine[]>(initialLines);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteElement[]>(initialStickyNotes);
  const [textElements, setTextElements] = useState<TextElement[]>(initialTextElements);
  const [shapes, setShapes] = useState<ShapeElement[]>(initialShapes);
  const [imageElements, setImageElements] = useState<ImageElement[]>(initialImageElements);
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

    // Stable references for event handlers to ensure proper cleanup
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
          if (e.target && !(e.target as HTMLElement).dataset.initialDistance) {
            (e.target as HTMLElement).dataset.initialDistance = distance.toString();
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
        if (e.target) {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          // Emit cursor movement for better collaboration
          if (moveCursorAction) {
            moveCursorAction(x, y);
          }
        }
      }
    };

    // Add event listeners with explicit references
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

    if (isTablet) {
      document.addEventListener('touchstart', handleTabletTouch, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
    }

    return () => {
      // Cleanup with the exact same function references
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventDefaultTouch);
      if (isTablet) {
        document.removeEventListener('touchstart', handleTabletTouch);
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [touchOptimized, isTablet, moveCursorAction]);

  // Effect for window resize with proper cleanup
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // Account for mobile browser UI changes
      const adjustedHeight = isMobile
        ? newHeight - (window.innerHeight - (window.visualViewport?.height || window.innerHeight))
        : newHeight;

      setDimensions({
        width: newWidth,
        height: adjustedHeight
      });
    };

    // Initial size setting
    handleResize();

    // Add resize listeners
    window.addEventListener('resize', handleResize, { passive: true });

    // Listen for viewport changes on mobile
    const hasVisualViewport = window.visualViewport && isMobile;
    if (hasVisualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      // Cleanup with exact same function reference
      window.removeEventListener('resize', handleResize);
      if (hasVisualViewport) {
        window.visualViewport!.removeEventListener('resize', handleResize);
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

  useEffect(() => {
    setImageElements(initialImageElements);
  }, [initialImageElements]);

  // Ensure Konva stage redraws promptly when collaborative state updates arrive
  useEffect(() => {
    if (stageRef.current) {
      try {
        stageRef.current.batchDraw();
      } catch {}
    }
  }, [lines, frames, textElements, shapes, imageElements, stageRef]);

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

  const handleImageElementDragStart = useCallback(() => {
    if (onImageElementDragStartAction) {
      onImageElementDragStartAction();
    }
  }, [onImageElementDragStartAction]);

  const handleImageElementDragEnd = useCallback(() => {
    if (onImageElementDragEndAction) {
      onImageElementDragEndAction();
    }
  }, [onImageElementDragEndAction]);

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
          handleMouseUp();
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
          imageElements={imageElements}
          selectedFrameIds={selectedFrameIds}
          selectedStickyNote={selectedStickyNote || null}
          selectedTextElement={selectedTextElement || null}
          editingTextElement={editingTextElement || null}
          selectedShape={selectedShape || null}
          selectedShapes={selectedShapes || []}
          selectedImageElement={selectedImageElement || null}
          tool={tool}
          strokeWidth={strokeWidth}
          hoveredLineIndex={hoveredLineIndex}
          showFrameAlignment={showFrameAlignment}

          // Props not used by CanvasLayers have been removed to match its interface
          cursors={cursors}
          handleLineClick={handleLineClick}
          setHoveredLineIndex={setHoveredLineIndex}
          handleFrameSelect={handleFrameSelect}
          handleFrameUpdate={(frame) => {
            if (onFrameUpdateAction) onFrameUpdateAction(frame);
          }}
          handleFrameDelete={(frameId) => {
            if (onFrameDeleteAction) onFrameDeleteAction(frameId);
          }}
          handleFrameDragStart={() => {
            if (onFrameDragStartAction) onFrameDragStartAction();
          }}
          handleFrameDragEnd={() => {
            if (onFrameDragEndAction) onFrameDragEndAction();
          }}
          onStickyNoteSelectAction={onStickyNoteSelectAction}
          onStickyNoteUpdateAction={onStickyNoteUpdateAction}
          onStickyNoteDeleteAction={onStickyNoteDeleteAction}
          handleStickyNoteDragStart={() => {
            if (onStickyNoteDragStartAction) onStickyNoteDragStartAction();
          }}
          handleStickyNoteDragEnd={() => {
            if (onStickyNoteDragEndAction) onStickyNoteDragEndAction();
          }}
          onTextElementSelectAction={onTextElementSelectAction}
          onTextElementUpdateAction={onTextElementUpdateAction}
          onTextElementDeleteAction={onTextElementDeleteAction}
          onTextElementStartEditAction={onTextElementStartEditAction}
          onTextElementFinishEditAction={onTextElementFinishEditAction}
          handleTextElementDragStart={() => {
            if (onTextElementDragStartAction) onTextElementDragStartAction();
          }}
          handleTextElementDragEnd={() => {
            if (onTextElementDragEndAction) onTextElementDragEndAction();
          }}
          onShapeSelectAction={onShapeSelectAction}
          onShapeUpdateAction={onShapeUpdateAction}
          onShapeDeleteAction={onShapeDeleteAction}
          handleShapeDragStart={() => {
            if (onShapeDragStartAction) onShapeDragStartAction();
          }}
          handleShapeDragEnd={() => {
            if (onShapeDragEndAction) onShapeDragEndAction();
          }}
          onImageElementSelectAction={onImageElementSelectAction}
          onImageElementUpdateAction={onImageElementUpdateAction}
          onImageElementDeleteAction={onImageElementDeleteAction}
          handleImageElementDragStart={() => {
            if (onImageElementDragStartAction) onImageElementDragStartAction();
          }}
          handleImageElementDragEnd={() => {
            if (onImageElementDragEndAction) onImageElementDragEndAction();
          }}
          selectFrames={selectFrames}
          stageRef={stageRef}
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
            isVisible={true}
            onUpdateAction={(textElement) => {
              if (onTextElementUpdateAction) onTextElementUpdateAction(textElement);
            }}
            onFinishEditingAction={() => {
              if (onTextElementFinishEditAction) onTextElementFinishEditAction();
            }}
            stageScale={stageScale}
            stagePosition={stagePos}
            isMobile={isMobile}
            isTablet={isTablet}
        />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  const simpleProps = ['tool', 'color', 'strokeWidth', 'isFramePlacementMode', 'isMobile', 'isTablet', 'showGrid'];

  for (const prop of simpleProps) {
    if (prevProps[prop as keyof typeof prevProps] !== nextProps[prop as keyof typeof nextProps]) {
      return false;
    }
  }

  // Check selected items
  const selectedProps = [
    'selectedStickyNote', 'selectedFrame', 'selectedTextElement',
    'selectedShape', 'selectedImageElement'
  ];
  for (const prop of selectedProps) {
    if (prevProps[prop as keyof typeof prevProps] !== nextProps[prop as keyof typeof nextProps]) {
      return false;
    }
  }

  // Check arrays length and reference
  const arrayProps = [
    'initialLines', 'initialStickyNotes', 'initialFrames',
    'initialTextElements', 'initialShapes', 'initialImageElements', 'selectedShapes'
  ];
  for (const prop of arrayProps) {
    const prevArray = prevProps[prop as keyof typeof prevProps] as any[];
    const nextArray = nextProps[prop as keyof typeof nextProps] as any[];
    if (prevArray?.length !== nextArray?.length || prevArray !== nextArray) {
      return false;
    }
  }

  // Check editingTextElement
  if (prevProps.editingTextElement?.id !== nextProps.editingTextElement?.id) {
    return false;
  }

  // Check cursors object (shallow comparison)
  if (Object.keys(prevProps.cursors || {}).length !== Object.keys(nextProps.cursors || {}).length) {
    return false;
  }

  return true;
});

export default DrawingCanvas;