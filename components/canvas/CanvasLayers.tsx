import React, { useMemo, useCallback, useRef } from 'react';
import { Layer, Line, Circle, Group, Text, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { Tool } from '@/types';
import { StickyNoteElement, FrameElement, ILine, TextElement, ShapeElement, ImageElement, EnhancedCursor } from '@/types';
import LiveCursors from '../reatime/LiveCursors';
import StickyNote from './stickynote/StickyNote';
import EnhancedFrame from './frame/EnhancedFrame';
import FrameAlignmentHelper from './frame/FrameAlignmentHelper';
import FrameSelectionManager from './frame/FrameSelectionManager';
import TextElementComponent from './text/TextElement';
import TextEditor from './text/TextEditor';
import { ShapeElement as ShapeElementComponent } from './shape';
import ImageElementComponent from '../reatime/whiteboard/ImageElement';

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

interface CanvasLayersProps {
  showGrid: boolean;
  dimensions: { width: number; height: number };
  stageScale: number;
  stagePos: { x: number; y: number };
  lines: ILine[];
  stickyNotes: StickyNoteElement[];
  frames: FrameElement[];
  textElements: TextElement[];
  shapes: ShapeElement[];
  imageElements: ImageElement[];
  selectedFrameIds: string[];
  selectedStickyNote: string | null;
  selectedTextElement: string | null;
  editingTextElement: TextElement | null;
  selectedShape: string | null;
  selectedShapes: string[];
  selectedImageElement: string | null;
  tool: Tool;
  strokeWidth: number;
  hoveredLineIndex: number | null;
  showFrameAlignment: boolean;

  cursors: Record<string, EnhancedCursor>;
  handleLineClick: (lineIndex: number) => void;
  setHoveredLineIndex: (index: number | null) => void;
  handleFrameSelect: (frameId: string) => void;
  handleFrameUpdate: (frame: FrameElement) => void;
  handleFrameDelete: (frameId: string) => void;
  handleFrameDragStart: () => void;
  handleFrameDragEnd: () => void;
  onStickyNoteSelectAction?: (stickyNoteId: string) => void;
  onStickyNoteUpdateAction?: (stickyNote: StickyNoteElement) => void;
  onStickyNoteDeleteAction?: (stickyNoteId: string) => void;
  handleStickyNoteDragStart: () => void;
  handleStickyNoteDragEnd: () => void;
  onTextElementSelectAction?: (textElementId: string) => void;
  onTextElementUpdateAction?: (textElement: TextElement) => void;
  onTextElementDeleteAction?: (textElementId: string) => void;
  onTextElementStartEditAction?: (textElement: TextElement) => void;
  onTextElementFinishEditAction?: () => void;
  handleTextElementDragStart: () => void;
  handleTextElementDragEnd: () => void;
  onShapeSelectAction?: (shapeId: string) => void;
  onShapeUpdateAction?: (shape: ShapeElement) => void;
  onShapeDeleteAction?: (shapeId: string) => void;
  handleShapeDragStart: () => void;
  handleShapeDragEnd: () => void;
  onImageElementSelectAction?: (imageElementId: string) => void;
  onImageElementUpdateAction?: (imageElement: ImageElement) => void;
  onImageElementDeleteAction?: (imageElementId: string) => void;
  handleImageElementDragStart: () => void;
  handleImageElementDragEnd: () => void;
  selectFrames: (frameIds: string[]) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export function CanvasLayers({
  showGrid,
  dimensions,
  stageScale,
  stagePos,
  lines,
  stickyNotes,
  frames,
  textElements,
  shapes,
  imageElements,
  selectedFrameIds,
  selectedStickyNote,
  selectedTextElement,
  editingTextElement,
  selectedShape,
  selectedShapes,
  selectedImageElement,
  tool,
  strokeWidth,
  hoveredLineIndex,
  showFrameAlignment,
  cursors,
  handleLineClick,
  setHoveredLineIndex,
  handleFrameSelect,
  handleFrameUpdate,
  handleFrameDelete,
  handleFrameDragStart,
  handleFrameDragEnd,
  onStickyNoteSelectAction,
  onStickyNoteUpdateAction,
  onStickyNoteDeleteAction,
  handleStickyNoteDragStart,
  handleStickyNoteDragEnd,
  onTextElementSelectAction,
  onTextElementUpdateAction,
  onTextElementDeleteAction,
  onTextElementStartEditAction,
  onTextElementFinishEditAction,
  handleTextElementDragStart,
  handleTextElementDragEnd,
  onShapeSelectAction,
  onShapeUpdateAction,
  onShapeDeleteAction,
  handleShapeDragStart,
  handleShapeDragEnd,
  onImageElementSelectAction,
  onImageElementUpdateAction,
  onImageElementDeleteAction,
  handleImageElementDragStart,
  handleImageElementDragEnd,
  selectFrames,
  stageRef,
}: CanvasLayersProps) {
  
  // Enhanced line interaction state management
  const lineInteractionRef = useRef<{
    hoverTimeout: NodeJS.Timeout | null;
    lastHoveredIndex: number | null;
    isProcessingClick: boolean;
  }>({
    hoverTimeout: null,
    lastHoveredIndex: null,
    isProcessingClick: false,
  });
  
  // Group lines by frame for rendering
  const groupedLines = useMemo(() => {
    const groups: { [key: string]: ILine[] } = {
      canvas: [] // Lines not in any frame
    };

    lines.forEach(line => {
      const key = line.frameId || 'canvas';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(line);
    });

    return groups;
  }, [lines]);

  // Enhanced line interaction handlers with proper debouncing and cleanup
  const handleLineMouseEnter = useCallback((lineIndex: number) => {
    // Clear any existing hover timeout
    if (lineInteractionRef.current.hoverTimeout) {
      clearTimeout(lineInteractionRef.current.hoverTimeout);
      lineInteractionRef.current.hoverTimeout = null;
    }

    // Only update if the hovered line actually changed
    if (lineInteractionRef.current.lastHoveredIndex !== lineIndex) {
      lineInteractionRef.current.lastHoveredIndex = lineIndex;
      setHoveredLineIndex(lineIndex);
    }
  }, [setHoveredLineIndex]);

  const handleLineMouseLeave = useCallback(() => {
    // Debounce the hover leave to prevent flickering
    if (lineInteractionRef.current.hoverTimeout) {
      clearTimeout(lineInteractionRef.current.hoverTimeout);
    }

    lineInteractionRef.current.hoverTimeout = setTimeout(() => {
      lineInteractionRef.current.lastHoveredIndex = null;
      setHoveredLineIndex(null);
      lineInteractionRef.current.hoverTimeout = null;
    }, 50); // 50ms debounce
  }, [setHoveredLineIndex]);

  const handleLineClickWrapper = useCallback((lineIndex: number, e: KonvaEventObject<MouseEvent>) => {
    // Prevent click processing if we're in the middle of a drag operation
    if (lineInteractionRef.current.isProcessingClick) {
      return;
    }

    // Set processing flag to prevent double-clicks
    lineInteractionRef.current.isProcessingClick = true;
    
    // Clear the flag after a short delay
    setTimeout(() => {
      lineInteractionRef.current.isProcessingClick = false;
    }, 100);

    // Call the original click handler
    handleLineClick(lineIndex);
  }, [handleLineClick]);

  // Enhanced line rendering with proper hit detection and performance optimization
  const renderLines = useMemo(() => {
    return (linesToRender: ILine[], keyPrefix: string = '') => {
      return linesToRender.map((line, i) => {
        if (!line || !line.points || !Array.isArray(line.points) || line.points.length === 0) {
          return null;
        }
        
        const validPoints = line.points.filter((point) => 
          typeof point === 'number' && !isNaN(point) && isFinite(point)
        );
        
        if (validPoints.length < 2) {
          return null;
        }
        
        const points = smoothPoints(validPoints, 0.5);
        const uniqueKey = line.id ? `${keyPrefix}line-${line.id}-idx-${i}` : `${keyPrefix}line-noId-${i}`;
        
        // Enhanced clickability logic
        const isClickable = tool === 'eraser' || (tool !== 'pen' && tool !== 'highlighter' && line.tool === 'pen');
        const isHovered = hoveredLineIndex === i;
        const isPenLine = line.tool === 'pen';
        
        // Enhanced hit detection calculation with improved accuracy
        const baseStrokeWidth = line.tool === 'highlighter' 
          ? (line.strokeWidth || 2) // Already multiplied during creation
          : (line.strokeWidth || 2);
        const hitStrokeWidth = Math.max(
          baseStrokeWidth * 1.5, // 1.5x the stroke width for reasonable hit detection
          Math.max(8, 12 / stageScale), // Smaller minimum hit area that scales with zoom
          6 // Smaller absolute minimum for more precise selection
        );
        
        // Enhanced visual feedback
        const isHighlighterLine = line.tool === 'highlighter';
        const shadowColor = isPenLine && isHovered && tool !== 'eraser' 
          ? '#3b82f6' 
          : (line.tool === 'pen' ? line.color : undefined);
        const shadowBlur = isPenLine && isHovered && tool !== 'eraser' 
          ? 6 
          : (line.tool === 'pen' ? 1 : 0);
        const shadowOpacity = isPenLine && isHovered && tool !== 'eraser' ? 0.5 : 0.1;
        
        // Enhanced opacity for hover state and highlighter
        const lineOpacity = isHighlighterLine ? 0.5 : (isPenLine && isHovered && tool !== 'eraser' ? 0.9 : 1);
        
        return (
          <Line
            key={uniqueKey}
            points={points}
            stroke={line.color || '#000000'}
            strokeWidth={baseStrokeWidth}
            tension={0.4}
            lineCap="round"
            lineJoin="round"
            shadowColor={shadowColor}
            shadowBlur={shadowBlur}
            shadowOpacity={shadowOpacity}
            globalCompositeOperation={
              line.tool === 'eraser' ? 'destination-out' : 
              line.tool === 'highlighter' ? 'screen' : 'source-over'
            }
            perfectDrawEnabled={false}
            listening={isClickable}
            onClick={isClickable ? (e: KonvaEventObject<MouseEvent>) => handleLineClickWrapper(i, e) : undefined}
            onTap={isClickable ? (e: KonvaEventObject<MouseEvent>) => handleLineClickWrapper(i, e) : undefined}
            onMouseEnter={isClickable && isPenLine && tool !== 'eraser' ? () => handleLineMouseEnter(i) : undefined}
            onMouseLeave={isClickable && isPenLine && tool !== 'eraser' ? handleLineMouseLeave : undefined}
            hitStrokeWidth={hitStrokeWidth}
            opacity={lineOpacity}
            // Enhanced performance properties
            hitFunc={(context, shape) => {
              // Custom hit function for more precise hit detection
              context.beginPath();
              context.moveTo(points[0], points[1]);
              for (let i = 2; i < points.length; i += 2) {
                context.lineTo(points[i], points[i + 1]);
              }
              // Use stroke instead of fill for more accurate line detection
              context.lineWidth = hitStrokeWidth;
              context.strokeStyle = 'rgba(0,0,0,0.01)'; // Nearly invisible for hit detection
              context.stroke();
            }}
          />
        );
      }).filter(Boolean);
    };
  }, [tool, hoveredLineIndex, handleLineClick, handleLineMouseEnter, handleLineMouseLeave, handleLineClickWrapper, stageScale]);

  // Cleanup effect for line interaction state
  React.useEffect(() => {
    return () => {
      // Cleanup any pending timeouts on unmount
      if (lineInteractionRef.current.hoverTimeout) {
        clearTimeout(lineInteractionRef.current.hoverTimeout);
      }
    };
  }, []);

  return (
    <>
      {/* Grid Layer */}
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
      
      {/* Canvas Lines Layer - Optimized for interaction */}
      <Layer>
        {renderLines(groupedLines.canvas, 'canvas-')}
      </Layer>
      
      {/* Frame Selection and Alignment Layer */}
      <Layer>
        <FrameSelectionManager
          onSelectionChange={selectFrames}
          onSelectionStart={() => {}}
          onSelectionEnd={() => {}}
          frameElements={frames}
          stageRef={stageRef}
          isActive={tool === 'select'}
          selectedFrameIds={selectedFrameIds}
        />
        
        <FrameAlignmentHelper
          frameElements={frames}
          selectedFrameIds={selectedFrameIds}
          snapDistance={10}
          showGrid={showFrameAlignment}
          gridSize={20}
        />
      </Layer>
      
      {/* Frames Layer */}
      <Layer>
        {frames.map((frame, index) => (
          <React.Fragment key={`frame-group-${frame.id}-idx-${index}`}>
            <EnhancedFrame
              frame={frame}
              isSelected={selectedFrameIds.includes(frame.id)}
              isDraggable={tool === 'select' || tool === 'frame'}
              onSelectAction={(frameId) => handleFrameSelect(frameId)}
              onUpdateAction={handleFrameUpdate}
              onDeleteAction={handleFrameDelete}
              onDragStart={handleFrameDragStart}
              onDragEnd={handleFrameDragEnd}
              scale={stageScale}
              stageRef={stageRef}
              currentTool={tool}
            >
              {/* Render frame-specific lines */}
              {renderLines(groupedLines[frame.id] || [], `frame-${frame.id}-`)}
            </EnhancedFrame>
          </React.Fragment>
        ))}
        
        {/* Frame creation is now handled externally through onCanvasClickAction */}
      </Layer>
      
      {/* Sticky Notes Layer */}
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
            onDragStartAction={handleStickyNoteDragStart}
            onDragEndAction={handleStickyNoteDragEnd}
            isDraggable={tool === 'select' || tool === 'sticky-note'}
          />
        ))}
      </Layer>
      
      {/* Text Elements Layer - Optimized for performance */}
      <Layer
        // Enable hit detection for text elements
        hitGraphEnabled={true}
        perfectDrawEnabled={false}
        clearBeforeDraw={true}
        imageSmoothingEnabled={false}
      >
        {textElements.map((textElement, index) => (
          <TextElementComponent
            key={`text-${textElement.id}-v${textElement.version || 0}-idx${index}`}
            textElement={textElement}
            isSelected={selectedTextElement === textElement.id}
            isEditing={editingTextElement === textElement}
            isDraggable={tool === 'select' || tool === 'text'}
            onSelectAction={onTextElementSelectAction || (() => {})}
            onUpdateAction={onTextElementUpdateAction || (() => {})}
            onDeleteAction={onTextElementDeleteAction || (() => {})}
            onStartEditAction={(textId) => {
              const textElement = textElements.find(el => el.id === textId);
              if (textElement && onTextElementStartEditAction) {
                onTextElementStartEditAction(textElement);
              }
            }}
            onDragStartAction={handleTextElementDragStart}
            onDragEndAction={handleTextElementDragEnd}
            scale={stageScale}
            stageRef={stageRef}
          />
        ))}
      </Layer>
      
      {/* Shapes Layer */}
      <Layer
        hitGraphEnabled={true}
        perfectDrawEnabled={false}
        clearBeforeDraw={true}
        imageSmoothingEnabled={false}
      >
        {shapes.map((shape, index) => (
          <ShapeElementComponent
            key={`shape-${shape.id}-v${shape.version || 0}-t${shape.updatedAt || 0}-idx${index}`}
            shape={shape}
            isSelected={selectedShape === shape.id || (selectedShapes && selectedShapes.includes(shape.id))}
            isDraggable={tool === 'select' || tool === 'shapes'}
            onSelectAction={onShapeSelectAction || (() => {})}
            onUpdateAction={onShapeUpdateAction || (() => {})}
            onDeleteAction={onShapeDeleteAction || (() => {})}
            onDragStart={handleShapeDragStart}
            onDragEnd={handleShapeDragEnd}
            scale={stageScale}
            stageRef={stageRef}
            currentTool={tool}
          />
        ))}
      </Layer>
      
      {/* Image Elements Layer */}
      <Layer
        hitGraphEnabled={true}
        perfectDrawEnabled={false}
        clearBeforeDraw={true}
        imageSmoothingEnabled={false}
      >
        {imageElements.map((imageElement, index) => (
          <ImageElementComponent
            key={`image-${imageElement.id}-v${imageElement.version || 0}-t${imageElement.updatedAt || 0}-idx${index}`}
            imageElement={imageElement}
            isSelected={selectedImageElement === imageElement.id}
            isDraggable={tool === 'select' || tool === 'image'}
            onSelectAction={onImageElementSelectAction || (() => {})}
            onUpdateAction={(id, updates) => {
              if (onImageElementUpdateAction) {
                const imageElement = imageElements.find(el => el.id === id);
                if (imageElement) {
                  onImageElementUpdateAction({ ...imageElement, ...updates });
                }
              }
            }}
            onDeleteAction={onImageElementDeleteAction || (() => {})}
            onDragStart={handleImageElementDragStart}
            onDragEnd={handleImageElementDragEnd}
            scale={stageScale}
            stageRef={stageRef}
            currentTool={tool}
          />
        ))}
      </Layer>
      
      {/* Cursors Layer */}
      <Layer>
        <LiveCursors cursors={cursors} />
      </Layer>
      
      {/* Tool Indicators Layer */}
      <Layer>
        {tool === 'eraser' && (
          <Circle
            x={0}
            y={0}
            radius={strokeWidth * 1.2}
            stroke="#ef4444"
            strokeWidth={2}
            dash={[4, 4]}
            opacity={0.8}
            visible={false} // Will be made visible when mouse moves
          />
        )}
      </Layer>
    </>
  );
}