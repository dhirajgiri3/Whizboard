"use client";

import { Group, Text, Line, Circle } from "react-konva";

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
            {/* Simplified arrow cursor using basic Konva shapes */}
            <Group>
              {/* Arrow shadow/outline */}
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
              
              {/* Main arrow body */}
              <Line
                points={[0, 0, 14, 10, 10, 12, 12, 22, 8, 24, 2, 16, 0, 0]}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
                closed={true}
                shadowBlur={2}
                shadowColor="rgba(0,0,0,0.2)"
                shadowOffset={{ x: 0.5, y: 0.5 }}
              />
              
              {/* Arrow highlight for 3D effect */}
              <Line
                points={[1, 1, 13, 9, 9, 11, 11, 20, 7, 22, 1, 14, 1, 1]}
                fill="rgba(255,255,255,0.3)"
                closed={true}
              />
            </Group>

            {/* User avatar circle */}
            <Circle
              x={20}
              y={8}
              radius={12}
              fill={color}
              stroke="white"
              strokeWidth={2}
              shadowBlur={4}
              shadowColor="rgba(0,0,0,0.3)"
              shadowOffset={{ x: 1, y: 1 }}
            />
            
            {/* User initials in avatar */}
            <Text
              x={8}
              y={-4}
              text={displayName.charAt(0).toUpperCase()}
              fontSize={10}
              fontFamily="Inter, sans-serif"
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
            />

            {/* User name label with improved styling */}
            <Group x={40} y={-8}>
              {/* Label background with rounded corners */}
              <Line
                points={[
                  0, 0,
                  0, 20,
                  80, 20,
                  80, 0,
                  0, 0
                ]}
                fill="rgba(0,0,0,0.8)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                cornerRadius={8}
                closed={true}
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
                width={64}
                align="center"
                shadowBlur={1}
                shadowColor="rgba(0,0,0,0.5)"
                shadowOffset={{ x: 0.5, y: 0.5 }}
              />
            </Group>
          </Group>
        );
      })}
    </>
  );
}
