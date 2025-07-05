import React, { useState, useCallback, useMemo } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
  Minus,
  Plus,
  RotateCcw,
  EyeOff,
  Eye,
  Maximize2,
  Minimize2,
  Grip,
  Highlighter,
  List,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TextElement } from '@/types';
import { useFloatingToolbarDrag } from '@/hooks/useFloatingToolbarDrag';

interface FloatingTextToolbarProps {
  isActive?: boolean;
  selectedTextElements?: TextElement[];
  onTextUpdateAction?: (textElement: TextElement) => void;
  onFormatAction?: (formatting: Partial<TextElement['formatting']>) => void;
  className?: string;
}

// Font family options
const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
  'Arial Black',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
];

// Font size presets
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

// Color presets
const COLOR_PRESETS = [
  '#000000', '#374151', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#ffffff', '#f3f4f6',
];

const FloatingTextToolbar: React.FC<FloatingTextToolbarProps> = ({
  isActive = false,
  selectedTextElements = [],
  onTextUpdateAction,
  onFormatAction,
  className = '',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Get current formatting from selected text
  const currentFormatting = useMemo(() => {
    if (selectedTextElements.length === 0) {
      return {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        highlight: false,
        highlightColor: '#ffeb3b',
        align: 'left' as const,
        lineHeight: 1.2,
        letterSpacing: 0,
        textTransform: 'none' as const,
        listType: 'none' as const,
        listStyle: '•',
        listLevel: 0,
      };
    }
    
    // Use first selected element's formatting as base
    return selectedTextElements[0].formatting;
  }, [selectedTextElements]);

  // Drag functionality for the toolbar
  const {
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    isHidden,
    isCollapsed,
    isDragging,
    toolbarStyles,
    eyeButtonStyles,
    handleMouseDown,
    handleEyeMouseDown,
    handleDoubleClick,
    handleClick,
    toggleHidden,
    toggleCollapsed,
    resetPosition,
  } = useFloatingToolbarDrag({
    toolbarId: 'text',
    initialPosition: { x: 100, y: 100 },
    minWidth: 420,
    minHeight: 180,
  });

  // Format update handler
  const updateFormatting = useCallback((updates: Partial<TextElement['formatting']>) => {
    if (onFormatAction) {
      onFormatAction(updates);
    }
    
    // Update each selected text element
    selectedTextElements.forEach(textElement => {
      if (onTextUpdateAction) {
        const updatedElement: TextElement = {
          ...textElement,
          formatting: {
            ...textElement.formatting,
            ...updates,
          },
          updatedAt: Date.now(),
          version: textElement.version + 1,
        };
        onTextUpdateAction(updatedElement);
      }
    });
  }, [selectedTextElements, onTextUpdateAction, onFormatAction]);

  // Individual formatting handlers
  const toggleBold = useCallback(() => {
    updateFormatting({ bold: !currentFormatting.bold });
  }, [updateFormatting, currentFormatting.bold]);

  const toggleItalic = useCallback(() => {
    updateFormatting({ italic: !currentFormatting.italic });
  }, [updateFormatting, currentFormatting.italic]);

  const toggleUnderline = useCallback(() => {
    updateFormatting({ underline: !currentFormatting.underline });
  }, [updateFormatting, currentFormatting.underline]);

  const toggleStrikethrough = useCallback(() => {
    updateFormatting({ strikethrough: !currentFormatting.strikethrough });
  }, [updateFormatting, currentFormatting.strikethrough]);

  const toggleHighlight = useCallback(() => {
    updateFormatting({ highlight: !currentFormatting.highlight });
  }, [updateFormatting, currentFormatting.highlight]);

  const setAlignment = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    updateFormatting({ align });
  }, [updateFormatting]);

  const setFontFamily = useCallback((fontFamily: string) => {
    updateFormatting({ fontFamily });
  }, [updateFormatting]);

  const setFontSize = useCallback((fontSize: number) => {
    updateFormatting({ fontSize });
  }, [updateFormatting]);

  const setColor = useCallback((color: string) => {
    updateFormatting({ color });
  }, [updateFormatting]);

  const setHighlightColor = useCallback((highlightColor: string) => {
    updateFormatting({ highlightColor });
  }, [updateFormatting]);

  const adjustFontSize = useCallback((delta: number) => {
    const newSize = Math.max(8, Math.min(200, currentFormatting.fontSize + delta));
    updateFormatting({ fontSize: newSize });
  }, [updateFormatting, currentFormatting.fontSize]);

  if (!isActive) return null;

  return (
    <>
      {/* Floating Eye Button */}
      <button
        ref={eyeButtonRef}
        onMouseDown={handleEyeMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            toggleHidden();
          }
        }}
        style={eyeButtonStyles}
        className={cn(
          "w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-lg border border-gray-200/50",
          "flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300",
          "text-gray-600 hover:bg-white group cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95 hover:text-indigo-600 hover:border-indigo-300",
          isDragging && "cursor-grabbing scale-105",
          isHidden && "animate-pulse"
        )}
        title="Click to show text toolbar • Drag to move"
        aria-label="Show text toolbar"
      >
        <Type size={20} />
      </button>

      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        onClick={handleClick}
        style={toolbarStyles}
        className={cn(
          "flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50",
          "transition-all duration-300 ease-out w-[420px]",
          "max-h-[70vh] min-h-[180px]",
          isDragging && "cursor-grabbing select-none shadow-3xl scale-[1.02]",
          "ring-2 ring-indigo-500/20",
          !isDragging && "hover:shadow-3xl hover:scale-[1.01]",
          isHidden && "opacity-0 pointer-events-none scale-95",
          className
        )}
        role="toolbar"
        aria-label="Text formatting tools"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-100/50 rounded-t-3xl bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4 group">
            {/* Drag Handle Area */}
            <div 
              ref={dragHandleRef}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              className={cn(
                "flex items-center gap-4 cursor-grab active:cursor-grabbing flex-1",
                "transition-all duration-300 rounded-xl p-3 -m-3 border-2 border-transparent",
                "hover:bg-indigo-50/60 hover:border-indigo-200/50",
                isDragging && "cursor-grabbing bg-indigo-50/80 border-indigo-300/50 scale-[1.02]"
              )}
              title="Drag to move • Double-click to reset position"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                <Type size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-base truncate">
                  Text Formatting
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-mono text-xs">{currentFormatting.fontFamily}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="text-xs">{currentFormatting.fontSize}px</span>
                </div>
              </div>
              <div className="flex items-center text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
                <Grip size={16} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={resetPosition}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title="Reset position"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleCollapsed}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
              >
                {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleHidden}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 hover:scale-105"
                title="Hide toolbar"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed State */}
        {isCollapsed && (
          <div className="p-4 text-center">
            <div className="text-sm text-gray-500">Text formatting tools collapsed</div>
          </div>
        )}

        {/* Main Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Font and Size Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Type size={16} />
                  Font & Size
                </h3>
                
                <div className="flex gap-3">
                  {/* Font Family */}
                  <select
                    value={currentFormatting.fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>

                  {/* Font Size */}
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => adjustFontSize(-2)}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                      title="Decrease font size"
                    >
                      <Minus size={14} />
                    </button>
                    <select
                      value={currentFormatting.fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-16 p-1 bg-transparent text-center text-sm font-mono border-none focus:outline-none"
                    >
                      {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => adjustFontSize(2)}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                      title="Increase font size"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Formatting */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Formatting</h3>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleBold}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200",
                      currentFormatting.bold
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={16} />
                  </button>
                  
                  <button
                    onClick={toggleItalic}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200",
                      currentFormatting.italic
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={16} />
                  </button>
                  
                  <button
                    onClick={toggleUnderline}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200",
                      currentFormatting.underline
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline size={16} />
                  </button>
                  
                  <button
                    onClick={toggleStrikethrough}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200",
                      currentFormatting.strikethrough
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </button>
                  
                  <button
                    onClick={toggleHighlight}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200",
                      currentFormatting.highlight
                        ? "bg-yellow-500 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title="Highlight"
                  >
                    <Highlighter size={16} />
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Alignment</h3>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { align: 'left' as const, icon: AlignLeft, label: 'Left' },
                    { align: 'center' as const, icon: AlignCenter, label: 'Center' },
                    { align: 'right' as const, icon: AlignRight, label: 'Right' },
                    { align: 'justify' as const, icon: AlignJustify, label: 'Justify' },
                  ].map(({ align, icon: Icon, label }) => (
                    <button
                      key={align}
                      onClick={() => setAlignment(align)}
                      className={cn(
                        "flex-1 p-2.5 rounded-md transition-all duration-200",
                        currentFormatting.align === align
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                      title={label}
                    >
                      <Icon size={16} className="mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Palette size={16} />
                  Colors
                </h3>
                
                <div className="grid grid-cols-10 gap-2">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      onClick={() => setColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110",
                        currentFormatting.color === color
                          ? "border-indigo-500 shadow-lg"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingTextToolbar; 