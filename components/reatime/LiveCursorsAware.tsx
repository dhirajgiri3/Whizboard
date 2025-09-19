"use client";

import { Group, Text, Line, Circle, Rect } from "react-konva";
import { useEffect, useState } from "react";
import { useCRDTContext } from "@/lib/crdt/CRDTProvider";
import { UserCursor } from "@/lib/crdt/CRDTAwareness";

interface LiveCursorsAwareProps {
  currentTool?: string;
  isDrawing?: boolean;
  isSelecting?: boolean;
  activeElementId?: string;
  pressure?: number;
}

// Generate a consistent color for each user based on their ID
function getUserColor(userId: string): string {
  const colors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // emerald
    "#F59E0B", // amber
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#F97316", // orange
    "#6366F1", // indigo
  ];

  // Create a simple hash from userId to consistently assign colors
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function LiveCursorsAware({
  currentTool,
  isDrawing = false,
  isSelecting = false,
  activeElementId,
  pressure,
}: LiveCursorsAwareProps) {
  const { document: crdtDoc } = useCRDTContext();
  const [cursors, setCursors] = useState<Record<string, UserCursor>>({});

  // Subscribe to cursor changes from awareness protocol
  useEffect(() => {
    if (!crdtDoc) return;

    const unsubscribe = crdtDoc.awareness.onCursorsChange((newCursors) => {
      // Filter out inactive cursors (older than 30 seconds)
      const now = Date.now();
      const activeCursors = Object.fromEntries(
        Object.entries(newCursors).filter(
          ([_, cursor]) => cursor.isActive && now - cursor.lastActivity < 30000
        )
      );
      setCursors(activeCursors);
    });

    return unsubscribe;
  }, [crdtDoc]);

  // Update own cursor position when mouse moves
  useEffect(() => {
    if (!crdtDoc) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get canvas position - this might need adjustment based on your canvas setup
      const canvasElement = document.querySelector('canvas');
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      crdtDoc.awareness.updateCursor({
        x,
        y,
        isActive: true,
        currentTool,
        isDrawing,
        isSelecting,
        activeElementId,
        pressure,
      });
    };

    const handleMouseLeave = () => {
      crdtDoc.awareness.updateCursor({
        x: -1000, // Move cursor off-screen
        y: -1000,
        isActive: false,
        currentTool,
        isDrawing: false,
        isSelecting: false,
        activeElementId: undefined,
        pressure: 0,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [crdtDoc, currentTool, isDrawing, isSelecting, activeElementId, pressure]);

  return (
    <>
      {Object.values(cursors).map((cursor) => {
        const color = cursor.color || getUserColor(cursor.userId);
        const displayName = cursor.name || cursor.userId.substring(0, 8);
        const isActive = cursor.isActive !== false;

        // Don't render cursors that are off-screen or inactive
        if (!isActive || cursor.x < 0 || cursor.y < 0) {
          return null;
        }

        return (
          <Group key={cursor.userId} x={cursor.x} y={cursor.y}>
            {/* Soft glow pulse on move */}
            {isActive && (
              <Circle x={8} y={12} radius={10} fill={color} opacity={0.08} />
            )}

            {/* Enhanced cursor with activity indicators */}
            <Group>
              {/* Cursor shadow/outline */}
              <Line
                points={[0, 0, 16, 12, 12, 14, 14, 24, 10, 26, 4, 18, 0, 0]}
                fill="rgba(0,0,0,0.3)"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={1}
                closed={true}
                shadowBlur={3}
                shadowColor="rgba(0,0,0,0.4)"
                shadowOffset={{ x: 1, y: 1 }}
              />

              {/* Main cursor body with activity-based styling */}
              <Line
                points={[0, 0, 14, 10, 10, 12, 12, 22, 8, 24, 2, 16, 0, 0]}
                fill={cursor.isDrawing ? color : cursor.isSelecting ? "#10B981" : color}
                stroke="white"
                strokeWidth={1.5}
                closed={true}
                shadowBlur={2}
                shadowColor="rgba(0,0,0,0.2)"
                shadowOffset={{ x: 0.5, y: 0.5 }}
              />

              {/* Cursor highlight for 3D effect */}
              <Line
                points={[1, 1, 13, 9, 9, 11, 11, 20, 7, 22, 1, 14, 1, 1]}
                fill="rgba(255,255,255,0.3)"
                closed={true}
              />

              {/* Activity indicator ring with subtle motion */}
              {(cursor.isDrawing || cursor.isSelecting) && (
                <Circle
                  x={8}
                  y={12}
                  radius={cursor.isDrawing ? 8 : 6}
                  stroke={cursor.isDrawing ? color : "#10B981"}
                  strokeWidth={2}
                  opacity={0.6}
                  dash={[5, 5]}
                />
              )}
            </Group>

            {/* Enhanced user avatar with status indicators */}
            <Group x={20} y={8}>
              {/* Avatar background */}
              <Circle
                radius={12}
                fill={color}
                stroke="white"
                strokeWidth={2}
                shadowBlur={4}
                shadowColor="rgba(0,0,0,0.3)"
                shadowOffset={{ x: 1, y: 1 }}
              />

              {/* Activity pattern overlay */}
              {cursor.isDrawing && (
                <Circle
                  radius={8}
                  fill="rgba(255,255,255,0.2)"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                  dash={[3, 3]}
                />
              )}

              {/* User initials */}
              <Text
                x={-6}
                y={-6}
                text={displayName.charAt(0).toUpperCase()}
                fontSize={10}
                fontFamily="Inter, sans-serif"
                fontStyle="bold"
                fill="white"
                align="center"
                verticalAlign="middle"
              />

              {/* Status indicator */}
              <Circle
                x={8}
                y={-8}
                radius={3}
                fill={isActive ? "#10B981" : "#6B7280"}
                stroke="white"
                strokeWidth={1}
              />
            </Group>

            {/* Enhanced user name label with activity info */}
            <Group x={40} y={-8}>
              {/* Label background with rounded corners */}
              <Rect
                x={0}
                y={0}
                width={120}
                height={24}
                fill="rgba(0,0,0,0.7)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                cornerRadius={8}
                shadowBlur={6}
                shadowColor="rgba(0,0,0,0.4)"
                shadowOffset={{ x: 2, y: 2 }}
              />

              {/* User name text */}
              <Text
                text={displayName}
                fontSize={11}
                fontFamily="Inter, sans-serif"
                fontStyle="600"
                fill="white"
                x={8}
                y={4}
                width={104}
                align="left"
                shadowBlur={1}
                shadowColor="rgba(0,0,0,0.5)"
                shadowOffset={{ x: 0.5, y: 0.5 }}
              />

              {/* Activity indicator */}
              {cursor.isDrawing && (
                <Circle
                  x={110}
                  y={12}
                  radius={3}
                  fill="#EF4444"
                  opacity={0.8}
                />
              )}
              {cursor.isSelecting && (
                <Circle
                  x={110}
                  y={12}
                  radius={3}
                  fill="#10B981"
                  opacity={0.8}
                />
              )}
            </Group>

            {/* Pressure indicator for stylus support */}
            {cursor.pressure && cursor.pressure > 0 && (
              <Circle
                x={8}
                y={12}
                radius={cursor.pressure * 10}
                stroke={color}
                strokeWidth={1}
                opacity={0.3}
                dash={[2, 2]}
              />
            )}

            {/* Connection quality indicator */}
            <Group x={-5} y={-5}>
              <Circle
                radius={2}
                fill={Date.now() - cursor.lastActivity < 5000 ? "#10B981" : "#EF4444"}
                opacity={0.7}
              />
            </Group>
          </Group>
        );
      })}
    </>
  );
}