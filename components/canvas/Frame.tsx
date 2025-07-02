"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Rect, Group, Text, Circle } from 'react-konva';
import Konva from 'konva';
import { FrameElement } from '@/types';
import { KonvaEventObject } from 'konva/lib/Node';

interface FrameProps {
  frame: FrameElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelectAction: (frameId: string) => void;
  onUpdateAction: (frame: FrameElement) => void;
  onDeleteAction: (frameId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDoubleClick?: (frameId: string) => void;
  scale: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

interface ResizeHandle {
  x: number;
  y: number;
  cursor: string;
  type: 'corner' | 'edge';
  position: string;
}

export default function Frame({
  frame,
  isSelected,
  isDraggable,
  onSelectAction,
  onUpdateAction,
  onDeleteAction,
  onDragStart,
  onDragEnd,
  onDoubleClick,
  scale,
  stageRef,
}: FrameProps) {
  const groupRef = useRef<Konva.Group>(null);
  const frameRef = useRef<Konva.Rect>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointer, setLastPointer] = useState<{ x: number; y: number } | null>(null);

  // Calculate handle size based on scale
  const handleSize = Math.max(6, 8 / scale);
  const strokeWidth = Math.max(1, 2 / scale);

  // Generate resize handles
  const resizeHandles: ResizeHandle[] = useMemo(() => {
    if (!isSelected) return [];

    const { x, y, width, height } = frame;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return [
      // Corners
      { x: x, y: y, cursor: 'nw-resize', type: 'corner', position: 'top-left' },
      { x: x + width, y: y, cursor: 'ne-resize', type: 'corner', position: 'top-right' },
      { x: x + width, y: y + height, cursor: 'se-resize', type: 'corner', position: 'bottom-right' },
      { x: x, y: y + height, cursor: 'sw-resize', type: 'corner', position: 'bottom-left' },
      // Edges
      { x: x + halfWidth, y: y, cursor: 'n-resize', type: 'edge', position: 'top' },
      { x: x + width, y: y + halfHeight, cursor: 'e-resize', type: 'edge', position: 'right' },
      { x: x + halfWidth, y: y + height, cursor: 's-resize', type: 'edge', position: 'bottom' },
      { x: x, y: y + halfHeight, cursor: 'w-resize', type: 'edge', position: 'left' },
    ];
  }, [frame, isSelected]);

  // Generate gradient fill
  const generateGradient = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!frame.style.gradient) return frame.style.fill || 'transparent';

    const { type, colors, angle = 0 } = frame.style.gradient;
    const { width, height } = frame;

    let gradient: CanvasGradient;

    if (type === 'linear') {
      const radians = (angle * Math.PI) / 180;
      const x1 = Math.cos(radians) * width;
      const y1 = Math.sin(radians) * height;
      gradient = ctx.createLinearGradient(frame.x, frame.y, frame.x + x1, frame.y + y1);
    } else {
      const centerX = frame.x + width / 2;
      const centerY = frame.y + height / 2;
      const radius = Math.max(width, height) / 2;
      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    }

    colors.forEach(({ color, offset }) => {
      gradient.addColorStop(offset, color);
    });

    return gradient;
  }, [frame]);

  // Calculate shadow properties
  const shadowProps = useMemo(() => {
    if (!frame.style.shadow) return {};

    return {
      shadowColor: frame.style.shadow.color,
      shadowBlur: frame.style.shadow.blur,
      shadowOffsetX: frame.style.shadow.offsetX,
      shadowOffsetY: frame.style.shadow.offsetY,
      shadowOpacity: frame.style.shadow.opacity,
    };
  }, [frame.style.shadow]);

  // Handle frame click
  const handleFrameClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelectAction(frame.id);
  }, [frame.id, onSelectAction]);

  // Handle frame double click
  const handleFrameDoubleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onDoubleClick) {
      onDoubleClick(frame.id);
    }
  }, [frame.id, onDoubleClick]);

  // Handle frame drag
  const handleFrameDragStart = useCallback(() => {
    setIsDragging(true);
    if (onDragStart) onDragStart();
  }, [onDragStart]);

  const handleFrameDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    // Update frame position
    const updatedFrame = {
      ...frame,
      x: newX,
      y: newY,
      updatedAt: Date.now(),
      version: frame.version + 1,
    };

    onUpdateAction(updatedFrame);
  }, [frame, onUpdateAction]);

  const handleFrameDragEnd = useCallback(() => {
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  }, [onDragEnd]);

  // Handle resize handle interactions
  const handleResizeStart = useCallback((position: string, e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsResizing(true);
    setResizeHandle(position);
    
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (pointer) {
      setLastPointer(pointer);
    }
  }, []);

  const handleResizeMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isResizing || !lastPointer) return;

    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;

    const deltaX = pointer.x - lastPointer.x;
    const deltaY = pointer.y - lastPointer.y;

    let newX = frame.x;
    let newY = frame.y;
    let newWidth = frame.width;
    let newHeight = frame.height;

    // Apply constraints
    const minWidth = frame.layout?.minWidth || 20;
    const minHeight = frame.layout?.minHeight || 20;
    const maxWidth = frame.layout?.maxWidth || 2000;
    const maxHeight = frame.layout?.maxHeight || 2000;

    switch (resizeHandle) {
      case 'top-left':
        newX += deltaX;
        newY += deltaY;
        newWidth -= deltaX;
        newHeight -= deltaY;
        break;
      case 'top-right':
        newY += deltaY;
        newWidth += deltaX;
        newHeight -= deltaY;
        break;
      case 'bottom-right':
        newWidth += deltaX;
        newHeight += deltaY;
        break;
      case 'bottom-left':
        newX += deltaX;
        newWidth -= deltaX;
        newHeight += deltaY;
        break;
      case 'top':
        newY += deltaY;
        newHeight -= deltaY;
        break;
      case 'right':
        newWidth += deltaX;
        break;
      case 'bottom':
        newHeight += deltaY;
        break;
      case 'left':
        newX += deltaX;
        newWidth -= deltaX;
        break;
    }

    // Apply constraints
    if (newWidth < minWidth) {
      if (resizeHandle.includes('left')) {
        newX = frame.x + frame.width - minWidth;
      }
      newWidth = minWidth;
    }
    if (newWidth > maxWidth) {
      if (resizeHandle.includes('left')) {
        newX = frame.x + frame.width - maxWidth;
      }
      newWidth = maxWidth;
    }
    if (newHeight < minHeight) {
      if (resizeHandle.includes('top')) {
        newY = frame.y + frame.height - minHeight;
      }
      newHeight = minHeight;
    }
    if (newHeight > maxHeight) {
      if (resizeHandle.includes('top')) {
        newY = frame.y + frame.height - maxHeight;
      }
      newHeight = maxHeight;
    }

    // Maintain aspect ratio if needed
    if (frame.layout?.aspectRatio && resizeHandle.includes('corner')) {
      const aspectRatio = frame.layout.aspectRatio;
      const newAspectRatio = newWidth / newHeight;
      
      if (newAspectRatio > aspectRatio) {
        newWidth = newHeight * aspectRatio;
      } else {
        newHeight = newWidth / aspectRatio;
      }
    }

    const updatedFrame = {
      ...frame,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      updatedAt: Date.now(),
      version: frame.version + 1,
    };

    onUpdateAction(updatedFrame);
    setLastPointer(pointer);
  }, [isResizing, lastPointer, resizeHandle, frame, onUpdateAction]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeHandle('');
    setLastPointer(null);
  }, []);

  // Mouse event handlers for stage
  useEffect(() => {
    const stage = stageRef?.current;
    if (!stage || !isResizing) return;

    const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
      handleResizeMove(e);
    };

    const handleStageMouseUp = () => {
      handleResizeEnd();
    };

    stage.on('mousemove', handleStageMouseMove);
    stage.on('mouseup', handleStageMouseUp);

    return () => {
      stage.off('mousemove', handleStageMouseMove);
      stage.off('mouseup', handleStageMouseUp);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd, stageRef]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteAction(frame.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, frame.id, onDeleteAction]);

  // Render frame border with enhanced styling
  const renderFrameBorder = () => {
    const strokeDashArray = frame.style.strokeDasharray 
      ? frame.style.strokeDasharray.map(d => d / scale) 
      : undefined;

    return (
      <Rect
        ref={frameRef}
        x={frame.x}
        y={frame.y}
        width={frame.width}
        height={frame.height}
        fill={frame.style.gradient ? undefined : frame.style.fill || 'transparent'}
        fillEnabled={!!frame.style.fill || !!frame.style.gradient}
        fillPatternImage={frame.style.background?.type === 'image' ? undefined : undefined}
        opacity={frame.style.fillOpacity || 1}
        stroke={frame.style.stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={frame.style.strokeOpacity || 1}
        dash={strokeDashArray}
        cornerRadius={frame.style.cornerRadius || 0}
        listening={true}
        name="frame"
        perfectDrawEnabled={false}
        {...shadowProps}
        onClick={handleFrameClick}
        onDblClick={handleFrameDoubleClick}
        onDragStart={handleFrameDragStart}
        onDragMove={handleFrameDragMove}
        onDragEnd={handleFrameDragEnd}
        draggable={isDraggable && !isResizing}
        // Enhanced custom rendering with better gradient support
        sceneFunc={(context) => {
          const x = frame.x;
          const y = frame.y;
          const width = frame.width;
          const height = frame.height;
          const cornerRadius = frame.style.cornerRadius || 0;

          context.save();
          context.beginPath();
          
          if (cornerRadius > 0) {
            // Smooth rounded rectangle with individual corner radius support
            const radius = Array.isArray(cornerRadius) ? cornerRadius : [cornerRadius, cornerRadius, cornerRadius, cornerRadius];
            const [tl, tr, br, bl] = radius;
            
            context.moveTo(x + tl, y);
            context.lineTo(x + width - tr, y);
            context.quadraticCurveTo(x + width, y, x + width, y + tr);
            context.lineTo(x + width, y + height - br);
            context.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
            context.lineTo(x + bl, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - bl);
            context.lineTo(x, y + tl);
            context.quadraticCurveTo(x, y, x + tl, y);
          } else {
            context.rect(x, y, width, height);
          }

          context.closePath();

          // Apply shadow first
          if (frame.style.shadow) {
            context.shadowColor = frame.style.shadow.color;
            context.shadowBlur = frame.style.shadow.blur;
            context.shadowOffsetX = frame.style.shadow.offsetX;
            context.shadowOffsetY = frame.style.shadow.offsetY;
          }

          // Fill with gradient or solid color
          if (frame.style.gradient) {
            // TypeScript workaround for Konva context compatibility
            const ctx = context as unknown as CanvasRenderingContext2D;
            context.fillStyle = generateGradient(ctx);
            context.globalAlpha = frame.style.fillOpacity || 1;
            context.fill();
          } else if (frame.style.fill && frame.style.fill !== 'transparent') {
            context.fillStyle = frame.style.fill;
            context.globalAlpha = frame.style.fillOpacity || 1;
            context.fill();
          }

          // Reset shadow for stroke
          context.shadowColor = 'transparent';
          context.shadowBlur = 0;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;

          // Stroke
          if (frame.style.stroke && frame.style.strokeWidth > 0) {
            context.strokeStyle = frame.style.stroke;
            context.lineWidth = strokeWidth;
            context.globalAlpha = frame.style.strokeOpacity || 1;
            
            if (frame.style.strokeDasharray?.length) {
              context.setLineDash(frame.style.strokeDasharray.map(d => d / scale));
            }
            context.stroke();
          }

          context.restore();
        }}
      />
    );
  };

  // Render frame label
  const renderFrameLabel = () => {
    if (!frame.name || !isSelected) return null;

    const labelY = frame.y - 20 / scale;
    const fontSize = Math.max(10, 12 / scale);

    return (
      <Group>
        <Rect
          x={frame.x}
          y={labelY - 2}
          width={frame.name.length * fontSize * 0.6 + 8}
          height={fontSize + 4}
          fill="rgba(0, 0, 0, 0.8)"
          cornerRadius={2}
        />
        <Text
          x={frame.x + 4}
          y={labelY}
          text={frame.name}
          fontSize={fontSize}
          fontFamily="Inter, system-ui, sans-serif"
          fill="white"
          fontStyle="500"
        />
      </Group>
    );
  };

  // Render resize handles
  const renderResizeHandles = () => {
    if (!isSelected || isDragging) return null;

    return resizeHandles.map((handle, index) => (
      <Group key={`handle-${index}`}>
        <Circle
          x={handle.x}
          y={handle.y}
          radius={handleSize}
          fill="white"
          stroke="#2563eb"
          strokeWidth={strokeWidth}
          listening={true}
          onMouseDown={(e) => handleResizeStart(handle.position, e)}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = handle.cursor;
            }
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            if (stage) {
              stage.container().style.cursor = 'default';
            }
          }}
        />
        {/* Handle center dot */}
        <Circle
          x={handle.x}
          y={handle.y}
          radius={handleSize / 3}
          fill="#2563eb"
          listening={false}
        />
      </Group>
    ));
  };

  // Render status indicators
  const renderStatusIndicators = () => {
    if (!isSelected) return null;

    const indicators = [];
    const { metadata } = frame;

    // Priority indicator
    if (metadata.priority !== 'low') {
      const colors = {
        medium: '#f59e0b',
        high: '#ef4444',
        urgent: '#dc2626',
      };

      indicators.push(
        <Circle
          key="priority"
          x={frame.x + frame.width - 8}
          y={frame.y + 8}
          radius={4}
          fill={colors[metadata.priority]}
          stroke="white"
          strokeWidth={1}
        />
      );
    }

    // Status indicator
    const statusColors = {
      draft: '#6b7280',
      review: '#f59e0b',
      approved: '#10b981',
      archived: '#9ca3af',
    };

    indicators.push(
      <Rect
        key="status"
        x={frame.x + 4}
        y={frame.y + 4}
        width={8}
        height={8}
        fill={statusColors[metadata.status]}
        cornerRadius={2}
      />
    );

    return indicators;
  };

  return (
    <Group ref={groupRef} name="frame-group">
      {renderFrameBorder()}
      {renderFrameLabel()}
      {renderResizeHandles()}
      {renderStatusIndicators()}
    </Group>
  );
}
