"use client";

import { useState } from "react";
import { Palette, X } from "lucide-react";
import { getStickyNoteColorPalette } from "../canvas/stickynote/StickyNote";

interface StickyNoteColorPickerProps {
  selectedColor: string;
  onColorSelectAction: (color: string) => void;
  onCloseAction?: () => void;
  position?: { x: number; y: number };
}

export default function StickyNoteColorPicker({
  selectedColor,
  onColorSelectAction,
  onCloseAction,
  position,
}: StickyNoteColorPickerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const colors = getStickyNoteColorPalette();

  const colorNames: Record<string, string> = {
    "#fef3c7": "Warm Yellow",
    "#dcfce7": "Fresh Green",
    "#dbeafe": "Ocean Blue",
    "#fce7f3": "Soft Pink",
    "#f3e8ff": "Lavender",
    "#fed7e2": "Rose",
    "#ffedd5": "Sunset",
    "#f0f9ff": "Sky Blue",
    "#ecfdf5": "Mint",
    "#fef0ff": "Magenta",
    "#fef7ed": "Amber",
    "#f1f5f9": "Slate",
  };

  const getBorderColor = (bgColor: string) => {
    const colors: Record<string, string> = {
      "#fef3c7": "#f59e0b",
      "#dcfce7": "#10b981",
      "#dbeafe": "#3b82f6",
      "#fce7f3": "#ec4899",
      "#f3e8ff": "#8b5cf6",
      "#fed7e2": "#f43f5e",
      "#ffedd5": "#ea580c",
      "#f0f9ff": "#0ea5e9",
      "#ecfdf5": "#059669",
      "#fef0ff": "#d946ef",
      "#fef7ed": "#f97316",
      "#f1f5f9": "#64748b",
    };
    return colors[bgColor] || "#6b7280";
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onCloseAction) {
      setTimeout(onCloseAction, 200);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-4 min-w-[280px] animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: position?.x || "50%",
        top: position?.y || "50%",
        transform: position ? "none" : "translate(-50%, -50%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Palette size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Choose Color</h3>
        </div>
        {onCloseAction && (
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelectAction(color)}
            className={`
              group relative w-16 h-16 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95
              ${
                selectedColor === color
                  ? "ring-3 ring-offset-2 shadow-lg"
                  : "hover:shadow-md"
              }
            `}
            style={{
              backgroundColor: color,
              borderColor: getBorderColor(color),
              borderWidth: selectedColor === color ? "3px" : "2px",
            }}
            title={colorNames[color] || color}
          >
            {/* Gradient overlay for depth */}
            <div
              className="absolute inset-0 rounded-xl opacity-20"
              style={{
                background: `linear-gradient(135deg, white 0%, transparent 50%, ${getBorderColor(
                  color
                )}20 100%)`,
              }}
            />

            {/* Selection indicator */}
            {selectedColor === color && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md"
                  style={{ backgroundColor: getBorderColor(color) }}
                >
                  ✓
                </div>
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </button>
        ))}
      </div>

      {/* Color name display */}
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-gray-700">
          {colorNames[selectedColor] || "Custom Color"}
        </div>
        <div className="text-xs text-gray-500 font-mono">{selectedColor}</div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() =>
            onColorSelectAction(
              colors[Math.floor(Math.random() * colors.length)]
            )
          }
          className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
        >
          Random
        </button>
        {onCloseAction && (
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}

// Utility hook for managing color picker
export function useStickyNoteColorPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(
    getStickyNoteColorPalette()[0]
  );
  const [position, setPosition] = useState<
    { x: number; y: number } | undefined
  >();

  const openPicker = (color: string, pos?: { x: number; y: number }) => {
    setSelectedColor(color);
    setPosition(pos);
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    setPosition(undefined);
  };

  return {
    isOpen,
    selectedColor,
    position,
    openPicker,
    closePicker,
    setSelectedColor,
  };
}
