import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Line, Rect, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import type Konva from 'konva';

interface SelectionPoint {
  x: number;
  y: number;
}

interface AdvancedSelectionManagerProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  isActive: boolean;
  selectionMode: 'lasso' | 'marquee' | 'none';
  onSelectionChange: (selectedIds: string[]) => void;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  selectableElements: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string;
  }>;
  className?: string;
}

interface LassoSelection {
  points: SelectionPoint[];
  visible: boolean;
}

interface MarqueeSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

const AdvancedSelectionManager: React.FC<AdvancedSelectionManagerProps> = ({
  stageRef,
  isActive,
  selectionMode,
  onSelectionChange,
  onSelectionStart,
  onSelectionEnd,
  selectableElements,
  className = "",
}) => {
  const [lassoSelection, setLassoSelection] = useState<LassoSelection>({
    points: [],
    visible: false,
  });
  
  const [marqueeSelection, setMarqueeSelection] = useState<MarqueeSelection>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  });
  
  const [isSelecting, setIsSelecting] = useState(false);
  const startPointRef = useRef<SelectionPoint | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const doubleClickThreshold = 300; // ms

  // Helper function to check if a point is inside a polygon (for lasso selection)
  const pointInPolygon = useCallback((point: SelectionPoint, polygon: SelectionPoint[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        ((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
        (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
      ) {
        inside = !inside;
      }
    }
    return inside;
  }, []);

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

  // Get elements that intersect with lasso selection
  const getLassoIntersectingElements = useCallback((lassoPoints: SelectionPoint[]) => {
    if (lassoPoints.length < 3) return [];
    
    return selectableElements.filter(element => {
      // Check if any corner of the element is inside the lasso
      const corners = [
        { x: element.x, y: element.y },
        { x: element.x + element.width, y: element.y },
        { x: element.x + element.width, y: element.y + element.height },
        { x: element.x, y: element.y + element.height },
      ];
      
      return corners.some(corner => pointInPolygon(corner, lassoPoints));
    }).map(element => element.id);
  }, [selectableElements, pointInPolygon]);

  // Get elements that intersect with marquee selection
  const getMarqueeIntersectingElements = useCallback((marquee: MarqueeSelection) => {
    return selectableElements.filter(element =>
      rectanglesIntersect(marquee, element)
    ).map(element => element.id);
  }, [selectableElements, rectanglesIntersect]);

  // Handle mouse down for selection
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isActive || selectionMode === 'none') return;

    const stage = stageRef.current;
    if (!stage) return;

    // Enhanced check to avoid interfering with interactive elements
    const target = e.target;
    
    // Check if clicked on stage background (not on any interactive element)
    if (target === stage) {
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const stagePoint = transform.point(pos);

      startPointRef.current = stagePoint;
      setIsSelecting(true);
      onSelectionStart();

      if (selectionMode === 'lasso') {
        setLassoSelection({
          points: [stagePoint],
          visible: true,
        });
      } else if (selectionMode === 'marquee') {
        setMarqueeSelection({
          x: stagePoint.x,
          y: stagePoint.y,
          width: 0,
          height: 0,
          visible: true,
        });
      }
    }
  }, [isActive, selectionMode, stageRef, onSelectionStart]);

  // Handle mouse move for selection
  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isSelecting || !startPointRef.current) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePoint = transform.point(pos);

    if (selectionMode === 'lasso') {
      setLassoSelection(prev => ({
        ...prev,
        points: [...prev.points, stagePoint],
      }));
    } else if (selectionMode === 'marquee') {
      const startPoint = startPointRef.current;
      setMarqueeSelection({
        x: Math.min(startPoint.x, stagePoint.x),
        y: Math.min(startPoint.y, stagePoint.y),
        width: Math.abs(stagePoint.x - startPoint.x),
        height: Math.abs(stagePoint.y - startPoint.y),
        visible: true,
      });
    }
  }, [isActive, isSelecting, selectionMode, stageRef]);

  // Handle mouse up for selection
  const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isSelecting) return;

    setIsSelecting(false);
    onSelectionEnd();

    if (selectionMode === 'lasso' && lassoSelection.points.length > 2) {
      const selectedIds = getLassoIntersectingElements(lassoSelection.points);
      onSelectionChange(selectedIds);
    } else if (selectionMode === 'marquee' && marqueeSelection.width > 5 && marqueeSelection.height > 5) {
      const selectedIds = getMarqueeIntersectingElements(marqueeSelection);
      onSelectionChange(selectedIds);
    }

    // Reset selections
    setLassoSelection({ points: [], visible: false });
    setMarqueeSelection({ x: 0, y: 0, width: 0, height: 0, visible: false });
    startPointRef.current = null;
  }, [
    isActive,
    isSelecting,
    selectionMode,
    lassoSelection,
    marqueeSelection,
    getLassoIntersectingElements,
    getMarqueeIntersectingElements,
    onSelectionChange,
    onSelectionEnd,
  ]);

  // Event listeners
  useEffect(() => {
    if (!isActive) return;

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
  }, [isActive, handleMouseDown, handleMouseMove, handleMouseUp, stageRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setLassoSelection({ points: [], visible: false });
          setMarqueeSelection({ x: 0, y: 0, width: 0, height: 0, visible: false });
          setIsSelecting(false);
          onSelectionChange([]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSelectionChange]);

  if (!isActive) return null;

  return (
    <Group name="advanced-selection-layer">
      {/* Lasso Selection Visual */}
      {lassoSelection.visible && lassoSelection.points.length > 1 && (
        <Line
          points={lassoSelection.points.flatMap(point => [point.x, point.y])}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray={[5, 5]}
          fill="rgba(59, 130, 246, 0.1)"
          closed={true}
          listening={false}
        />
      )}

      {/* Marquee Selection Visual */}
      {marqueeSelection.visible && marqueeSelection.width > 0 && marqueeSelection.height > 0 && (
        <Rect
          x={marqueeSelection.x}
          y={marqueeSelection.y}
          width={marqueeSelection.width}
          height={marqueeSelection.height}
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray={[5, 5]}
          fill="rgba(59, 130, 246, 0.1)"
          listening={false}
        />
      )}
    </Group>
  );
};

export default AdvancedSelectionManager; 