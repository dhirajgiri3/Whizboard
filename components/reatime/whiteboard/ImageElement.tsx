"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Image as KonvaImage, Group, Rect, Circle, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { ImageElement } from '@/types';

interface ImageElementProps {
  imageElement: ImageElement;
  isSelected: boolean;
  isDraggable: boolean;
  onSelectAction: (id: string) => void;
  onUpdateAction: (id: string, updates: Partial<ImageElement>) => void;
  onDeleteAction: (id: string) => void;
  onDuplicateAction?: (imageElement: ImageElement) => void;
  onDownloadAction?: (imageElement: ImageElement) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  scale?: number;
  stageRef?: React.RefObject<any>;
  currentTool?: string;
}

const ImageElementComponent: React.FC<ImageElementProps> = ({
  imageElement,
  isSelected,
  isDraggable,
  onSelectAction,
  onUpdateAction,
  onDeleteAction,
  onDuplicateAction,
  onDownloadAction,
  onDragStart,
  onDragEnd,
  scale = 1,
  stageRef,
  currentTool,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const groupRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const imageRef = useRef<any>(null);

  // Load image when src changes
  useEffect(() => {
    if (imageElement.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImage(img);
        // Update natural dimensions if not set
        if (!imageElement.naturalWidth || !imageElement.naturalHeight) {
          onUpdateAction(imageElement.id, {
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            width: imageElement.width || img.naturalWidth,
            height: imageElement.height || img.naturalHeight,
          });
        }
      };
      img.onerror = () => {
        console.error('Failed to load image:', imageElement.src);
        // Create a placeholder image
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, 200, 150);
          ctx.fillStyle = '#9ca3af';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Image failed to load', 100, 75);
        }
        const placeholderImg = new window.Image();
        placeholderImg.onload = () => setImage(placeholderImg);
        placeholderImg.src = canvas.toDataURL();
      };
      img.src = imageElement.src;
    }
  }, [imageElement.src, imageElement.id, onUpdateAction]);

  // Update transformer when selection changes
  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelectAction(imageElement.id);
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    onDragStart();
    if (!isSelected) {
      onSelectAction(imageElement.id);
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    onDragEnd();
    const target = e.target;
    onUpdateAction(imageElement.id, {
      x: target.x(),
      y: target.y(),
    });
  };

  const handleTransform = (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    // Update the image element with new dimensions and rotation
    onUpdateAction(imageElement.id, {
      width: Math.max(50, node.width() * scaleX), // Minimum width of 50px
      height: Math.max(50, node.height() * scaleY), // Minimum height of 50px
      rotation: rotation,
    });

    // Reset scale to 1 to prevent cumulative scaling
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleTransformEnd = () => {
    setIsResizing(false);
    setIsRotating(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (stageRef?.current && !isSelected) {
      stageRef.current.container().style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (stageRef?.current && !isSelected) {
      stageRef.current.container().style.cursor = 'default';
    }
  };

  const handleMouseDown = () => {
    if (stageRef?.current && !isSelected) {
      stageRef.current.container().style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = () => {
    if (stageRef?.current && !isSelected) {
      stageRef.current.container().style.cursor = 'grab';
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isSelected) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteAction(imageElement.id);
      } else if (e.key === 'Escape') {
        onSelectAction('');
      }
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSelected, imageElement.id]);

  if (!image) {
    return null;
  }

  const width = imageElement.width || image.naturalWidth;
  const height = imageElement.height || image.naturalHeight;

  return (
    <Group
      ref={groupRef}
      x={imageElement.x}
      y={imageElement.y}
      draggable={isDraggable && !isResizing && !isRotating}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Main image */}
      <KonvaImage
        ref={imageRef}
        image={image}
        width={width}
        height={height}
        opacity={imageElement.opacity || 1}
        rotation={imageElement.rotation || 0}
        scaleX={imageElement.scaleX || 1}
        scaleY={imageElement.scaleY || 1}
        cornerRadius={isHovered || isSelected ? 4 : 0}
        shadowColor={isSelected ? "#3b82f6" : "black"}
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={isSelected ? 0.3 : 0}
        shadowOffset={isSelected ? { x: 2, y: 2 } : { x: 0, y: 0 }}
        // Enable hit detection for better interaction
        listening={true}
        // Add filters for better visual effects
        filters={isSelected ? [Konva.Filters.Brighten] : []}
        brightness={isSelected ? 0.1 : 0}
        // Enable caching for better performance
        cache={true}
      />

      {/* Transformer for resizing and rotating */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to prevent too small images
            const minWidth = 50;
            const minHeight = 50;
            const maxWidth = 2000;
            const maxHeight = 2000;

            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            if (newBox.width > maxWidth || newBox.height > maxHeight) {
              return oldBox;
            }
            return newBox;
          }}
          onTransform={handleTransform}
          onTransformEnd={handleTransformEnd}
          // Enable rotation
          rotateEnabled={true}
          // Enable resizing
          resizeEnabled={true}
          // Keep aspect ratio with Shift key
          keepRatio={false}
          // Anchor points for resizing
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#3b82f6"
          anchorStrokeWidth={2}
          anchorFill="#ffffff"
          // Rotation handle
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={15}
          // Border for selection
          borderStroke="#3b82f6"
          borderStrokeWidth={2}
          borderDash={[4, 4]}
          // Padding for better visual feedback
          padding={4}
        />
      )}

      {/* Delete button when selected */}
      {isSelected && (
        <Circle
          x={width + 10}
          y={-10}
          radius={12}
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth={2}
          onClick={(e) => {
            e.cancelBubble = true;
            onDeleteAction(imageElement.id);
          }}
          onMouseEnter={(e) => {
            e.target.scale({ x: 1.2, y: 1.2 });
            e.target.getLayer()?.batchDraw();
          }}
          onMouseLeave={(e) => {
            e.target.scale({ x: 1, y: 1 });
            e.target.getLayer()?.batchDraw();
          }}
        />
      )}
    </Group>
  );
};

export default ImageElementComponent;
