import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Group, Text, Rect, Transformer, Line } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { TextElement as TextElementType } from '@/types';
import Konva from 'konva';

interface TextElementProps {
  textElement: TextElementType;
  isSelected: boolean;
  isEditing: boolean;
  isDraggable: boolean;
  onSelectAction: (textId: string) => void;
  onUpdateAction: (textElement: TextElementType) => void;
  onDeleteAction: (textId: string) => void;
  onStartEditAction: (textId: string) => void;
  onDragStartAction?: () => void;
  onDragEndAction?: () => void;
  scale?: number;
  stageRef?: React.RefObject<Konva.Stage | null>;
}

// Performance optimization: Use RAF for smooth animations
const useRAF = () => {
  const rafRef = useRef<number | null>(null);
  
  const schedule = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(callback);
  }, []);

  const cancel = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { schedule, cancel };
};

// Throttle function for performance
const throttle = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const TextElement: React.FC<TextElementProps> = ({
  textElement,
  isSelected,
  isEditing,
  isDraggable,
  onSelectAction,
  onUpdateAction,
  onDeleteAction,
  onStartEditAction,
  onDragStartAction,
  onDragEndAction,
  scale = 1,
  stageRef,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);
  const backgroundRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  // Performance optimization: Use RAF for smooth updates
  const { schedule: scheduleRAF, cancel: cancelRAF } = useRAF();

  // Optimized state management - reduced state updates
  const [interactionState, setInteractionState] = useState({
    isDragging: false,
    isTransforming: false,
    isHovered: false,
  });
  
  // Local state for smooth interactions - only update when needed
  const [localTransform, setLocalTransform] = useState({
    x: textElement.x,
    y: textElement.y,
    width: textElement.width,
    height: textElement.height,
    rotation: textElement.rotation || 0,
  });

  // Debounce refs for performance
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Memoized text properties - extract and optimize
  const textProperties = useMemo(() => {
    const {
      text,
      formatting: {
        fontFamily = 'Comic Sans MS',
        fontSize = 16,
        color = '#000000',
        bold = false,
        italic = false,
        underline = false,
        strikethrough = false,
        align = 'left',
        lineHeight = 1.2,
        letterSpacing = 0,
        textTransform = 'none',
        highlight = false,
        highlightColor = '#ffeb3b',
      } = {},
      style: {
        backgroundColor,
        backgroundOpacity = 1,
        border,
        shadow,
        opacity = 1,
      } = {},
    } = textElement;

    // Fix font size scaling issue - ensure canvas text matches editor size
    // The editor applies stageScale, so we need to ensure consistency
    const actualFontSize = Math.max(8, fontSize);

    return {
      text,
      fontFamily,
      fontSize: actualFontSize, // Use the actual font size without additional scaling
      color,
      bold,
      italic,
      underline,
      strikethrough,
      align,
      lineHeight,
      letterSpacing,
      textTransform,
      backgroundColor,
      backgroundOpacity,
      border,
      shadow,
      opacity,
      highlight,
      highlightColor,
    };
  }, [textElement]);

  // Memoized computed values
  const computedValues = useMemo(() => {
    const { bold, italic, fontSize, fontFamily, text, textTransform, underline, strikethrough } = textProperties;
    
    // Konva-compatible font properties
    const fontWeight = bold ? 'bold' : 'normal';
    const fontStyle = italic ? 'italic' : 'normal';

    // Display text
    let displayText = text;
    if (!text || text.trim() === '') {
      displayText = 'Click to edit text';
    } else {
      switch (textTransform) {
        case 'uppercase':
          displayText = text.toUpperCase();
          break;
        case 'lowercase':
          displayText = text.toLowerCase();
          break;
        case 'capitalize':
          displayText = text.replace(/\b\w/g, (char: string) => char.toUpperCase());
          break;
      }
    }

    // Text decoration handling (Konva doesn't support textDecoration directly)
    // We'll handle underline and strikethrough with additional shapes if needed
    const hasUnderline = underline;
    const hasStrikethrough = strikethrough;

    return {
      fontWeight,
      fontStyle,
      displayText,
      hasUnderline,
      hasStrikethrough,
      isEmpty: !text || text.trim() === '',
    };
  }, [textProperties]);

  // Memoized styles - only recalculate when properties change
  const styles = useMemo(() => {
    const { backgroundColor, backgroundOpacity, border, shadow } = textProperties;
    
    const backgroundStyle = backgroundColor ? {
      fill: backgroundColor,
      opacity: backgroundOpacity,
    } : { fill: 'transparent', opacity: 0 };

    const borderStyle = border ? {
      stroke: border.color,
      strokeWidth: border.width,
      dash: border.style === 'dashed' ? [5, 5] : border.style === 'dotted' ? [2, 2] : [],
    } : {};

    const shadowStyle = shadow ? {
      shadowColor: shadow.color,
      shadowBlur: shadow.blur,
      shadowOffsetX: shadow.offsetX,
      shadowOffsetY: shadow.offsetY,
      shadowOpacity: shadow.opacity,
    } : {};

    return { backgroundStyle, borderStyle, shadowStyle };
  }, [textProperties]);

  // Handle highlight display and animation
  useEffect(() => {
    const textNode = textRef.current;
    if (!textNode || !textNode.parent) return;

    if (textProperties.highlight) {
      // Create or update highlight rect
      let highlightRect = textNode.parent.findOne('.highlight-rect') as Konva.Rect;
      if (!highlightRect) {
        highlightRect = new Konva.Rect({
          name: 'highlight-rect',
          fill: textProperties.highlightColor,
          opacity: 0,
          listening: false,
        });
        textNode.parent.add(highlightRect);
        highlightRect.moveToBottom();
        textNode.moveToTop();
      }

      highlightRect.setAttrs({
        x: textNode.x(),
        y: textNode.y(),
        width: textNode.width(),
        height: textNode.height(),
        fill: textProperties.highlightColor,
      });

      // Animate highlight in
      new Konva.Tween({
        node: highlightRect,
        opacity: 0.75,
        duration: 0.2,
        easing: Konva.Easings.EaseOut,
      }).play();
    } else {
      // Animate highlight out
      const highlightRect = textNode.parent.findOne('.highlight-rect') as Konva.Rect;
      if (highlightRect) {
        new Konva.Tween({
          node: highlightRect,
          opacity: 0,
          duration: 0.2,
          easing: Konva.Easings.EaseIn,
          onFinish: () => {
            highlightRect.destroy();
          },
        }).play();
      }
    }
  }, [textProperties.highlight, textProperties.highlightColor, computedValues.displayText, localTransform.width, localTransform.height]);

  // Enhanced indicator style with better visual feedback
  const indicatorStyle = useMemo(() => {
    const { isDragging, isTransforming, isHovered } = interactionState;
    
    if (isEditing) {
      return {
        stroke: "#10b981",
        strokeWidth: Math.max(2 / scale, 1),
        fill: "rgba(16, 185, 129, 0.08)",
        dash: [],
        shadowColor: "#10b981",
        shadowBlur: Math.max(4 / scale, 2),
        shadowOpacity: 0.3,
      };
    } else if (isSelected) {
      return {
        stroke: "#3b82f6",
        strokeWidth: Math.max(2 / scale, 1),
        fill: "rgba(59, 130, 246, 0.05)",
        dash: [],
        shadowColor: "#3b82f6",
        shadowBlur: Math.max(3 / scale, 1.5),
        shadowOpacity: 0.2,
      };
    } else if (isHovered && !isDragging && !isTransforming) {
      return {
        stroke: isDraggable ? "#10b981" : "#6366f1",
        strokeWidth: Math.max(1.5 / scale, 0.75),
        fill: isDraggable ? "rgba(16, 185, 129, 0.06)" : "rgba(99, 102, 241, 0.04)",
        dash: [Math.max(3 / scale, 1.5), Math.max(3 / scale, 1.5)],
        shadowColor: isDraggable ? "#10b981" : "#6366f1",
        shadowBlur: Math.max(2 / scale, 1),
        shadowOpacity: 0.15,
      };
    }
    return null;
  }, [isEditing, isSelected, interactionState, scale, isDraggable]);

  // Enhanced transformer configuration with better UX
  const transformerConfig = useMemo(() => {
    const scaleFactor = Math.max(1 / scale, 0.5);
    const minSize = Math.max(30, 60 / scale);
    const anchorSize = Math.max(10 / scale, 6);
    
    return {
      enabledAnchors: [
        'top-left', 'top-right', 'bottom-left', 'bottom-right',
        'middle-left', 'middle-right', 'top-center', 'bottom-center'
      ],
      borderStroke: interactionState.isTransforming ? "#0ea5e9" : "#3b82f6",
      borderStrokeWidth: Math.max(1.5 / scale, 0.75),
      borderDash: [],
      anchorFill: "#ffffff",
      anchorStroke: interactionState.isTransforming ? "#0ea5e9" : "#3b82f6",
      anchorStrokeWidth: Math.max(1.5 / scale, 0.75),
      anchorSize,
      anchorCornerRadius: Math.max(3 / scale, 2),
      keepRatio: false,
      rotateEnabled: true,
      resizeEnabled: true,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270, 315],
      rotationSnapTolerance: 8,
      centeredScaling: false,
      ignoreStroke: true,
      padding: Math.max(5 / scale, 3),
      boundBoxFunc: (oldBox: any, newBox: any) => {
        // Enhanced size constraints
        if (newBox.width < minSize || newBox.height < minSize) {
          return oldBox;
        }
        // Prevent too large sizes
        if (newBox.width > 3000 || newBox.height > 2000) {
          return oldBox;
        }
        return newBox;
      },
      // Enhanced performance optimizations
      hitGraphEnabled: false,
      perfectDrawEnabled: false,
      listening: true,
      shouldOverdrawWholeArea: false,
    };
  }, [scale, interactionState.isTransforming]);

  // Throttled update function for better performance
  const throttledUpdate = useMemo(() => {
    return throttle((updates: Partial<TextElementType>) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // ~60fps limit
      
      lastUpdateRef.current = now;
      
      const updatedElement: TextElementType = {
        ...textElement,
        ...updates,
        updatedAt: now,
        version: textElement.version + 1,
      };
      
      onUpdateAction(updatedElement);
    }, 16);
  }, [textElement, onUpdateAction]);

  // Enhanced event handlers with better interaction detection
  const handleDoubleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Immediately stop propagation to prevent other handlers from interfering
    e.cancelBubble = true;
    e.evt?.stopPropagation();
    e.evt?.stopImmediatePropagation();
    
    // Ensure we can start editing
    if (!isEditing && !interactionState.isDragging && !interactionState.isTransforming) {
      // First select the element, then start editing
      onSelectAction(textElement.id);
      
      // Small delay to ensure selection state is updated
      setTimeout(() => {
        onStartEditAction(textElement.id);
      }, 10);
    }
  }, [onStartEditAction, onSelectAction, textElement.id, isEditing, interactionState]);

  const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Immediately stop propagation to prevent other handlers from interfering
    e.cancelBubble = true;
    e.evt?.stopPropagation();
    e.evt?.stopImmediatePropagation();
    
    if (!isEditing && !interactionState.isDragging && !interactionState.isTransforming) {
      // Immediately call selection to prevent race conditions
      onSelectAction(textElement.id);
    }
  }, [onSelectAction, textElement.id, isEditing, interactionState]);

  const handleMouseEnter = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isEditing && !interactionState.isDragging && !interactionState.isTransforming) {
      setInteractionState(prev => ({ ...prev, isHovered: true }));
      const stage = e.target.getStage();
      if (stage) {
        // Show move cursor when draggable, regardless of selection state
        if (isDraggable) {
          stage.container().style.cursor = 'move';
        } else {
          stage.container().style.cursor = 'pointer';
        }
      }
    }
  }, [isEditing, isDraggable, interactionState]);

  const handleMouseLeave = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!interactionState.isDragging && !interactionState.isTransforming) {
      setInteractionState(prev => ({ ...prev, isHovered: false }));
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'default';
      }
    }
  }, [interactionState]);

  // Optimized drag handlers
  const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setInteractionState(prev => ({ ...prev, isDragging: true }));
    
    // Auto-select the text element when dragging starts
    if (!isSelected) {
      onSelectAction(textElement.id);
    }
    
    onDragStartAction?.();
  }, [onDragStartAction, isSelected, onSelectAction, textElement.id]);

  const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Update local state immediately for smooth dragging
    setLocalTransform(prev => ({ ...prev, x: newX, y: newY }));
    
    // Use RAF for smooth updates
    scheduleRAF(() => {
      throttledUpdate({ x: newX, y: newY });
    });
  }, [scheduleRAF, throttledUpdate]);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setInteractionState(prev => ({ ...prev, isDragging: false }));
    
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Final update
    setLocalTransform(prev => ({ ...prev, x: newX, y: newY }));
    
    // Clear any pending updates and do final update
    cancelRAF();
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    const updatedElement: TextElementType = {
      ...textElement,
      x: newX,
      y: newY,
      updatedAt: Date.now(),
      version: textElement.version + 1,
    };
    
    onUpdateAction(updatedElement);
    onDragEndAction?.();
  }, [textElement, onUpdateAction, onDragEndAction, cancelRAF]);

  // Optimized transform handlers
  const handleTransformStart = useCallback(() => {
    setInteractionState(prev => ({ ...prev, isTransforming: true }));
  }, []);

  const handleTransform = useCallback(() => {
    const groupNode = groupRef.current;
    if (!groupNode) return;

    const scaleX = groupNode.scaleX();
    const scaleY = groupNode.scaleY();
    const rotation = groupNode.rotation();
    const x = groupNode.x();
    const y = groupNode.y();
    
    // Calculate new dimensions
    const newWidth = Math.max(50, textElement.width * scaleX);
    const newHeight = Math.max(20, textElement.height * scaleY);
    
    // Update local state immediately for smooth transformation
    setLocalTransform({
      x,
      y,
      width: newWidth,
      height: newHeight,
      rotation,
    });

    // Use RAF for smooth updates during transform
    scheduleRAF(() => {
      // Reset scale for consistent behavior
      groupNode.scaleX(1);
      groupNode.scaleY(1);
      
      throttledUpdate({
        x,
        y,
        width: newWidth,
        height: newHeight,
        rotation,
      });
    });
  }, [textElement, scheduleRAF, throttledUpdate]);

  const handleTransformEnd = useCallback(() => {
    setInteractionState(prev => ({ ...prev, isTransforming: false }));
    
    const groupNode = groupRef.current;
    if (!groupNode) return;

    const scaleX = groupNode.scaleX();
    const scaleY = groupNode.scaleY();
    const rotation = groupNode.rotation();
    const x = groupNode.x();
    const y = groupNode.y();
    
    // Calculate final dimensions
    const newWidth = Math.max(50, textElement.width * scaleX);
    const newHeight = Math.max(20, textElement.height * scaleY);
    
    // Reset scale
    groupNode.scaleX(1);
    groupNode.scaleY(1);
    
    // Update local state
    setLocalTransform({
      x,
      y,
      width: newWidth,
      height: newHeight,
      rotation,
    });
    
    // Clear any pending updates and do final update
    cancelRAF();
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    const updatedElement: TextElementType = {
      ...textElement,
      x,
      y,
      width: newWidth,
      height: newHeight,
      rotation,
      updatedAt: Date.now(),
      version: textElement.version + 1,
    };
    
    onUpdateAction(updatedElement);
  }, [textElement, onUpdateAction, cancelRAF]);

  // Update transformer when selection changes
  useEffect(() => {
    if (isSelected && !isEditing && transformerRef.current && groupRef.current) {
      const timer = setTimeout(() => {
        if (transformerRef.current && groupRef.current) {
          transformerRef.current.nodes([groupRef.current]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }, 0);
      return () => clearTimeout(timer);
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [isSelected, isEditing]);

  // Sync local state with props when not interacting
  useEffect(() => {
    if (!interactionState.isDragging && !interactionState.isTransforming) {
      setLocalTransform({
        x: textElement.x,
        y: textElement.y,
        width: textElement.width,
        height: textElement.height,
        rotation: textElement.rotation || 0,
      });
    }
  }, [
    textElement.x,
    textElement.y,
    textElement.width,
    textElement.height,
    textElement.rotation,
    interactionState.isDragging,
    interactionState.isTransforming,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRAF();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [cancelRAF]);

  // Use local state for smooth interactions, fallback to props
  const currentTransform = (interactionState.isDragging || interactionState.isTransforming) 
    ? localTransform 
    : {
        x: textElement.x,
        y: textElement.y,
        width: textElement.width,
        height: textElement.height,
        rotation: textElement.rotation || 0,
      };

  return (
    <>
      <Group
        ref={groupRef}
        name="text-element"
        x={currentTransform.x}
        y={currentTransform.y}
        width={currentTransform.width}
        height={currentTransform.height}
        rotation={currentTransform.rotation}
        draggable={isDraggable && !isEditing}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        listening={true}
        perfectDrawEnabled={false}
        opacity={interactionState.isDragging ? 0.8 : 1}
        scaleX={interactionState.isDragging ? 1.02 : 1}
        scaleY={interactionState.isDragging ? 1.02 : 1}
      >
        {/* Invisible hit area for click detection - Enhanced for better reliability */}
        <Rect
          x={-2}
          y={-2}
          width={currentTransform.width + 4}
          height={currentTransform.height + 4}
          fill="transparent"
          listening={true}
          perfectDrawEnabled={false}
          onClick={handleClick}
          onTap={handleClick}
          onDblClick={handleDoubleClick}
        />

        {/* Background */}
        {(textProperties.backgroundColor || textProperties.border || indicatorStyle) && (
          <Rect
            ref={backgroundRef}
            x={0}
            y={0}
            width={currentTransform.width}
            height={currentTransform.height}
            cornerRadius={textProperties.border?.radius || 4}
            {...styles.backgroundStyle}
            {...styles.borderStyle}
            {...styles.shadowStyle}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {/* Text */}
        <Text
          ref={textRef}
          x={8}
          y={8}
          width={currentTransform.width - 16}
          height={currentTransform.height - 16}
          text={computedValues.displayText}
          fontFamily={textProperties.fontFamily}
          fontSize={textProperties.fontSize}
          fontStyle={computedValues.fontStyle}
          fontWeight={computedValues.fontWeight}
          fill={computedValues.isEmpty ? '#9ca3af' : textProperties.color}
          align={textProperties.align}
          verticalAlign="top"
          lineHeight={textProperties.lineHeight}
          letterSpacing={textProperties.letterSpacing}
          wrap="word"
          ellipsis={false}
          listening={false}
          perfectDrawEnabled={false}
        />
        
        {/* Underline decoration */}
        {computedValues.hasUnderline && !computedValues.isEmpty && (
          <Line
            points={[8, currentTransform.height - 8, currentTransform.width - 8, currentTransform.height - 8]}
            stroke={textProperties.color}
            strokeWidth={Math.max(1, textProperties.fontSize / 16)}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}
        
        {/* Strikethrough decoration */}
        {computedValues.hasStrikethrough && !computedValues.isEmpty && (
          <Line
            points={[8, currentTransform.height / 2, currentTransform.width - 8, currentTransform.height / 2]}
            stroke={textProperties.color}
            strokeWidth={Math.max(1, textProperties.fontSize / 16)}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {/* Selection/Hover/Editing indicator */}
        {indicatorStyle && (
          <Rect
            x={-2}
            y={-2}
            width={currentTransform.width + 4}
            height={currentTransform.height + 4}
            cornerRadius={6}
            {...indicatorStyle}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {/* Selection handles for better visual feedback */}
        {isSelected && !isEditing && (
          <>
            {/* Corner handles */}
            {[
              { x: -4, y: -4 },
              { x: currentTransform.width, y: -4 },
              { x: -4, y: currentTransform.height },
              { x: currentTransform.width, y: currentTransform.height },
            ].map((pos, index) => (
              <Rect
                key={index}
                x={pos.x}
                y={pos.y}
                width={Math.max(8 / scale, 4)}
                height={Math.max(8 / scale, 4)}
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={Math.max(1 / scale, 0.5)}
                cornerRadius={Math.max(2 / scale, 1)}
                listening={false}
                perfectDrawEnabled={false}
              />
            ))}
          </>
        )}

        {/* Dragging state indicator */}
        {interactionState.isDragging && (
          <>
            {/* Dragging border */}
            <Rect
              x={-6}
              y={-6}
              width={currentTransform.width + 12}
              height={currentTransform.height + 12}
              stroke="#3b82f6"
              strokeWidth={Math.max(2 / scale, 1)}
              cornerRadius={8}
              dash={[Math.max(4 / scale, 2), Math.max(4 / scale, 2)]}
              opacity={0.8}
              listening={false}
              perfectDrawEnabled={false}
            />
            
            {/* Dragging label */}
            <Rect
              x={currentTransform.width / 2 - 30}
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
              x={currentTransform.width / 2 - 28}
              y={-21}
              width={56}
              height={10}
              text="MOVING"
              fontSize={Math.max(10 / scale, 8)}
              fontFamily="'Inter', -apple-system, sans-serif"
              fontWeight="600"
              fill="white"
              align="center"
              verticalAlign="middle"
              listening={false}
              perfectDrawEnabled={false}
            />
          </>
        )}
      </Group>

      {/* Transformer for selected text */}
      {isSelected && !isEditing && (
        <Transformer
          ref={transformerRef}
          {...transformerConfig}
        />
      )}
    </>
  );
};

export default TextElement; 