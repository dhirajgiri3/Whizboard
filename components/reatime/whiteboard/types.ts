// src/components/whiteboard/types.ts

import React from "react";

export interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  avatar: string;
  isActive: boolean;
}

export interface ToolbarItem {
  icon: React.ComponentType<any>;
  color: string;
  gradient: string[];
  theme: string;
  active: boolean;
  name: string;
  shortcut?: string;
  description?: string;
  isFunctional: boolean;
}

export interface DrawingPath {
  id: string;
  path: string;
  color: string;
  strokeWidth: number;
  user: string;
  opacity?: number;
  dashArray?: string;
  timestamp: number;
}

export interface CanvasElement {
  id: string;
  type: "circle" | "rectangle" | "triangle" | "star" | "note" | "text";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  content?: string;
  selected?: boolean;
  opacity?: number;
  rotation?: number;
  strokeWidth?: number;
  strokeColor?: string;
  timestamp: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  gradients: string[];
}