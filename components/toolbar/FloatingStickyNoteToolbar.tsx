"use client";

import { useState } from 'react';
import { Palette, Plus, Minus } from 'lucide-react';
import { getStickyNoteColorPalette } from '../canvas/StickyNote';

interface FloatingStickyNoteToolbarProps {
  currentColor: string;
  onColorChangeAction: (color: string) => void;
  onColorPickerOpenAction: (position: { x: number; y: number }) => void;
  isVisible: boolean;
}

export default function FloatingStickyNoteToolbar({
  currentColor,
  onColorChangeAction,
  onColorPickerOpenAction,
  isVisible
}: FloatingStickyNoteToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getStickyNoteColorPalette();

  const getBorderColor = (bgColor: string) => {
    const colorMap: Record<string, string> = {
      '#fef3c7': '#f59e0b',
      '#dcfce7': '#10b981',
      '#dbeafe': '#3b82f6',
      '#fce7f3': '#ec4899',
      '#f3e8ff': '#8b5cf6',
      '#fed7e2': '#f43f5e',
      '#ffedd5': '#ea580c',
      '#f0f9ff': '#0ea5e9',
      '#ecfdf5': '#059669',
      '#fef0ff': '#d946ef',
      '#fef7ed': '#f97316',
      '#f1f5f9': '#64748b',
    };
    return colorMap[bgColor] || '#6b7280';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed z-40 bottom-24 right-6 transition-all duration-300 ease-out">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-lg border-2 shadow-sm"
              style={{ 
                backgroundColor: currentColor,
                borderColor: getBorderColor(currentColor)
              }}
            />
            <span className="text-sm font-medium text-gray-700">Sticky Note</span>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            title={isExpanded ? "Collapse" : "Expand color palette"}
          >
            {isExpanded ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* Color Palette */}
        {isExpanded ? (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChangeAction(color)}
                className={`
                  w-10 h-10 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95
                  ${currentColor === color 
                    ? 'ring-2 ring-offset-1 shadow-md' 
                    : 'hover:shadow-sm'
                  }
                `}
                style={{
                  backgroundColor: color,
                  borderColor: getBorderColor(color)
                }}
                title={`Use ${color}`}
              >
                {currentColor === color && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: getBorderColor(color) }}
                    >
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 mb-3">
            {colors.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => onColorChangeAction(color)}
                className={`
                  w-8 h-8 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 active:scale-95
                  ${currentColor === color 
                    ? 'ring-2 ring-offset-1 shadow-md' 
                    : 'hover:shadow-sm'
                  }
                `}
                style={{
                  backgroundColor: color,
                  borderColor: getBorderColor(color)
                }}
                title={`Use ${color}`}
              >
                {currentColor === color && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div 
                      className="w-3 h-3 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: getBorderColor(color) }}
                    >
                      ✓
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onColorPickerOpenAction({
                x: rect.left - 150,
                y: rect.top - 300
              });
            }}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Palette size={14} />
            More
          </button>
          
          <button
            onClick={() => onColorChangeAction(colors[Math.floor(Math.random() * colors.length)])}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors"
            title="Random color"
          >
            🎲
          </button>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press <kbd className="bg-gray-200 px-1 py-0.5 rounded text-xs">⌘⇧C</kbd> to open color picker
        </div>
      </div>
    </div>
  );
}
