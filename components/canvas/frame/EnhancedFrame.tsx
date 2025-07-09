import React, { useRef, useState, useEffect, useCallback } from "react";
import { Rect, Transformer, Group, Text, Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { FrameElement } from "@/types";
import type Konva from "konva";

interface EnhancedFrameProps {
  frame: FrameElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelectAction: (frameId: string, e?: KonvaEventObject<MouseEvent>) => void;
  onUpdateAction: (frame: FrameElement) => void;
  onDeleteAction: (frameId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  scale?: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
  children?: React.ReactNode;
  currentTool?: string;
}

const EnhancedFrame: React.FC<EnhancedFrameProps> = ({
  frame,
  isSelected,
  isDraggable,
  onSelectAction,
  onUpdateAction,
  onDeleteAction,
  onDragStart,
  onDragEnd,
  scale = 1,
  children,
  currentTool = "select",
}) => {
  const frameRef = useRef<Konva.Rect>(null);
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
  const [transformStartTime, setTransformStartTime] = useState<number>(0);

  // Get frame properties with fallbacks
  const { id, x, y, width, height, name, style } = frame;

  const {
    fill = "rgba(255, 255, 255, 0.9)",
    stroke = "#3b82f6",
    strokeWidth = 2,
    strokeDasharray,
    cornerRadius = 0,
    shadow,
    fillOpacity = 1,
  } = style;

  // Improved tool checking with memoization
  const isFrameSelectable = useCallback(() => {
    const selectableTools = ["select", "frame", "move", "cursor", "pointer"];
    return selectableTools.includes(currentTool);
  }, [currentTool]);

  // Enhanced dash array logic with performance optimization
  const getDashArray = useCallback(() => {
    if (strokeDasharray && Array.isArray(strokeDasharray)) {
      return strokeDasharray.map((d) => Math.max(d / scale, 0.5));
    }

    // Optimized dash arrays based on frame type
    const scaleFactor = Math.max(1 / scale, 0.5);
    switch (frame.frameType) {
      case "workflow":
        return [10 * scaleFactor, 5 * scaleFactor];
      case "organization":
        return [5 * scaleFactor, 5 * scaleFactor];
      case "collaboration":
        return [2 * scaleFactor, 2 * scaleFactor];
      default:
        return [];
    }
  }, [strokeDasharray, scale, frame.frameType]);

  // Enhanced transformer configuration with better performance
  const getTransformerConfig = useCallback(() => {
    const scaleFactor = Math.max(1 / scale, 0.5);
    const minSize = Math.max(20, 50 / scale);
    const maxSize = Math.min(5000 / scale, 5000);

    return {
      boundBoxFunc: (oldBox: any, newBox: any) => {
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
      enabledAnchors: [
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      anchorFill: "#FFFFFF",
      anchorStroke: isTransforming ? "#0096FF" : "#667eea",
      anchorStrokeWidth: Math.max(2 / scale, 1),
      anchorSize: Math.max(8 / scale, 6),
      borderStroke: isTransforming ? "#0096FF" : "#667eea",
      borderStrokeWidth: Math.max(1.5 / scale, 1),
      borderDash: [4 * scaleFactor, 4 * scaleFactor],
      keepRatio: false,
      centeredScaling: false,
      flipEnabled: false,
      ignoreStroke: true, // Better performance
    };
  }, [scale, isTransforming]);

  // Optimized transformer attachment
  useEffect(() => {
    if (isSelected && trRef.current && frameRef.current) {
      // Debounce transformer updates for better performance
      const timer = setTimeout(() => {
        if (trRef.current && frameRef.current) {
          trRef.current.nodes([frameRef.current]);
          trRef.current.getLayer()?.batchDraw();
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  // Enhanced selection handler with improved reliability
  const handleSelect = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      if (isDragging || isTransforming) return;
      if (!isFrameSelectable()) return;

      const clickDuration = Date.now() - clickStartTime;
      if (clickDuration > 300) return; // Prevent selection after long press/drag

      onSelectAction(id, e);
    },
    [
      id,
      isDragging,
      isTransforming,
      onSelectAction,
      isFrameSelectable,
      clickStartTime,
    ]
  );

  // Enhanced mouse down handler with debouncing
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      e.evt.stopPropagation();

      setClickStartTime(Date.now());

      if (isFrameSelectable() && !isDragging && !isTransforming) {
        onSelectAction(id, e);
      }
    },
    [id, isDragging, isTransforming, onSelectAction, isFrameSelectable]
  );

  // Enhanced drag handlers with better performance
  const handleDragStart = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      setIsDragging(true);
      setDragStartPos({ x, y });

      if (isFrameSelectable() && !isSelected) {
        onSelectAction(id);
      }

      // Store initial position for undo/redo
      e.target.setAttr("initialProps", { x, y, width, height });

      // Optimize rendering during drag
      if (groupRef.current) {
        groupRef.current.moveToTop();
        groupRef.current.cache(); // Cache for better performance
      }

      if (onDragStart) {
        onDragStart();
      }
    },
    [
      x,
      y,
      width,
      height,
      onDragStart,
      id,
      isSelected,
      onSelectAction,
      isFrameSelectable,
    ]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      setIsDragging(false);

      const node = e.target;
      const newX = Math.round(node.x());
      const newY = Math.round(node.y());

      // Clear cache after drag
      if (groupRef.current) {
        groupRef.current.clearCache();
      }

      // Debounced update to prevent excessive updates
      if (
        dragStartPos &&
        (Math.abs(newX - dragStartPos.x) > 1 ||
          Math.abs(newY - dragStartPos.y) > 1)
      ) {
        const updatedFrame: FrameElement = {
          ...frame,
          x: newX,
          y: newY,
          updatedAt: Date.now(),
          version: frame.version + 1,
        };

        // Throttle updates during rapid movements
        setTimeout(() => {
          onUpdateAction(updatedFrame);
        }, 50);
      }

      setDragStartPos(null);

      if (onDragEnd) {
        onDragEnd();
      }
    },
    [frame, dragStartPos, onUpdateAction, onDragEnd]
  );

  // Enhanced transform handlers with throttling
  const handleTransformStart = useCallback(() => {
    setIsTransforming(true);
    setTransformStartTime(Date.now());
  }, []);

  const handleTransform = useCallback(() => {
    // Throttle transform updates for better performance
    const now = Date.now();
    if (now - transformStartTime < 16) return; // ~60fps

    if (frameRef.current) {
      const node = frameRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      const newWidth = Math.round(node.width() * scaleX);
      const newHeight = Math.round(node.height() * scaleY);

      // Optional: Real-time feedback without updating the actual frame
      console.log(`Transforming: ${newWidth}x${newHeight}`);
    }
  }, [transformStartTime]);

  const handleTransformEnd = useCallback(() => {
    setIsTransforming(false);

    const node = frameRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale for crisp rendering
    node.scaleX(1);
    node.scaleY(1);

    const newX = Math.round(node.x());
    const newY = Math.round(node.y());
    const newWidth = Math.max(20, Math.round(node.width() * scaleX));
    const newHeight = Math.max(20, Math.round(node.height() * scaleY));

    // Only update if there's a significant change
    const threshold = 2;
    if (
      Math.abs(newX - x) > threshold ||
      Math.abs(newY - y) > threshold ||
      Math.abs(newWidth - width) > threshold ||
      Math.abs(newHeight - height) > threshold
    ) {
      const updatedFrame: FrameElement = {
        ...frame,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        updatedAt: Date.now(),
        version: frame.version + 1,
      };

      onUpdateAction(updatedFrame);
    }
  }, [frame, x, y, width, height, onUpdateAction]);

  // Enhanced keyboard shortcuts with better handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || !document.hasFocus()) return;

      // Check if user is currently editing text in any input/textarea
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          document.activeElement.getAttribute("contenteditable") === "true" ||
          document.activeElement.hasAttribute("data-rename-input"))
      ) {
        // Don't interfere with text editing
        return;
      }

      // Prevent default only for our shortcuts
      const ourKeys = [
        "Delete",
        "Backspace",
        "d",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ];
      const isOurKey = ourKeys.some(
        (key) => e.key === key || (e.key === "d" && (e.ctrlKey || e.metaKey))
      );

      if (!isOurKey) return;

      // Delete frame - Don't directly delete here to avoid conflicts with toolbar confirmation
      // Let the FloatingFrameToolbar handle deletion with confirmation
      if (
        e.key === "Delete" ||
        (e.key === "Backspace" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        // Don't call onDeleteAction directly - let the toolbar handle it with confirmation
        return;
      }

      // Duplicate frame
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const duplicatedFrame: FrameElement = {
          ...frame,
          id: `frame-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`,
          x: x + 20,
          y: y + 20,
          name: `${name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1,
        };
        onUpdateAction(duplicatedFrame);
        return;
      }

      // Move frame with arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let newX = x;
        let newY = y;

        switch (e.key) {
          case "ArrowUp":
            newY -= step;
            break;
          case "ArrowDown":
            newY += step;
            break;
          case "ArrowLeft":
            newX -= step;
            break;
          case "ArrowRight":
            newX += step;
            break;
        }

        const updatedFrame: FrameElement = {
          ...frame,
          x: newX,
          y: newY,
          updatedAt: Date.now(),
          version: frame.version + 1,
        };

        onUpdateAction(updatedFrame);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [id, isSelected, onDeleteAction, frame, x, y, name, onUpdateAction]);

  // Enhanced mouse interaction handlers
  const handleMouseEnter = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (stage) {
        if (isFrameSelectable()) {
          stage.container().style.cursor = isDragging ? "grabbing" : "grab";
        } else {
          stage.container().style.cursor = "pointer";
        }
      }
      setIsHovered(true);
    },
    [isDragging, isFrameSelectable]
  );

  const handleMouseLeave = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = "default";
    setIsHovered(false);
  }, []);

  // Context menu handler
  const handleContextMenu = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.evt.preventDefault();
      e.cancelBubble = true;

      if (isFrameSelectable()) {
        onSelectAction(id, e);
      }
    },
    [id, onSelectAction, isFrameSelectable]
  );

  // Optimized frame styling
  const getFrameStyle = useCallback(() => {
    let frameStroke = stroke;
    let frameStrokeWidth = Math.max(strokeWidth / scale, 0.5);
    let frameOpacity = fillOpacity;
    let frameFill = fill;

    if (isSelected) {
      frameStroke = "#0096FF";
      frameStrokeWidth = Math.max((strokeWidth * 1.5) / scale, 2 / scale);
    } else if (isHovered) {
      frameStroke = "#667eea";
      frameOpacity = Math.min(fillOpacity * 1.05, 1);
    }

    if (isDragging) {
      frameOpacity = 0.7;
    }

    return {
      stroke: frameStroke,
      strokeWidth: frameStrokeWidth,
      opacity: frameOpacity,
      fill: frameFill,
    };
  }, [
    stroke,
    strokeWidth,
    scale,
    fillOpacity,
    fill,
    isSelected,
    isHovered,
    isDragging,
  ]);

  // Optimized shadow props
  const getShadowProps = useCallback(() => {
    if (!shadow) return {};

    const scaleFactor = Math.max(1 / scale, 0.5);
    return {
      shadowColor: shadow.color,
      shadowBlur: Math.max(shadow.blur * scaleFactor, 1),
      shadowOffsetX: shadow.offsetX * scaleFactor,
      shadowOffsetY: shadow.offsetY * scaleFactor,
      shadowOpacity: shadow.opacity,
    };
  }, [shadow, scale]);

  const frameStyle = getFrameStyle();
  const shadowProps = getShadowProps();
  const dashArray = getDashArray();

  // Enhanced hit area calculation
  const getHitArea = useCallback(() => {
    const padding = Math.max(10, 20 / scale);
    return {
      x: x - padding,
      y: y - padding,
      width: width + padding * 2,
      height: height + padding * 2,
    };
  }, [x, y, width, height, scale]);

  const hitArea = getHitArea();

  return (
    <>
      <Group ref={groupRef} listening={true}>
        {/* Invisible hit area for better selection */}
        <Rect
          x={hitArea.x}
          y={hitArea.y}
          width={hitArea.width}
          height={hitArea.height}
          fill="transparent"
          name={`frame-hit-area-${id}`}
          onClick={handleSelect}
          onTap={handleSelect}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          listening={true}
          perfectDrawEnabled={false}
        />

        {/* Main frame rectangle */}
        <Rect
          ref={frameRef}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={frameStyle.fill}
          stroke={frameStyle.stroke}
          strokeWidth={frameStyle.strokeWidth}
          dash={dashArray}
          cornerRadius={
            typeof cornerRadius === "number"
              ? Math.max(cornerRadius / scale, 0)
              : 0
          }
          opacity={frameStyle.opacity}
          draggable={isDraggable && !isTransforming && isFrameSelectable()}
          name={`frame-${id}`}
          {...shadowProps}
          onClick={handleSelect}
          onTap={handleSelect}
          onMouseDown={handleMouseDown}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          perfectDrawEnabled={false}
          listening={true}
        />

        {/* Frame content with clipping */}
        {children && (
          <Group clipX={x} clipY={y} clipWidth={width} clipHeight={height}>
            {children}
          </Group>
        )}

        {/* Enhanced selection indicator */}
        {isSelected && (
          <Rect
            x={x - 3 / scale}
            y={y - 3 / scale}
            width={width + 6 / scale}
            height={height + 6 / scale}
            stroke="#0096FF"
            strokeWidth={Math.max(2 / scale, 1)}
            dash={[8 / scale, 4 / scale]}
            opacity={0.8}
            listening={false}
            perfectDrawEnabled={false}
            shadowColor="#0096FF"
            shadowBlur={Math.max(8 / scale, 2)}
            shadowOpacity={0.3}
          />
        )}

        {/* Enhanced hover indicator */}
        {isHovered && !isSelected && isFrameSelectable() && (
          <Rect
            x={x - 2 / scale}
            y={y - 2 / scale}
            width={width + 4 / scale}
            height={height + 4 / scale}
            stroke="#667eea"
            strokeWidth={Math.max(1.5 / scale, 0.5)}
            dash={[6 / scale, 3 / scale]}
            opacity={0.6}
            listening={false}
            perfectDrawEnabled={false}
            shadowColor="#667eea"
            shadowBlur={Math.max(4 / scale, 1)}
            shadowOpacity={0.2}
          />
        )}

        {/* Frame name label with enhanced styling */}
        {(isHovered || isSelected) && (
          <Group listening={false}>
            <Rect
              x={x}
              y={y - Math.max(28 / scale, 20)}
              width={Math.max((name.length * 8 + 20) / scale, 80 / scale)}
              height={Math.max(22 / scale, 16)}
              fill={isSelected ? "#0096FF" : "#1e293b"}
              cornerRadius={Math.max(6 / scale, 3)}
              opacity={0.95}
              listening={false}
              shadowColor={isSelected ? "#0096FF" : "#1e293b"}
              shadowBlur={Math.max(4 / scale, 2)}
              shadowOpacity={0.3}
            />
            <Text
              text={name}
              x={x + Math.max(8 / scale, 4)}
              y={y - Math.max(24 / scale, 18)}
              fontSize={Math.max(12 / scale, 8)}
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              fontStyle="600"
              fill="#ffffff"
              listening={false}
              perfectDrawEnabled={false}
            />
          </Group>
        )}

        {/* Frame type indicator */}
        {frame.frameType !== "basic" && (isSelected || isHovered) && (
          <Group listening={false}>
            <Circle
              x={x + width - Math.max(12 / scale, 8)}
              y={y + Math.max(12 / scale, 8)}
              radius={Math.max(8 / scale, 4)}
              fill="#667eea"
              opacity={0.9}
              listening={false}
              shadowColor="#667eea"
              shadowBlur={Math.max(4 / scale, 2)}
              shadowOpacity={0.3}
            />
            <Text
              text={frame.frameType.charAt(0).toUpperCase()}
              x={x + width - Math.max(15 / scale, 10)}
              y={y + Math.max(8 / scale, 6)}
              fontSize={Math.max(9 / scale, 6)}
              fontFamily="'Inter', -apple-system, sans-serif"
              fontStyle="bold"
              fill="#ffffff"
              listening={false}
              perfectDrawEnabled={false}
            />
          </Group>
        )}

        {/* Dimensions display when transforming */}
        {isTransforming && (
          <Group listening={false}>
            <Rect
              x={x + width / 2 - Math.max(35 / scale, 25)}
              y={y + height + Math.max(15 / scale, 10)}
              width={Math.max(70 / scale, 50)}
              height={Math.max(20 / scale, 15)}
              fill="#0096FF"
              cornerRadius={Math.max(6 / scale, 3)}
              opacity={0.9}
              listening={false}
              shadowColor="#0096FF"
              shadowBlur={Math.max(6 / scale, 3)}
              shadowOpacity={0.3}
            />
            <Text
              text={`${Math.round(width)} × ${Math.round(height)}`}
              x={x + width / 2 - Math.max(32 / scale, 24)}
              y={y + height + Math.max(18 / scale, 13)}
              fontSize={Math.max(11 / scale, 8)}
              fontFamily="'Inter', monospace"
              fontStyle="600"
              fill="#ffffff"
              listening={false}
              perfectDrawEnabled={false}
            />
          </Group>
        )}
      </Group>

      {/* Enhanced Transformer */}
      {isSelected && !isDragging && (
        <Transformer
          ref={trRef}
          {...getTransformerConfig()}
          onTransformStart={handleTransformStart}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          // Enhanced anchor styling
          anchorStyleFunc={(anchor) => {
            const scaleFactor = Math.max(1 / scale, 0.5);
            anchor.cornerRadius(4 * scaleFactor);
            anchor.fill("#FFFFFF");
            anchor.stroke(isTransforming ? "#0096FF" : "#667eea");
            anchor.strokeWidth(2 * scaleFactor);

            // Size based on anchor type
            if (
              anchor.hasName("middle-right") ||
              anchor.hasName("middle-left") ||
              anchor.hasName("top-center") ||
              anchor.hasName("bottom-center")
            ) {
              anchor.width(12 * scaleFactor);
              anchor.height(6 * scaleFactor);
              anchor.offsetX(6 * scaleFactor);
              anchor.offsetY(3 * scaleFactor);
            } else if (
              anchor.hasName("top-left") ||
              anchor.hasName("top-right") ||
              anchor.hasName("bottom-left") ||
              anchor.hasName("bottom-right")
            ) {
              anchor.cornerRadius(50);
              anchor.width(8 * scaleFactor);
              anchor.height(8 * scaleFactor);
              anchor.offsetX(4 * scaleFactor);
              anchor.offsetY(4 * scaleFactor);
            }

            // Enhanced hover effects
            anchor.on("mouseenter", () => {
              anchor.fill(isTransforming ? "#0096FF" : "#667eea");
              anchor.scaleX(1.2);
              anchor.scaleY(1.2);
              anchor.getLayer()?.batchDraw();
            });

            anchor.on("mouseleave", () => {
              anchor.fill("#FFFFFF");
              anchor.scaleX(1);
              anchor.scaleY(1);
              anchor.getLayer()?.batchDraw();
            });
          }}
        />
      )}
    </>
  );
};

export default EnhancedFrame;
