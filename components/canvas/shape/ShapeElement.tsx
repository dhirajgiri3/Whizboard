import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Rect, 
  Circle, 
  Ellipse, 
  RegularPolygon, 
  Star, 
  Wedge, 
  Arc, 
  Ring, 
  Line, 
  Arrow, 
  Path, 
  Transformer, 
  Group,
  Text
} from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { ShapeElement as ShapeElementType } from "@/types";
import type Konva from "konva";

interface ShapeElementProps {
  shape: ShapeElementType;
  isSelected: boolean;
  isDraggable: boolean;
  onSelectAction: (shapeId: string, e?: KonvaEventObject<MouseEvent>, multiSelect?: boolean) => void;
  onUpdateAction: (shape: ShapeElementType) => void;
  onDeleteAction: (shapeId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  scale?: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
  currentTool?: string;
}

const ShapeElement: React.FC<ShapeElementProps> = React.memo(({
  shape,
  isSelected,
  isDraggable,
  onSelectAction,
  onUpdateAction,
  onDeleteAction,
  onDragStart,
  onDragEnd,
  scale = 1,
  currentTool = "select",
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickStartTime, setClickStartTime] = useState<number>(0);

  // Get shape properties with fallbacks
  const { 
    id, 
    x, 
    y, 
    width = 100, 
    height = 100, 
    rotation = 0, 
    shapeType, 
    shapeData, 
    style,
    draggable = true,
    selectable = true,
    locked = false
  } = shape;

  const {
    fill = "#ffffff",
    fillOpacity = 1,
    fillEnabled = true,
    stroke = "#000000",
    strokeWidth = 2,
    strokeOpacity = 1,
    strokeEnabled = true,
    strokeDasharray,
    strokeLineCap = "round",
    strokeLineJoin = "round",
    shadow,
    opacity = 1,
    cornerRadius = 0,
  } = style;

  // Simplified tool checking
  const isShapeSelectable = useCallback(() => {
    const selectableTools = ["select", "shapes", "move", "cursor", "pointer"];
    return selectableTools.includes(currentTool) && selectable && !locked;
  }, [currentTool, selectable, locked]);

  // Get enabled anchors based on shape type
  const getEnabledAnchors = useCallback(() => {
    switch (shapeType) {
      case 'circle':
        return ["top-left", "top-right", "bottom-left", "bottom-right"];
      case 'line':
      case 'arrow':
        return ["middle-left", "middle-right"];
      default:
        return [
          "top-left", "top-center", "top-right",
          "middle-left", "middle-right",
          "bottom-left", "bottom-center", "bottom-right"
        ];
    }
  }, [shapeType]);

  // Enhanced transformer configuration
  type BoundingBox = { x: number; y: number; width: number; height: number; rotation: number };

  const getTransformerConfig = useCallback(() => {
    const scaleFactor = Math.max(1 / scale, 0.5);
    const minSize = Math.max(10, 20 / scale);
    const maxSize = Math.min(5000 / scale, 5000);

    return {
      boundBoxFunc: (oldBox: BoundingBox, newBox: BoundingBox) => {
        if (newBox.width < minSize || newBox.height < minSize) {
          return oldBox;
        }
        if (newBox.width > maxSize || newBox.height > maxSize) {
          return oldBox;
        }
        return newBox;
      },
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      rotationSnapTolerance: 15,
      padding: Math.max(5 / scale, 3),
      enabledAnchors: getEnabledAnchors(),
      anchorFill: "#FFFFFF",
      anchorStroke: isTransforming ? "#3b82f6" : "#6b7280",
      anchorStrokeWidth: Math.max(2 / scale, 1),
      anchorSize: Math.max(8 / scale, 6),
      borderStroke: isTransforming ? "#3b82f6" : "#6b7280",
      borderStrokeWidth: Math.max(1.5 / scale, 1),
      borderDash: [4 * scaleFactor, 4 * scaleFactor],
      keepRatio: shape.constraints?.keepAspectRatio || false,
      centeredScaling: false,
      flipEnabled: false,
      ignoreStroke: true,
    };
  }, [scale, isTransforming, shape.constraints?.keepAspectRatio, getEnabledAnchors]);

  // Transformer attachment
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      const timer = setTimeout(() => {
        if (trRef.current && shapeRef.current) {
          trRef.current.nodes([shapeRef.current]);
          trRef.current.getLayer()?.batchDraw();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  // Enhanced selection handler (simplified from frame tool)
  const handleSelect = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      if (isDragging || isTransforming) return;
      if (!isShapeSelectable()) return;

      const clickDuration = Date.now() - clickStartTime;
      if (clickDuration > 300) return; // Prevent selection after long press/drag

      const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey;
      onSelectAction(id, e, isMultiSelect);
    },
    [
      id,
      isDragging,
      isTransforming,
      onSelectAction,
      isShapeSelectable,
      clickStartTime,
    ]
  );

  // Enhanced mouse down handler (simplified from frame tool)
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      setClickStartTime(Date.now());

      if (isShapeSelectable() && !isDragging && !isTransforming) {
        const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey || e.evt.shiftKey;
        onSelectAction(id, e, isMultiSelect);
      }
    },
    [id, isDragging, isTransforming, onSelectAction, isShapeSelectable]
  );

  // Simplified drag handlers (following frame tool pattern)
  const handleDragStart = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      console.log(`Starting drag for shape ${id}`);
      
      setIsDragging(true);
      setDragStartPos({ x, y });

      // Select the shape if it's not already selected
      if (isShapeSelectable() && !isSelected) {
        onSelectAction(id);
      }

      // Optimize rendering during drag
      if (groupRef.current) {
        groupRef.current.moveToTop();
      }

      onDragStart?.();
    },
    [
      x,
      y,
      id,
      isSelected,
      onSelectAction,
      isShapeSelectable,
      onDragStart,
    ]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      console.log(`Ending drag for shape ${id}`);

      setIsDragging(false);

      const node = e.target;
      const newX = Math.round(node.x());
      const newY = Math.round(node.y());

      // Only update if there was actual movement
      if (
        dragStartPos &&
        (Math.abs(newX - dragStartPos.x) > 1 ||
          Math.abs(newY - dragStartPos.y) > 1)
      ) {
        const updatedShape: ShapeElementType = {
          ...shape,
          x: newX,
          y: newY,
          updatedAt: Date.now(),
        };

        onUpdateAction(updatedShape);
      }

      setDragStartPos(null);
      onDragEnd?.();
    },
    [id, shape, dragStartPos, onUpdateAction, onDragEnd]
  );

  // Transform handlers
  const handleTransformStart = useCallback(() => {
    console.log(`Starting transform for shape ${id}`);
    setIsTransforming(true);
  }, [id]);

  const handleTransform = useCallback(() => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = Math.max(10, Math.abs(node.width() * scaleX));
    const newHeight = Math.max(10, Math.abs(node.height() * scaleY));

    // Reset scale to 1 and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    node.width(newWidth);
    node.height(newHeight);

    onUpdateAction({
      ...shape,
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: node.rotation(),
      updatedAt: Date.now()
    });
  }, [shape, onUpdateAction]);

  const handleTransformEnd = useCallback(() => {
    console.log(`Ending transform for shape ${id}`);
    setIsTransforming(false);
  }, [id]);

  // Enhanced mouse interaction handlers (from frame tool)
  const handleMouseEnter = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (stage) {
        if (isShapeSelectable()) {
          stage.container().style.cursor = isDragging ? "grabbing" : "grab";
        } else {
          stage.container().style.cursor = "pointer";
        }
      }
      setIsHovered(true);
    },
    [isDragging, isShapeSelectable]
  );

  const handleMouseLeave = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = "default";
    setIsHovered(false);
  }, []);

  // Get common shape props
  const getCommonShapeProps = useCallback(() => {
    const shadowProps = shadow?.enabled ? {
      shadowColor: shadow.color,
      shadowBlur: shadow.blur,
      shadowOffsetX: shadow.offsetX,
      shadowOffsetY: shadow.offsetY,
      shadowOpacity: shadow.opacity,
    } : {};

    return {
      x: 0,
      y: 0,
      width: width,
      height: height,
      rotation: rotation,
      fill: fillEnabled ? fill : undefined,
      fillEnabled: fillEnabled,
      stroke: strokeEnabled ? stroke : undefined,
      strokeEnabled: strokeEnabled,
      strokeWidth: strokeWidth,
      opacity: opacity * fillOpacity * strokeOpacity,
      dash: strokeDasharray,
      lineCap: strokeLineCap,
      lineJoin: strokeLineJoin,
      perfectDrawEnabled: false,
      listening: true,
      draggable: false, // Dragging is handled by the Group
      ...shadowProps,
      onMouseDown: handleMouseDown,
      onClick: handleSelect,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };
  }, [
    width, height, rotation, fill, fillEnabled, stroke, strokeEnabled, 
    strokeWidth, opacity, fillOpacity, strokeOpacity, strokeDasharray, 
    strokeLineCap, strokeLineJoin, shadow, handleMouseDown, handleSelect, 
    handleMouseEnter, handleMouseLeave
  ]);

  // Render specific shape based on type
  const renderShape = useCallback(() => {
    const commonProps = getCommonShapeProps();

    switch (shapeType) {
      case 'rectangle':
        return (
          <Rect
            ref={shapeRef}
            {...commonProps}
            cornerRadius={Array.isArray(cornerRadius) ? cornerRadius : [cornerRadius, cornerRadius, cornerRadius, cornerRadius]}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(width, height) / 2}
            width={undefined}
            height={undefined}
          />
        );

      case 'ellipse':
        return (
          <Ellipse
            {...commonProps}
            radiusX={width / 2}
            radiusY={height / 2}
            width={undefined}
            height={undefined}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            {...commonProps}
            sides={shapeData.sides || 6}
            radius={Math.min(width, height) / 2}
            width={undefined}
            height={undefined}
          />
        );

      case 'star':
        return (
          <Star
            {...commonProps}
            numPoints={shapeData.numPoints || 5}
            innerRadius={shapeData.innerRadius || Math.min(width, height) / 4}
            outerRadius={shapeData.outerRadius || Math.min(width, height) / 2}
            width={undefined}
            height={undefined}
          />
        );

      case 'wedge':
        return (
          <Wedge
            {...commonProps}
            radius={Math.min(width, height) / 2}
            angle={shapeData.angle || 90}
            clockwise={shapeData.clockwise !== false}
            width={undefined}
            height={undefined}
          />
        );

      case 'arc':
        return (
          <Arc
            {...commonProps}
            innerRadius={shapeData.innerRadius || Math.min(width, height) / 4}
            outerRadius={shapeData.outerRadius || Math.min(width, height) / 2}
            angle={shapeData.angle || 90}
            clockwise={shapeData.clockwise !== false}
            width={undefined}
            height={undefined}
          />
        );

      case 'ring':
        return (
          <Ring
            {...commonProps}
            innerRadius={shapeData.innerRadius || Math.min(width, height) / 4}
            outerRadius={shapeData.outerRadius || Math.min(width, height) / 2}
            width={undefined}
            height={undefined}
          />
        );

      case 'line':
        return (
          <Line
            {...commonProps}
            points={shapeData.points || [0, 0, width, height]}
            tension={shapeData.tension || 0}
            closed={shapeData.closed || false}
            width={undefined}
            height={undefined}
            fill={undefined}
            fillEnabled={false}
          />
        );

      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            points={shapeData.points || [0, height / 2, width, height / 2]}
            pointerLength={shapeData.pointerLength || 10}
            pointerWidth={shapeData.pointerWidth || 10}
            pointerAtBeginning={shapeData.pointerAtBeginning || false}
            width={undefined}
            height={undefined}
            fill={stroke}
            fillEnabled={strokeEnabled}
          />
        );

      case 'custom-path':
        return (
          <Path
            {...commonProps}
            data={shapeData.pathData || "M0,0 L100,100"}
            width={undefined}
            height={undefined}
          />
        );

      default:
        return (
          <Rect
            {...commonProps}
            cornerRadius={cornerRadius}
          />
        );
    }
  }, [shapeType, getCommonShapeProps, width, height, cornerRadius, shapeData, stroke, strokeEnabled]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onDeleteAction(id);
          break;
        case 'Escape':
          e.preventDefault();
          onSelectAction('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, id, onDeleteAction, onSelectAction]);

  if (locked && !isSelected) {
    return null;
  }

  // Simplified draggable condition (following frame tool pattern)
  const shouldBeDraggable = isDraggable && draggable && !locked && !isTransforming && isShapeSelectable();

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      draggable={shouldBeDraggable}
      onDragStart={handleDragStart}
      // Visual feedback while dragging
      opacity={isDragging ? 0.9 : 1}
      scaleX={isDragging ? 1.02 : 1}
      scaleY={isDragging ? 1.02 : 1}
      onDragEnd={handleDragEnd}
      onTransformStart={handleTransformStart}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
      name="shape-group"
      listening={true}
    >
      {renderShape()}

      {/* Hover indicator (subtle) */}
      {isHovered && !isSelected && !isDragging && (
        <Rect
          x={-2}
          y={-2}
          width={width + 4}
          height={height + 4}
          cornerRadius={6}
          stroke={draggable ? "#10b981" : "#6366f1"}
          strokeWidth={Math.max(1.5 / scale, 0.75)}
          dash={[Math.max(3 / scale, 1.5), Math.max(3 / scale, 1.5)]}
          opacity={0.6}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}

      {/* Dragging indicator */}
      {isDragging && (
        <>
          <Rect
            x={-6}
            y={-6}
            width={width + 12}
            height={height + 12}
            cornerRadius={8}
            stroke="#3b82f6"
            strokeWidth={Math.max(2 / scale, 1)}
            dash={[Math.max(4 / scale, 2), Math.max(4 / scale, 2)]}
            opacity={0.85}
            listening={false}
            perfectDrawEnabled={false}
          />
          {/* Dragging label */}
          <Rect
            x={width / 2 - 30}
            y={-24}
            width={60}
            height={16}
            fill="#3b82f6"
            cornerRadius={8}
            opacity={0.9}
            listening={false}
            perfectDrawEnabled={false}
          />
          <Text
            x={width / 2 - 28}
            y={-21}
            width={56}
            height={10}
            text="MOVING"
            fontSize={Math.max(10 / scale, 8)}
            fontFamily="'Inter', -apple-system, sans-serif"
            fontStyle="600"
            fill="#ffffff"
            align="center"
            verticalAlign="middle"
            listening={false}
            perfectDrawEnabled={false}
          />
        </>
      )}

      {/* Dimension label while transforming */}
      {isTransforming && (
        <>
          <Rect
            x={width / 2 - Math.max(35 / scale, 25)}
            y={height + Math.max(12 / scale, 8)}
            width={Math.max(70 / scale, 50)}
            height={Math.max(20 / scale, 15)}
            fill="#3b82f6"
            cornerRadius={Math.max(6 / scale, 3)}
            opacity={0.9}
            listening={false}
            perfectDrawEnabled={false}
          />
          <Text
            x={width / 2 - Math.max(32 / scale, 24)}
            y={height + Math.max(15 / scale, 11)}
            text={`${Math.round(width)} × ${Math.round(height)}`}
            fontSize={Math.max(11 / scale, 8)}
            fontFamily="'Inter', monospace"
            fontStyle="600"
            fill="#ffffff"
            listening={false}
            perfectDrawEnabled={false}
          />
        </>
      )}

      {isSelected && (
        <Transformer
          ref={trRef}
          {...getTransformerConfig()}
        />
      )}
    </Group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // Only re-render if these specific props have changed
  return (
    prevProps.shape.id === nextProps.shape.id &&
    prevProps.shape.version === nextProps.shape.version &&
    prevProps.shape.updatedAt === nextProps.shape.updatedAt &&
    JSON.stringify(prevProps.shape.style) === JSON.stringify(nextProps.shape.style) &&
    prevProps.shape.x === nextProps.shape.x &&
    prevProps.shape.y === nextProps.shape.y &&
    prevProps.shape.width === nextProps.shape.width &&
    prevProps.shape.height === nextProps.shape.height &&
    prevProps.shape.rotation === nextProps.shape.rotation &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDraggable === nextProps.isDraggable &&
    prevProps.scale === nextProps.scale &&
    prevProps.currentTool === nextProps.currentTool
  );
});

export default ShapeElement; 