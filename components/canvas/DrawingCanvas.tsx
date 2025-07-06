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
import { Cursor } from './LiveCursors';
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
  selectedStickyNote?: string | null;
  selectedFrame?: string | null;
  selectedTextElement?: string | null;
  editingTextElement?: string | null;
  selectedShape?: string | null;
  selectedShapes?: string[];
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
  onTextElementStartEditAction?: (textElementId: string) => void;
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
  selectedStickyNote,
  selectedFrame,
  selectedTextElement,
  editingTextElement,
  selectedShape,
  selectedShapes,
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
  });

  // Effect for window resize
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

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
      <CanvasControls
        showControls={showControls}
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

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        draggable={(tool === 'select' && !isStickyNoteDragging && !isFrameDragging && !isDrawing.current) || isSpacePressed}
        style={{ cursor: getCursor() }}
        hitOnDragEnabled={false}
      >
        <CanvasLayers
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
          selectedTextElement={selectedTextElement}
          editingTextElement={editingTextElement}
          selectedShape={selectedShape}
          selectedShapes={selectedShapes}
          tool={tool}
          strokeWidth={strokeWidth}
          hoveredLineIndex={hoveredLineIndex}
          showFrameAlignment={showFrameAlignment}
          frameCreationMode={frameCreationMode}
          cursors={cursors}
          handleLineClick={handleLineClick}
          setHoveredLineIndex={setHoveredLineIndex}
          handleFrameSelect={handleFrameSelect}
          handleFrameUpdate={handleFrameUpdate}
          handleFrameDelete={handleFrameDelete}
          handleFrameDragStart={handleFrameDragStart}
          handleFrameDragEnd={handleFrameDragEnd}
          onStickyNoteSelectAction={onStickyNoteSelectAction}
          onStickyNoteUpdateAction={onStickyNoteUpdateAction}
          onStickyNoteDeleteAction={onStickyNoteDeleteAction}
          handleStickyNoteDragStart={handleStickyNoteDragStart}
          handleStickyNoteDragEnd={handleStickyNoteDragEnd}
          onTextElementSelectAction={onTextElementSelectAction}
          onTextElementUpdateAction={onTextElementUpdateAction}
          onTextElementDeleteAction={onTextElementDeleteAction}
          onTextElementStartEditAction={onTextElementStartEditAction}
          onTextElementFinishEditAction={onTextElementFinishEditAction}
          handleTextElementDragStart={handleTextElementDragStart}
          handleTextElementDragEnd={handleTextElementDragEnd}
          onShapeSelectAction={onShapeSelectAction}
          onShapeUpdateAction={onShapeUpdateAction}
          onShapeDeleteAction={onShapeDeleteAction}
          handleShapeDragStart={onShapeDragStartAction}
          handleShapeDragEnd={onShapeDragEndAction}
          selectFrames={selectFrames}
          stageRef={stageRef}
        />
      </Stage>
      
      {/* Text Editor Overlay - renders outside of Konva stage */}
      {editingTextElement && textElements.find(t => t.id === editingTextElement) && (
        <TextEditor
          textElement={textElements.find(t => t.id === editingTextElement)!}
          isVisible={true}
          onUpdateAction={onTextElementUpdateAction || (() => {})}
          onFinishEditingAction={onTextElementFinishEditAction || (() => {})}
          stageScale={stageScale}
          stagePosition={stagePos}
        />
      )}
    </div>
  );
}