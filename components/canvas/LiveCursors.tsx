"use client";

import { Group, Text, Line } from "react-konva";

export interface Cursor {
  x: number;
  y: number;
  userId: string;
  name: string;
  color?: string;
}

interface LiveCursorsProps {
  cursors: Record<string, Cursor>;
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

export default function LiveCursors({ cursors }: LiveCursorsProps) {
  return (
    <>
      {Object.values(cursors).map(({ x, y, userId, name }) => {
        const color = getUserColor(userId);
        const displayName = name || userId.substring(0, 8);

        return (
          <Group key={userId} x={x} y={y}>
            {/* Cursor pointer with arrow shape */}
            <Group>
              <Line
                points={[
                  0,
                  0, // Top point
                  18,
                  14, // Right middle
                  12,
                  16, // Inner right
                  14,
                  24, // Bottom right
                  10,
                  26, // Bottom inner
                  6,
                  18, // Left middle
                  0,
                  0, // Back to start
                ]}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
                closed={true}
                shadowBlur={4}
                shadowColor="rgba(0,0,0,0.4)"
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.8}
              />
              {/* Optional inner highlight for better 3D effect */}
              <Line
                points={[1, 1, 16, 13, 11, 15, 13, 22, 9, 24, 6, 17, 1, 1]}
                fill="rgba(255,255,255,0.1)"
                closed={true}
              />
            </Group>

            {/* User name label */}
            <Group x={16} y={4}>
              {/* Background for the name */}
              <Text
                text={displayName}
                fontSize={11}
                fontFamily="Inter, sans-serif"
                fontStyle="600"
                fill="white"
                padding={6}
                cornerRadius={6}
                shadowBlur={2}
                shadowColor="rgba(0,0,0,0.2)"
                shadowOffset={{ x: 1, y: 1 }}
              />
              {/* Colored background rectangle */}
              <Text
                text={displayName}
                fontSize={11}
                fontFamily="Inter, sans-serif"
                fontStyle="600"
                fill={color}
                padding={6}
                cornerRadius={6}
                x={-1}
                y={-1}
              />
            </Group>
          </Group>
        );
      })}
    </>
  );
}
