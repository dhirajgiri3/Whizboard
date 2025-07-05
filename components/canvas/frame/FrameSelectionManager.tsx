import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Rect, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';

interface SelectionRectProps {
  onSelectionChange: (selectedIds: string[]) => void;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  frameElements: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  stageRef: React.RefObject<Konva.Stage | null>;
  isActive: boolean;
  selectedFrameIds: string[];
}

interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

const FrameSelectionManager: React.FC<SelectionRectProps> = ({
  onSelectionChange,
  onSelectionStart,
  onSelectionEnd,
  frameElements,
  stageRef,
  isActive,
  selectedFrameIds,
}) => {
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  });
  
  const [isSelecting, setIsSelecting] = useState(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const selectionRectRef = useRef<Konva.Rect>(null);
  const lastClickTimeRef = useRef<number>(0);
  const doubleClickThreshold = 300; // ms
  const [selectionMode, setSelectionMode] = useState<'new' | 'add' | 'remove'>('new');

  // Helper function to check if two rectangles intersect
  const rectanglesIntersect = useCallback((
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): boolean => {
    return !(
      rect1.x > rect2.x + rect2.width ||
      rect1.x + rect1.width < rect2.x ||
      rect1.y > rect2.y + rect2.height ||
      rect1.y + rect1.height < rect2.y
    );
  }, []);

  // Get elements that intersect with selection box
  const getIntersectingElements = useCallback((selectionRect: SelectionBox) => {
    return frameElements.filter(element =>
      rectanglesIntersect(selectionRect, element)
    ).map(element => element.id);
  }, [frameElements, rectanglesIntersect]);

  // Handle mouse down for selection
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isActive) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Check if clicked on stage background (not on a frame or other element)
    if (e.target === stage) {
      // Check if the click target is specifically the stage, not a frame
      const targetName = e.target.name();
      if (targetName && (targetName.includes('frame') || targetName.includes('sticky'))) {
        return; // Don't start selection if clicked on a frame or sticky note
      }

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const stagePoint = transform.point(pos);

      startPointRef.current = stagePoint;
      setSelectionBox({
        x: stagePoint.x,
        y: stagePoint.y,
        width: 0,
        height: 0,
        visible: true,
      });
      setIsSelecting(true);
      onSelectionStart();

      // Determine selection mode based on modifier keys
      if (e.evt.shiftKey) {
        setSelectionMode('add');
      } else if (e.evt.altKey) {
        setSelectionMode('remove');
      } else {
        setSelectionMode('new');
      }

      // Handle click without drag
      const now = Date.now();
      if (now - lastClickTimeRef.current < doubleClickThreshold) {
        // Double click - select all frames
        onSelectionChange(frameElements.map(frame => frame.id));
      } else if (!e.evt.shiftKey && !e.evt.altKey) {
        // Single click without modifiers - clear selection only if no frames are being clicked
        // This will be handled by the canvas click handler instead
      }
      lastClickTimeRef.current = now;
    }
  }, [isActive, stageRef, frameElements, onSelectionStart, onSelectionChange]);

  // Handle mouse move for selection box
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isSelecting || !startPointRef.current || !isActive) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePoint = transform.point(pos);

    const x = Math.min(startPointRef.current.x, stagePoint.x);
    const y = Math.min(startPointRef.current.y, stagePoint.y);
    const width = Math.abs(stagePoint.x - startPointRef.current.x);
    const height = Math.abs(stagePoint.y - startPointRef.current.y);

    setSelectionBox({
      x,
      y,
      width,
      height,
      visible: true,
    });

    // Get intersecting elements
    const intersectingIds = getIntersectingElements({ x, y, width, height, visible: true });
    
    // Update selection based on selection mode
    switch (selectionMode) {
      case 'add':
        // Add to existing selection
        onSelectionChange([...new Set([...selectedFrameIds, ...intersectingIds])]);
        break;
      case 'remove':
        // Remove from existing selection
        onSelectionChange(selectedFrameIds.filter(id => !intersectingIds.includes(id)));
        break;
      default:
        // Replace selection
        onSelectionChange(intersectingIds);
    }
  }, [isSelecting, isActive, stageRef, getIntersectingElements, selectedFrameIds, onSelectionChange, selectionMode]);

  // Handle mouse up for selection
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;

    setIsSelecting(false);
    setSelectionBox(prev => ({ ...prev, visible: false }));
    startPointRef.current = null;
    onSelectionEnd();
  }, [isSelecting, onSelectionEnd]);

  // Add event listeners
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };
  }, [stageRef, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts for selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      // Escape to cancel selection
      if (e.key === 'Escape') {
        if (isSelecting) {
          setIsSelecting(false);
          setSelectionBox(prev => ({ ...prev, visible: false }));
          onSelectionEnd();
        } else {
          // Clear selection if not selecting
          onSelectionChange([]);
        }
      }

      // Ctrl/Cmd + A to select all frames
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onSelectionChange(frameElements.map(frame => frame.id));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isSelecting, onSelectionEnd, onSelectionChange, frameElements]);

  if (!selectionBox.visible) return null;

  return (
    <Group>
      <Rect
        ref={selectionRectRef}
        x={selectionBox.x}
        y={selectionBox.y}
        width={selectionBox.width}
        height={selectionBox.height}
        fill={selectionMode === 'remove' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(59, 130, 246, 0.1)'}
        stroke={selectionMode === 'remove' ? '#ef4444' : '#3b82f6'}
        strokeWidth={1}
        dash={[4, 4]}
      />
    </Group>
  );
};

export default FrameSelectionManager;
