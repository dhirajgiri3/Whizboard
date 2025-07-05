import React, { useMemo } from 'react';
import { Line, Circle } from 'react-konva';

interface FrameAlignmentHelperProps {
  frameElements: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  selectedFrameIds: string[];
  snapDistance?: number;
  showGrid?: boolean;
  gridSize?: number;
}

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  start: number;
  end: number;
  frameIds: string[];
}

interface SnapPoint {
  x: number;
  y: number;
  type: 'corner' | 'center' | 'edge';
  frameId: string;
}

const FrameAlignmentHelper: React.FC<FrameAlignmentHelperProps> = ({
  frameElements,
  selectedFrameIds,
  snapDistance = 10,
  showGrid = false,
  gridSize = 20,
}) => {
  // Calculate alignment guides
  const alignmentGuides = useMemo((): AlignmentGuide[] => {
    if (selectedFrameIds.length === 0) return [];

    const guides: AlignmentGuide[] = [];
    const allFrames = frameElements.filter(frame => !selectedFrameIds.includes(frame.id));
    const selectedFrames = frameElements.filter(frame => selectedFrameIds.includes(frame.id));

    // Calculate guides for each selected frame
    selectedFrames.forEach(selectedFrame => {
      const selectedCenterX = selectedFrame.x + selectedFrame.width / 2;
      const selectedCenterY = selectedFrame.y + selectedFrame.height / 2;
      const selectedRight = selectedFrame.x + selectedFrame.width;
      const selectedBottom = selectedFrame.y + selectedFrame.height;

      allFrames.forEach(frame => {
        const centerX = frame.x + frame.width / 2;
        const centerY = frame.y + frame.height / 2;
        const right = frame.x + frame.width;
        const bottom = frame.y + frame.height;

        // Vertical alignment guides
        const verticalAlignments = [
          { pos: frame.x, type: 'left' },
          { pos: centerX, type: 'center' },
          { pos: right, type: 'right' },
        ];

        verticalAlignments.forEach(alignment => {
          const distance = Math.abs(selectedCenterX - alignment.pos);
          if (distance <= snapDistance) {
            guides.push({
              type: 'vertical',
              position: alignment.pos,
              start: Math.min(selectedFrame.y, frame.y) - 20,
              end: Math.max(selectedBottom, bottom) + 20,
              frameIds: [selectedFrame.id, frame.id],
            });
          }
        });

        // Horizontal alignment guides
        const horizontalAlignments = [
          { pos: frame.y, type: 'top' },
          { pos: centerY, type: 'center' },
          { pos: bottom, type: 'bottom' },
        ];

        horizontalAlignments.forEach(alignment => {
          const distance = Math.abs(selectedCenterY - alignment.pos);
          if (distance <= snapDistance) {
            guides.push({
              type: 'horizontal',
              position: alignment.pos,
              start: Math.min(selectedFrame.x, frame.x) - 20,
              end: Math.max(selectedRight, right) + 20,
              frameIds: [selectedFrame.id, frame.id],
            });
          }
        });
      });
    });

    return guides;
  }, [frameElements, selectedFrameIds, snapDistance]);

  // Calculate snap points
  const snapPoints = useMemo((): SnapPoint[] => {
    if (selectedFrameIds.length === 0) return [];

    const points: SnapPoint[] = [];
    const allFrames = frameElements.filter(frame => !selectedFrameIds.includes(frame.id));

    allFrames.forEach(frame => {
      const centerX = frame.x + frame.width / 2;
      const centerY = frame.y + frame.height / 2;
      const right = frame.x + frame.width;
      const bottom = frame.y + frame.height;

      // Corner points
      points.push(
        { x: frame.x, y: frame.y, type: 'corner', frameId: frame.id },
        { x: right, y: frame.y, type: 'corner', frameId: frame.id },
        { x: frame.x, y: bottom, type: 'corner', frameId: frame.id },
        { x: right, y: bottom, type: 'corner', frameId: frame.id }
      );

      // Center point
      points.push({ x: centerX, y: centerY, type: 'center', frameId: frame.id });

      // Edge midpoints
      points.push(
        { x: centerX, y: frame.y, type: 'edge', frameId: frame.id },
        { x: centerX, y: bottom, type: 'edge', frameId: frame.id },
        { x: frame.x, y: centerY, type: 'edge', frameId: frame.id },
        { x: right, y: centerY, type: 'edge', frameId: frame.id }
      );
    });

    return points;
  }, [frameElements, selectedFrameIds]);

  // Grid lines
  const gridLines = useMemo(() => {
    if (!showGrid) return [];

    const lines: React.ReactElement[] = [];
    const canvasSize = 2000; // Adjust based on your canvas size
    
    // Vertical grid lines
    for (let x = 0; x <= canvasSize; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, canvasSize]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          opacity={0.3}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }

    // Horizontal grid lines
    for (let y = 0; y <= canvasSize; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, canvasSize, y]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
          opacity={0.3}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }

    return lines;
  }, [showGrid, gridSize]);

  return (
    <>
      {/* Grid lines */}
      {gridLines}

      {/* Alignment guides */}
      {alignmentGuides.map((guide, index) => (
        <Line
          key={`guide-${index}`}
          points={
            guide.type === 'vertical'
              ? [guide.position, guide.start, guide.position, guide.end]
              : [guide.start, guide.position, guide.end, guide.position]
          }
          stroke="#ff4757"
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.8}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}

      {/* Snap points */}
      {snapPoints.map((point, index) => (
        <Circle
          key={`snap-${index}`}
          x={point.x}
          y={point.y}
          radius={point.type === 'center' ? 4 : 2}
          fill={
            point.type === 'center'
              ? '#ff4757'
              : point.type === 'corner'
              ? '#2ed573'
              : '#ffa502'
          }
          opacity={0.6}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
    </>
  );
};

export default FrameAlignmentHelper;
