"use client";

import { useState, useRef, useEffect } from 'react';
import { Group, Rect, Text, Circle, Line, Path } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

export interface StickyNoteProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize: number;
  isSelected: boolean;
  onSelectAction: (id: string) => void;
  onTextChangeAction: (id: string, text: string) => void;
  onPositionChangeAction: (id: string, x: number, y: number) => void;
  onDeleteAction: (id: string) => void;
  onDragStartAction?: (id: string) => void;
  onDragEndAction?: (id: string) => void;
  isDraggable?: boolean;
}

export default function StickyNote({
  id,
  x,
  y,
  width,
  height,
  text,
  color,
  fontSize,
  isSelected,
  onSelectAction,
  onTextChangeAction,
  onPositionChangeAction,
  onDeleteAction,
  onDragStartAction,
  onDragEndAction,
  isDraggable = true,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const groupRef = useRef<Konva.Group>(null);
  const animationRef = useRef<Konva.Animation | null>(null);
  
  const lastClickTimeRef = useRef<number>(0);
  const doubleClickThreshold = 300;

  useEffect(() => {
    setEditText(text);
  }, [text]);

  // Smooth animation for selected state
  useEffect(() => {
    if ((isSelected || isHovered) && !isDragging && !isEditing) {
      const group = groupRef.current;
      if (!group) return;

      animationRef.current = new Konva.Animation((frame) => {
        if (frame) {
          const phase = frame.time * 0.002;
          setAnimationPhase(phase);
        }
      }, group.getLayer());

      animationRef.current.start();
      
      return () => {
        if (animationRef.current) {
          animationRef.current.stop();
          animationRef.current = null;
        }
      };
    }
  }, [isSelected, isHovered, isDragging, isEditing]);

  // Dynamic color scheme generator for custom colors
  const generateColorSchemeFromColor = (bgColor: string) => {
    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Helper function to convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number): string => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    // Helper function to darken a color
    const darkenColor = (rgb: { r: number; g: number; b: number }, factor: number) => {
      return {
        r: Math.max(0, Math.round(rgb.r * (1 - factor))),
        g: Math.max(0, Math.round(rgb.g * (1 - factor))),
        b: Math.max(0, Math.round(rgb.b * (1 - factor)))
      };
    };

    // Helper function to lighten a color
    const lightenColor = (rgb: { r: number; g: number; b: number }, factor: number) => {
      return {
        r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)),
        g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)),
        b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))
      };
    };

    const baseRgb = hexToRgb(bgColor);
    if (!baseRgb) {
      // Fallback to default scheme if color parsing fails
      return {
        primary: '#64748b',
        secondary: '#94a3b8',
        accent: '#f8fafc',
        shadow: 'rgba(100, 116, 139, 0.15)',
        text: '#334155',
        border: '#64748b',
        gradient: ['#f1f5f9', '#f8fafc', '#f1f5f9']
      };
    }

    const primaryRgb = darkenColor(baseRgb, 0.3);
    const secondaryRgb = darkenColor(baseRgb, 0.2);
    const accentRgb = lightenColor(baseRgb, 0.5);
    const textRgb = darkenColor(baseRgb, 0.7);

    return {
      primary: rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b),
      secondary: rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b),
      accent: rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b),
      shadow: `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.15)`,
      text: rgbToHex(textRgb.r, textRgb.g, textRgb.b),
      border: rgbToHex(primaryRgb.r, primaryRgb.g, primaryRgb.b),
      gradient: [bgColor, rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b), bgColor]
    };
  };

  // Modern color system with better contrast and accessibility
  const getColorScheme = (bgColor: string) => {
    const schemes: Record<string, {
      primary: string;
      secondary: string;
      accent: string;
      shadow: string;
      text: string;
      border: string;
      gradient: string[];
    }> = {
      '#fef3c7': {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        accent: '#fffbeb',
        shadow: 'rgba(245, 158, 11, 0.15)',
        text: '#92400e',
        border: '#f59e0b',
        gradient: ['#fef3c7', '#fffbeb', '#fef3c7']
      },
      '#dcfce7': {
        primary: '#10b981',
        secondary: '#34d399',
        accent: '#f0fdf4',
        shadow: 'rgba(16, 185, 129, 0.15)',
        text: '#064e3b',
        border: '#10b981',
        gradient: ['#dcfce7', '#f0fdf4', '#dcfce7']
      },
      '#dbeafe': {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#eff6ff',
        shadow: 'rgba(59, 130, 246, 0.15)',
        text: '#1e3a8a',
        border: '#3b82f6',
        gradient: ['#dbeafe', '#eff6ff', '#dbeafe']
      },
      '#fce7f3': {
        primary: '#ec4899',
        secondary: '#f472b6',
        accent: '#fdf2f8',
        shadow: 'rgba(236, 72, 153, 0.15)',
        text: '#831843',
        border: '#ec4899',
        gradient: ['#fce7f3', '#fdf2f8', '#fce7f3']
      },
      '#f3e8ff': {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        accent: '#faf5ff',
        shadow: 'rgba(139, 92, 246, 0.15)',
        text: '#581c87',
        border: '#8b5cf6',
        gradient: ['#f3e8ff', '#faf5ff', '#f3e8ff']
      },
      '#fed7e2': {
        primary: '#f43f5e',
        secondary: '#fb7185',
        accent: '#fdf2f8',
        shadow: 'rgba(244, 63, 94, 0.15)',
        text: '#881337',
        border: '#f43f5e',
        gradient: ['#fed7e2', '#fdf2f8', '#fed7e2']
      },
      '#fef0ff': {
        primary: '#d946ef',
        secondary: '#e879f9',
        accent: '#fefcff',
        shadow: 'rgba(217, 70, 239, 0.15)',
        text: '#86198f',
        border: '#d946ef',
        gradient: ['#fef0ff', '#fefcff', '#fef0ff']
      },
      '#ecfdf5': {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#f0fdf9',
        shadow: 'rgba(5, 150, 105, 0.15)',
        text: '#064e3b',
        border: '#059669',
        gradient: ['#ecfdf5', '#f0fdf9', '#ecfdf5']
      },
      '#ffedd5': {
        primary: '#ea580c',
        secondary: '#fb923c',
        accent: '#fff7ed',
        shadow: 'rgba(234, 88, 12, 0.15)',
        text: '#9a3412',
        border: '#ea580c',
        gradient: ['#ffedd5', '#fff7ed', '#ffedd5']
      },
      '#f0f9ff': {
        primary: '#0ea5e9',
        secondary: '#38bdf8',
        accent: '#f0f9ff',
        shadow: 'rgba(14, 165, 233, 0.15)',
        text: '#0c4a6e',
        border: '#0ea5e9',
        gradient: ['#f0f9ff', '#f0f9ff', '#f0f9ff']
      },
      '#fef7ed': {
        primary: '#f97316',
        secondary: '#fb923c',
        accent: '#fffbeb',
        shadow: 'rgba(249, 115, 22, 0.15)',
        text: '#9a3412',
        border: '#f97316',
        gradient: ['#fef7ed', '#fffbeb', '#fef7ed']
      },
      '#f1f5f9': {
        primary: '#64748b',
        secondary: '#94a3b8',
        accent: '#f8fafc',
        shadow: 'rgba(100, 116, 139, 0.15)',
        text: '#334155',
        border: '#64748b',
        gradient: ['#f1f5f9', '#f8fafc', '#f1f5f9']
      },
    };
    // If color scheme exists, use it
    if (schemes[bgColor]) {
      return schemes[bgColor];
    }

    // Generate dynamic color scheme for custom colors
    return generateColorSchemeFromColor(bgColor);
  };

  const colorScheme = getColorScheme(color);
  
  const getCornerRadius = () => {
    const baseRadius = 20;
    const scaleFactor = Math.min(width, height) / 200;
    return Math.max(12, Math.min(baseRadius * scaleFactor, 28));
  };

  // Event handlers
  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    
    if (isEditing || isDragging) return;

    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTimeRef.current;
    
    if (timeSinceLastClick < doubleClickThreshold) {
      startEditingMode(e);
      return;
    }
    
    lastClickTimeRef.current = currentTime;
    onSelectAction(id);
  };

  const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    
    if (isEditing || isDragging) return;
    startEditingMode(e);
  };

  const startEditingMode = (e: KonvaEventObject<MouseEvent>) => {
    setIsEditing(true);
    onSelectAction(id);
    
    const stage = e.target.getStage();
    if (!stage) return;
    
    const stageBox = stage.container().getBoundingClientRect();
    const stageTransform = stage.getAbsoluteTransform();
    const stagePoint = stageTransform.point({ x, y });
    
    const areaPosition = {
      x: stageBox.left + stagePoint.x,
      y: stageBox.top + stagePoint.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Modern textarea styling with blur effect
    Object.assign(textarea.style, {
      position: 'absolute',
      top: areaPosition.y + 'px',
      left: areaPosition.x + 'px',
      width: (width * stage.scaleX()) + 'px',
      height: (height * stage.scaleY()) + 'px',
      fontSize: Math.max(14, fontSize * stage.scaleX()) + 'px',
      border: `3px solid ${colorScheme.primary}`,
      borderRadius: '20px',
      padding: '24px',
      margin: '0',
      overflow: 'hidden',
      background: `
        linear-gradient(135deg, 
          ${colorScheme.gradient[0]}e6, 
          ${colorScheme.gradient[1]}f0, 
          ${colorScheme.gradient[2]}e6
        )
      `,
      backdropFilter: 'blur(20px) saturate(1.2)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
      outline: 'none',
      resize: 'none',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      color: colorScheme.text,
      zIndex: '10000',
      boxShadow: `
        0 32px 64px -12px ${colorScheme.shadow},
        0 0 0 1px ${colorScheme.primary}30,
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        0 8px 16px -4px rgba(0, 0, 0, 0.1)
      `,
      lineHeight: '1.6',
      letterSpacing: '0.01em',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'scale(1.02) translateZ(0)',
      willChange: 'transform',
    });

    textarea.value = editText;
    textarea.focus();
    
    if (text && text !== 'Click to add your thoughts...') {
      textarea.select();
    }

    const saveAndRemove = () => {
      const newText = textarea.value.trim();
      if (newText !== text) {
        onTextChangeAction(id, newText);
      }
      setEditText(newText);
      removeTextarea();
    };

    const removeTextarea = () => {
      if (textarea.parentNode) {
        textarea.style.transform = 'scale(0.95) translateZ(0)';
        textarea.style.opacity = '0';
        setTimeout(() => {
          if (textarea.parentNode) {
            textarea.parentNode.removeChild(textarea);
          }
        }, 200);
      }
      setIsEditing(false);
    };

    textarea.addEventListener('keydown', (e) => {
      e.stopPropagation();
      
      if (e.key === 'Escape') {
        e.preventDefault();
        removeTextarea();
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        saveAndRemove();
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        removeTextarea();
        onDeleteAction(id);
      }
    });

    textarea.addEventListener('blur', saveAndRemove);
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setIsDragging(true);
    
    if (!isSelected) {
      onSelectAction(id);
    }
    
    onDragStartAction?.(id);
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setIsDragging(false);
    
    const target = e.target as Konva.Group;
    onPositionChangeAction(id, target.x(), target.y());
    onDragEndAction?.(id);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <Group
      ref={groupRef}
      name="sticky-note"
      x={x}
      y={y}
      draggable={isDraggable && !isEditing}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      opacity={isDragging ? 0.85 : 1}
      scaleX={isDragging ? 1.05 : 1}
      scaleY={isDragging ? 1.05 : 1}
      listening={true}
    >
      {/* Advanced shadow system for depth */}
      <Rect
        x={8}
        y={12}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.06)"
        cornerRadius={getCornerRadius() + 2}
        blur={16}
        listening={false}
      />
      <Rect
        x={4}
        y={8}
        width={width}
        height={height}
        fill="rgba(0, 0, 0, 0.04)"
        cornerRadius={getCornerRadius() + 1}
        blur={8}
        listening={false}
      />
      <Rect
        x={2}
        y={4}
        width={width}
        height={height}
        fill={colorScheme.shadow}
        cornerRadius={getCornerRadius()}
        blur={6}
        opacity={isHovered ? 0.9 : 0.7}
        listening={false}
      />
      
      {/* Main blurred background with glassmorphism effect */}
      <Rect
        width={width}
        height={height}
        fillRadialGradientStartPoint={{ x: width * 0.3, y: height * 0.2 }}
        fillRadialGradientEndPoint={{ x: width * 0.7, y: height * 0.8 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={Math.max(width, height)}
        fillRadialGradientColorStops={[
          0, colorScheme.gradient[1] + 'f5',
          0.5, colorScheme.gradient[0] + 'e8', 
          1, colorScheme.gradient[2] + 'f0'
        ]}
        stroke={isSelected ? colorScheme.primary : isHovered ? colorScheme.secondary : 'transparent'}
        strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
        cornerRadius={getCornerRadius()}
        shadowColor={colorScheme.shadow}
        shadowBlur={isSelected ? 12 : isHovered ? 8 : 6}
        shadowOffsetY={isSelected ? 6 : 3}
        listening={true}
        name="sticky-note-background"
        // Glassmorphism effect simulation
        opacity={0.95}
      />

      {/* Subtle noise texture overlay for paper-like feel */}
      <Rect
        width={width}
        height={height}
        fill="rgba(255, 255, 255, 0.03)"
        cornerRadius={getCornerRadius()}
        listening={false}
        // Add subtle texture pattern
        fillPatternRepeat="repeat"
      />

      {/* Enhanced top highlight with better gradient */}
      <Rect
        width={width}
        height={height * 0.35}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: height * 0.35 }}
        fillLinearGradientColorStops={[
          0, 'rgba(255, 255, 255, 0.4)', 
          0.6, 'rgba(255, 255, 255, 0.1)',
          1, 'rgba(255, 255, 255, 0)'
        ]}
        cornerRadius={[getCornerRadius(), getCornerRadius(), 0, 0]}
        listening={false}
      />

      {/* Modern top accent bar with gradient */}
      <Rect
        width={width}
        height={12}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: width, y: 0 }}
        fillLinearGradientColorStops={[
          0, colorScheme.primary + '80',
          0.3, colorScheme.secondary + '90',
          0.7, colorScheme.primary + '90',
          1, colorScheme.primary + '80'
        ]}
        cornerRadius={[getCornerRadius(), getCornerRadius(), 0, 0]}
        listening={false}
      />

      {/* Elegant paper lines with better spacing */}
      {Array.from({ length: Math.floor((height - 72) / 32) }, (_, i) => (
        <Line
          key={`line-${i}`}
          points={[28, 72 + i * 32, width - 28, 72 + i * 32]}
          stroke={colorScheme.primary + '20'}
          strokeWidth={1}
          opacity={0.4}
          listening={false}
        />
      ))}

      {/* Enhanced text with better typography */}
      {!isEditing && (
        <Text
          x={28}
          y={44}
          width={width - 56}
          height={height - 72}
          text={text || 'Click to add your thoughts...'}
          fontSize={fontSize}
          fontFamily='"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          fontWeight={text ? '500' : '400'}
          fill={text ? colorScheme.text : colorScheme.primary + 'a0'}
          fontStyle={text ? 'normal' : 'italic'}
          align="left"
          verticalAlign="top"
          wrap="word"
          ellipsis={true}
          lineHeight={1.65}
          letterSpacing={0.2}
          listening={false}
        />
      )}

      {/* Modern empty state with animated icon */}
      {!text && isHovered && !isEditing && (
        <>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={24 + Math.sin(animationPhase * 3) * 2}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndPoint={{ x: 24, y: 24 }}
            fillRadialGradientColorStops={[0, 'rgba(255, 255, 255, 0.95)', 1, colorScheme.accent]}
            stroke={colorScheme.primary}
            strokeWidth={2}
            shadowColor={colorScheme.primary}
            shadowBlur={8}
            shadowOpacity={0.3}
            listening={false}
          />
          
          {/* Animated plus icon */}
          <Line
            points={[width / 2 - 10, height / 2, width / 2 + 10, height / 2]}
            stroke={colorScheme.primary}
            strokeWidth={3}
            lineCap="round"
            opacity={0.8 + Math.sin(animationPhase * 2) * 0.2}
            listening={false}
          />
          <Line
            points={[width / 2, height / 2 - 10, width / 2, height / 2 + 10]}
            stroke={colorScheme.primary}
            strokeWidth={3}
            lineCap="round"
            opacity={0.8 + Math.sin(animationPhase * 2) * 0.2}
            listening={false}
          />
          
          {/* Floating sparkles */}
          <Circle
            x={width / 2 + 15}
            y={height / 2 - 15}
            radius={2}
            fill={colorScheme.secondary}
            opacity={0.6 + Math.sin(animationPhase * 4) * 0.4}
            listening={false}
          />
          <Circle
            x={width / 2 - 18}
            y={height / 2 + 12}
            radius={1.5}
            fill={colorScheme.primary}
            opacity={0.4 + Math.cos(animationPhase * 3) * 0.4}
            listening={false}
          />
        </>
      )}

      {/* Premium selection indicators */}
      {isSelected && (
        <>
          {/* Animated selection aura */}
          <Rect
            x={-6}
            y={-6}
            width={width + 12}
            height={height + 12}
            stroke={colorScheme.primary}
            strokeWidth={3}
            cornerRadius={getCornerRadius() + 6}
            dash={[16, 8]}
            dashOffset={-animationPhase * 40}
            opacity={0.9}
            shadowColor={colorScheme.primary}
            shadowBlur={12}
            shadowOpacity={0.4}
            listening={false}
          />

          {/* Premium selection badge */}
          <Rect
            x={width - 80}
            y={-28}
            width={80}
            height={20}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 80, y: 0 }}
            fillLinearGradientColorStops={[0, colorScheme.primary, 1, colorScheme.secondary]}
            cornerRadius={10}
            shadowColor={colorScheme.primary}
            shadowBlur={8}
            shadowOpacity={0.3}
            listening={false}
          />
          <Text
            x={width - 78}
            y={-25}
            width={76}
            height={14}
            text="✓ SELECTED"
            fontSize={10}
            fontFamily='"SF Pro Display", "Inter", sans-serif'
            fontWeight="700"
            fill="white"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        
        </>
      )}

      {/* Enhanced hover effects */}
      {isHovered && !isSelected && (
        <>
          <Rect
            x={-3}
            y={-3}
            width={width + 6}
            height={height + 6}
            stroke={colorScheme.primary}
            strokeWidth={2}
            cornerRadius={getCornerRadius() + 3}
            opacity={0.7}
            dash={[8, 4]}
            dashOffset={animationPhase * 20}
            shadowColor={colorScheme.primary}
            shadowBlur={8}
            shadowOpacity={0.3}
            listening={false}
          />
          
          {/* Hover tooltip */}
          <Rect
            x={width - 140}
            y={-20}
            width={140}
            height={16}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 140, y: 0 }}
            fillLinearGradientColorStops={[0, 'rgba(0, 0, 0, 0.85)', 1, 'rgba(0, 0, 0, 0.75)']}
            cornerRadius={8}
            opacity={0.95}
            listening={false}
          />
          <Text
            x={width - 138}
            y={-18}
            width={136}
            height={12}
            text="💡 Double-click to edit"
            fontSize={9}
            fontFamily='"SF Pro Display", "Inter", sans-serif'
            fontWeight="500"
            fill="white"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}

      {/* Premium edit mode indicator */}
      {isEditing && (
        <>
          <Rect
            x={-8}
            y={-8}
            width={width + 16}
            height={height + 16}
            stroke="#3b82f6"
            strokeWidth={4}
            cornerRadius={getCornerRadius() + 8}
            dash={[12, 6]}
            shadowColor="#3b82f6"
            shadowBlur={16}
            shadowOpacity={0.4}
            listening={false}
          />
          
          <Rect
            x={width / 2 - 50}
            y={-36}
            width={100}
            height={24}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 100, y: 0 }}
            fillLinearGradientColorStops={[0, '#3b82f6', 0.5, '#60a5fa', 1, '#3b82f6']}
            cornerRadius={12}
            shadowColor="#3b82f6"
            shadowBlur={12}
            shadowOpacity={0.4}
            listening={false}
          />
          
          <Text
            x={width / 2 - 48}
            y={-32}
            width={96}
            height={16}
            text="✏️ EDITING MODE"
            fontSize={11}
            fontFamily='"SF Pro Display", "Inter", sans-serif'
            fontWeight="700"
            fill="white"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}

      {/* Dynamic drag state effects */}
      {isDragging && (
        <>
          <Rect
            x={-10}
            y={-10}
            width={width + 20}
            height={height + 20}
            stroke={colorScheme.primary}
            strokeWidth={3}
            cornerRadius={getCornerRadius() + 10}
            opacity={0.6}
            dash={[6, 6]}
            listening={false}
          />
          
          {/* Motion trails */}
          <Path
            data={`M ${width/2} -20 Q ${width/2 + 10} -15 ${width/2} -10 Q ${width/2 - 10} -15 ${width/2} -20`}
            fill={colorScheme.primary}
            opacity={0.7}
            listening={false}
          />
          
          <Text
            x={width / 2 - 30}
            y={-16}
            width={60}
            height={12}
            text="MOVING"
            fontSize={10}
            fontFamily='"SF Pro Display", "Inter", sans-serif'
            fontWeight="600"
            fill={colorScheme.primary}
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}

      {/* Ambient lighting effect */}
      <Rect
        x={-1}
        y={-1}
        width={width + 2}
        height={height + 2}
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth={0.5}
        cornerRadius={getCornerRadius() + 1}
        listening={false}
      />
    </Group>
  );
}

export function getRandomStickyNoteColor(): string {
  const colors = [
    '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3',
    '#f3e8ff', '#fed7e2', '#ffedd5', '#f0f9ff',
    '#ecfdf5', '#fef0ff', '#fef7ed', '#f1f5f9',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getStickyNoteColorPalette(): string[] {
  return [
    '#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3',
    '#f3e8ff', '#fed7e2', '#ffedd5', '#f0f9ff',
    '#ecfdf5', '#fef0ff', '#fef7ed', '#f1f5f9',
  ];
}