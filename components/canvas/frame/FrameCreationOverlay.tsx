import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Group, Rect, Text, Line, Circle } from 'react-konva';
import { FrameElement } from '@/types';

interface FrameCreationOverlayProps {
  isActive: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  scale: number;
  onTemplateSelect?: (template: string) => void;
  showGuides?: boolean;
}

interface FrameTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  color: string;
  description: string;
}

const FRAME_TEMPLATES: FrameTemplate[] = [
  {
    id: 'square',
    name: 'Square',
    width: 200,
    height: 200,
    aspectRatio: 1,
    color: '#3b82f6',
    description: 'Perfect for icons and logos'
  },
  {
    id: 'portrait',
    name: 'Portrait',
    width: 200,
    height: 300,
    aspectRatio: 2/3,
    color: '#22c55e',
    description: 'Great for photos and cards'
  },
  {
    id: 'landscape',
    name: 'Landscape',
    width: 300,
    height: 200,
    aspectRatio: 3/2,
    color: '#f59e0b',
    description: 'Perfect for banners'
  },
  {
    id: 'wide',
    name: 'Wide',
    width: 400,
    height: 150,
    aspectRatio: 8/3,
    color: '#ef4444',
    description: 'Ideal for headers'
  }
];

const FrameCreationOverlay: React.FC<FrameCreationOverlayProps> = ({
  isActive,
  startPoint,
  currentPoint,
  scale,
  onTemplateSelect,
  showGuides = true,
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  // Optimized animation using requestAnimationFrame with throttling
  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      return;
    }

    const animate = (timestamp: number) => {
      // Throttle animation to 30fps for better performance
      if (timestamp - lastFrameTime.current >= 33) {
        setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2));
        lastFrameTime.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
    };
  }, [isActive]);

  // Memoized frame calculations
  const frameData = useMemo(() => {
    if (!startPoint || !currentPoint) return null;
    
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    
    return { x, y, width, height };
  }, [startPoint, currentPoint]);

  // Memoized template matching with performance optimization
  const currentTemplate = useMemo(() => {
    if (!frameData || frameData.width < 50 || frameData.height < 50) {
      return null;
    }
    
    const aspectRatio = frameData.width / frameData.height;
    return FRAME_TEMPLATES.find(template => 
      Math.abs(template.aspectRatio - aspectRatio) < 0.15
    ) || null;
  }, [frameData]);

  // Memoized visual properties
  const visualProps = useMemo(() => {
    const baseOpacity = 0.4;
    const pulseAmount = Math.sin(animationPhase) * 0.1;
    return {
      opacity: baseOpacity + pulseAmount,
      guideOpacity: 0.25,
      cornerOpacity: 0.6 + pulseAmount * 0.5,
    };
  }, [animationPhase]);

  // Memoized guide lines to prevent recalculation
  const guideLines = useMemo(() => {
    if (!showGuides || !frameData) return null;

    const { x, y, width, height } = frameData;
    const extension = 100;

    return [
      // Horizontal guides - simplified
      [x - extension, y, x + width + extension, y],
      [x - extension, y + height, x + width + extension, y + height],
      // Vertical guides - simplified  
      [x, y - extension, x, y + height + extension],
      [x + width, y - extension, x + width, y + height + extension],
    ];
  }, [showGuides, frameData]);

  // Early return if not active or no frame data
  if (!isActive || !frameData) return null;

  const { x, y, width, height } = frameData;
  const isValidSize = width >= 50 && height >= 50;

  return (
    <Group listening={false}>
      {/* Simplified creation guides */}
      {showGuides && guideLines && (
        <Group opacity={visualProps.guideOpacity} listening={false}>
          {guideLines.map((points, index) => (
            <Line
              key={index}
              points={points}
              stroke="#94a3b8"
              strokeWidth={Math.max(1 / scale, 0.5)}
              dash={[8 / scale, 8 / scale]}
              perfectDrawEnabled={false}
              listening={false}
            />
          ))}
        </Group>
      )}

      {/* Simplified corner indicators */}
      <Group opacity={visualProps.cornerOpacity} listening={false}>
        {[
          [x, y], [x + width, y], 
          [x, y + height], [x + width, y + height]
        ].map(([cornerX, cornerY], index) => (
          <Circle
            key={index}
            x={cornerX}
            y={cornerY}
            radius={Math.max(4 / scale, 2)}
            fill="#3b82f6"
            perfectDrawEnabled={false}
            listening={false}
          />
        ))}
      </Group>

      {/* Template match indicator - only show when valid */}
      {currentTemplate && isValidSize && (
        <Group listening={false}>
          <Rect
            x={x + width / 2 - 60 / scale}
            y={y - 35 / scale}
            width={120 / scale}
            height={28 / scale}
            fill={currentTemplate.color}
            cornerRadius={14 / scale}
            opacity={0.95}
            perfectDrawEnabled={false}
            listening={false}
          />
          <Text
            x={x + width / 2}
            y={y - 21 / scale}
            text={`📐 ${currentTemplate.name}`}
            fontSize={Math.max(12 / scale, 8)}
            fontFamily="'Inter', -apple-system, sans-serif"
            fontStyle="600"
            fill="white"
            align="center"
            verticalAlign="middle"
            perfectDrawEnabled={false}
            listening={false}
          />
        </Group>
      )}

      {/* Simplified status message */}
      <Group listening={false}>
        <Rect
          x={x + width / 2 - (isValidSize ? 60 : 50) / scale}
          y={y + height / 2 - 10 / scale}
          width={(isValidSize ? 120 : 100) / scale}
          height={20 / scale}
          fill={isValidSize ? "#22c55e" : "#6366f1"}
          cornerRadius={10 / scale}
          opacity={visualProps.opacity}
          perfectDrawEnabled={false}
          listening={false}
        />
        <Text
          x={x + width / 2}
          y={y + height / 2}
          text={isValidSize ? "Release to create" : "Keep dragging..."}
          fontSize={Math.max(11 / scale, 8)}
          fontFamily="'Inter', -apple-system, sans-serif"
          fontStyle="500"
          fill="white"
          align="center"
          verticalAlign="middle"
          perfectDrawEnabled={false}
          listening={false}
        />
      </Group>

      {/* Simplified measurements - only for larger frames */}
      {isValidSize && width > 150 && height > 100 && (
        <Group opacity={0.7} listening={false}>
          {/* Width measurement */}
          <Group listening={false}>
            <Line
              points={[x, y + height + 20 / scale, x + width, y + height + 20 / scale]}
              stroke="#64748b"
              strokeWidth={Math.max(1 / scale, 0.5)}
              perfectDrawEnabled={false}
              listening={false}
            />
            <Text
              x={x + width / 2}
              y={y + height + 20 / scale}
              text={`${Math.round(width)}px`}
              fontSize={Math.max(9 / scale, 6)}
              fontFamily="'Inter', monospace"
              fontStyle="500"
              fill="#64748b"
              align="center"
              verticalAlign="middle"
              perfectDrawEnabled={false}
              listening={false}
            />
          </Group>

          {/* Height measurement */}
          <Group listening={false}>
            <Line
              points={[x + width + 20 / scale, y, x + width + 20 / scale, y + height]}
              stroke="#64748b"
              strokeWidth={Math.max(1 / scale, 0.5)}
              perfectDrawEnabled={false}
              listening={false}
            />
            <Text
              x={x + width + 20 / scale}
              y={y + height / 2}
              text={`${Math.round(height)}px`}
              fontSize={Math.max(9 / scale, 6)}
              fontFamily="'Inter', monospace"
              fontStyle="500"
              fill="#64748b"
              align="center"
              verticalAlign="middle"
              rotation={-90}
              perfectDrawEnabled={false}
              listening={false}
            />
          </Group>
        </Group>
      )}
    </Group>
  );
};

export default FrameCreationOverlay;
