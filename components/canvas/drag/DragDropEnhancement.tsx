"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';

interface DragPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
}

interface DropZone {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'frame' | 'canvas' | 'group';
  visible: boolean;
  highlighted: boolean;
}

interface DragDropEnhancementProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  isActive: boolean;
  onDragStart?: (elementId: string, position: { x: number; y: number }) => void;
  onDragMove?: (elementId: string, position: { x: number; y: number }) => void;
  onDragEnd?: (elementId: string, position: { x: number; y: number }) => void;
  onDropZoneEnter?: (zoneId: string) => void;
  onDropZoneLeave?: (zoneId: string) => void;
  onDropZoneDrop?: (zoneId: string, elementId: string) => void;
  className?: string;
}

const DragDropEnhancement: React.FC<DragDropEnhancementProps> = ({
  stageRef,
  isActive,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDropZoneEnter,
  onDropZoneLeave,
  onDropZoneDrop,
  className = "",
}) => {
  const [dragPreview, setDragPreview] = useState<DragPreview>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0.7,
    visible: false,
  });
  
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [currentDragElement, setCurrentDragElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Create drop zones for different areas
  const createDropZones = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return [];

    const stageSize = stage.size();
    const padding = 20;
    
    return [
      {
        x: padding,
        y: padding,
        width: 200,
        height: 100,
        type: 'frame' as const,
        visible: true,
        highlighted: false,
      },
      {
        x: stageSize.width - 220,
        y: padding,
        width: 200,
        height: 100,
        type: 'canvas' as const,
        visible: true,
        highlighted: false,
      },
      {
        x: padding,
        y: stageSize.height - 120,
        width: 200,
        height: 100,
        type: 'group' as const,
        visible: true,
        highlighted: false,
      },
    ];
  }, [stageRef]);

  // Update drop zones when stage size changes
  useEffect(() => {
    if (isActive) {
      setDropZones(createDropZones());
    }
  }, [isActive, createDropZones]);

  // Check if a point is inside a drop zone
  const isPointInDropZone = useCallback((point: { x: number; y: number }, zone: DropZone): boolean => {
    return (
      point.x >= zone.x &&
      point.x <= zone.x + zone.width &&
      point.y >= zone.y &&
      point.y <= zone.y + zone.height
    );
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((elementId: string, position: { x: number; y: number }) => {
    setIsDragging(true);
    setCurrentDragElement(elementId);
    dragStartPosRef.current = position;
    
    // Show drag preview
    setDragPreview({
      x: position.x,
      y: position.y,
      width: 100, // Default size, can be customized
      height: 100,
      opacity: 0.7,
      visible: true,
    });

    onDragStart?.(elementId, position);
  }, [onDragStart]);

  // Handle drag move
  const handleDragMove = useCallback((elementId: string, position: { x: number; y: number }) => {
    if (!isDragging) return;

    // Update drag preview position
    setDragPreview(prev => ({
      ...prev,
      x: position.x,
      y: position.y,
    }));

    // Check drop zones
    setDropZones(prev => prev.map(zone => ({
      ...zone,
      highlighted: isPointInDropZone(position, zone),
    })));

    onDragMove?.(elementId, position);
  }, [isDragging, isPointInDropZone, onDragMove]);

  // Handle drag end
  const handleDragEnd = useCallback((elementId: string, position: { x: number; y: number }) => {
    setIsDragging(false);
    
    // Hide drag preview
    setDragPreview(prev => ({ ...prev, visible: false }));

    // Check if dropped on a drop zone
    const highlightedZone = dropZones.find(zone => zone.highlighted);
    if (highlightedZone) {
      onDropZoneDrop?.(highlightedZone.type, elementId);
    }

    // Reset drop zones highlighting
    setDropZones(prev => prev.map(zone => ({ ...zone, highlighted: false })));

    setCurrentDragElement(null);
    dragStartPosRef.current = null;

    onDragEnd?.(elementId, position);
  }, [dropZones, onDropZoneDrop, onDragEnd]);

  // Global drag event handlers
  useEffect(() => {
    if (!isActive) return;

    const handleGlobalDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const elementId = target.getAttribute('data-element-id');
      
      if (elementId) {
        const stage = stageRef.current;
        if (stage) {
          const pos = stage.getPointerPosition();
          if (pos) {
            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const stagePoint = transform.point(pos);
            handleDragStart(elementId, stagePoint);
          }
        }
      }
    };

    const handleGlobalDragMove = (e: DragEvent) => {
      if (!isDragging || !currentDragElement) return;

      const stage = stageRef.current;
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          const transform = stage.getAbsoluteTransform().copy();
          transform.invert();
          const stagePoint = transform.point(pos);
          handleDragMove(currentDragElement, stagePoint);
        }
      }
    };

    const handleGlobalDragEnd = (e: DragEvent) => {
      if (!isDragging || !currentDragElement) return;

      const stage = stageRef.current;
      if (stage) {
        const pos = stage.getPointerPosition();
        if (pos) {
          const transform = stage.getAbsoluteTransform().copy();
          transform.invert();
          const stagePoint = transform.point(pos);
          handleDragEnd(currentDragElement, stagePoint);
        }
      }
    };

    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('dragover', handleGlobalDragMove);
    document.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragover', handleGlobalDragMove);
      document.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [isActive, isDragging, currentDragElement, handleDragStart, handleDragMove, handleDragEnd, stageRef]);

  if (!isActive) return null;

  return (
    <Group name="drag-drop-enhancement">
      {/* Drag Preview */}
      {dragPreview.visible && (
        <Rect
          x={dragPreview.x}
          y={dragPreview.y}
          width={dragPreview.width}
          height={dragPreview.height}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray={[5, 5]}
          opacity={dragPreview.opacity}
          listening={false}
        />
      )}

      {/* Drop Zones */}
      {dropZones.map((zone, index) => (
        <Group key={`drop-zone-${index}`}>
          <Rect
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            fill={zone.highlighted ? "rgba(34, 197, 94, 0.2)" : "rgba(156, 163, 175, 0.1)"}
            stroke={zone.highlighted ? "#22c55e" : "#9ca3af"}
            strokeWidth={zone.highlighted ? 3 : 1}
            strokeDasharray={[5, 5]}
            listening={false}
          />
          <Text
            x={zone.x + 10}
            y={zone.y + 10}
            text={zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}
            fontSize={14}
            fontFamily="Inter"
            fill={zone.highlighted ? "#22c55e" : "#9ca3af"}
            listening={false}
          />
        </Group>
      ))}

      {/* Drag Instructions */}
      {isDragging && (
        <Text
          x={20}
          y={20}
          text="Drop to organize or group elements"
          fontSize={12}
          fontFamily="Inter"
          fill="#6b7280"
          listening={false}
        />
      )}
    </Group>
  );
};

export default DragDropEnhancement; 