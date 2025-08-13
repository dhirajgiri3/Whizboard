// src/components/whiteboard/hooks/useWhiteboardTools.ts

import { useMemo } from "react";
import {
  PenTool,
  Circle,
  Square,
  MessageSquare,
  Type,
  Hand,
  Eraser,
  Palette,
  Triangle,
  Star,
  Image,
} from "lucide-react";
import { ToolbarItem, ColorPalette } from "../types";

export const useWhiteboardTools = (activeTool: number) => {
  const colorPalettes: ColorPalette[] = useMemo(() => [
    {
      name: "Ocean",
      colors: ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"],
      gradients: ["from-sky-400", "to-blue-600"]
    },
    {
      name: "Forest",
      colors: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
      gradients: ["from-emerald-400", "to-green-600"]
    },
    {
      name: "Sunset",
      colors: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
      gradients: ["from-amber-400", "to-orange-600"]
    },
    {
      name: "Lavender",
      colors: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
      gradients: ["from-violet-400", "to-purple-600"]
    },
    {
      name: "Rose",
      colors: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
      gradients: ["from-pink-400", "to-rose-600"]
    }
  ], []);

  const toolbarItems: ToolbarItem[] = useMemo(
    () => [
      {
        icon: PenTool,
        color: "#3b82f6",
        gradient: ["from-blue-400", "to-blue-600"],
        theme: "blue",
        active: activeTool === 0,
        name: "Draw",
        shortcut: "P",
        description: "Click and drag to draw freehand lines on the canvas.",
        isFunctional: true,
      },
      {
        icon: Circle,
        color: "#10b981",
        gradient: ["from-emerald-400", "to-green-600"],
        theme: "emerald",
        active: activeTool === 1,
        name: "Circle",
        shortcut: "C",
        description: "Click and drag to create perfect circles. Hold Shift for proportional circles.",
        isFunctional: true,
      },
      {
        icon: Square,
        color: "#8b5cf6",
        gradient: ["from-violet-400", "to-purple-600"],
        theme: "violet",
        active: activeTool === 2,
        name: "Rectangle",
        shortcut: "R",
        description: "Click and drag to draw rectangles. Hold Shift for perfect squares.",
        isFunctional: true,
      },
      {
        icon: Triangle,
        color: "#f59e0b",
        gradient: ["from-amber-400", "to-orange-600"],
        theme: "amber",
        active: activeTool === 3,
        name: "Triangle",
        shortcut: "T",
        description: "Triangular shapes are not yet implemented.",
        isFunctional: false,
      },
      {
        icon: Star,
        color: "#ec4899",
        gradient: ["from-pink-400", "to-rose-600"],
        theme: "pink",
        active: activeTool === 4,
        name: "Star",
        shortcut: "S",
        description: "Star shapes are not yet implemented.",
        isFunctional: false,
      },
      {
        icon: MessageSquare,
        color: "#ef4444",
        gradient: ["from-red-400", "to-red-600"],
        theme: "red",
        active: activeTool === 5,
        name: "Note",
        shortcut: "N",
        description: "Click anywhere on the canvas to add a new sticky note. You can then type your content inside it.",
        isFunctional: true,
      },
      {
        icon: Type,
        color: "#6366f1",
        gradient: ["from-indigo-400", "to-indigo-600"],
        theme: "indigo",
        active: activeTool === 6,
        name: "Text",
        shortcut: "X",
        description: "Click anywhere to add a text box. Double-click to edit the text.",
        isFunctional: true,
      },
      {
        icon: Image,
        color: "#06b6d4",
        gradient: ["from-cyan-400", "to-cyan-600"],
        theme: "cyan",
        active: activeTool === 7,
        name: "Image",
        shortcut: "I",
        description: "Click to add an image from your device or Google Drive.",
        isFunctional: true,
      },
      {
        icon: Hand,
        color: "#64748b",
        gradient: ["from-slate-400", "to-slate-600"],
        theme: "slate",
        active: activeTool === 8,
        name: "Pan",
        shortcut: "H",
        description: "Click and drag the canvas to move your view around.",
        isFunctional: true,
      },
      {
        icon: Eraser,
        color: "#dc2626",
        gradient: ["from-red-500", "to-red-700"],
        theme: "red",
        active: activeTool === 9,
        name: "Eraser",
        shortcut: "E",
        description: "Click on any drawing path or element to erase it from the canvas.",
        isFunctional: true,
      },
      {
        icon: Palette,
        color: "#facc15",
        gradient: ["from-yellow-400", "to-yellow-600"],
        theme: "yellow",
        active: activeTool === 10,
        name: "Color Picker",
        shortcut: "O",
        description: "Select an active color from the palette. This color will be used for new drawings, shapes, and notes.",
        isFunctional: true,
      },
    ],
    [activeTool]
  );

  return { toolbarItems, colorPalettes };
};