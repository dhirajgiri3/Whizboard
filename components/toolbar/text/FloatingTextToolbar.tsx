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
  className?: string;
}

// Font family options
const FONT_FAMILIES = [
  'Comic Sans MS',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
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

// Color presets with better contrast and organization
const COLOR_PRESETS = [
  // Grays and blacks
  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
  // Reds
  '#dc2626', '#ef4444', '#f87171', '#fca5a5',
  // Oranges
  '#ea580c', '#f97316', '#fb923c', '#fdba74',
  // Yellows
  '#ca8a04', '#eab308', '#facc15', '#fde047',
  // Greens
  '#16a34a', '#22c55e', '#4ade80', '#86efac',
  // Teals
  '#0d9488', '#14b8a6', '#5eead4', '#99f6e4',
  // Blues
  '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  // Indigos
  '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc',
  // Purples
  '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
  // Pinks
  '#db2777', '#ec4899', '#f472b6', '#f9a8d4',
  // White
  '#ffffff', '#f9fafb',
];

const FloatingTextToolbar: React.FC<FloatingTextToolbarProps> = ({
  isActive = false,
  selectedTextElements = [],
  onTextUpdateAction,
  className = '',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Get current formatting from selected text
  const currentFormatting = useMemo(() => {
    if (selectedTextElements.length === 0) {
      return {
        fontFamily: 'Comic Sans MS',
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
    if (selectedTextElements.length === 0) {
      return;
    }
    
    if (!onTextUpdateAction) {
      return;
    }
    
    // Only update each selected text element directly
    selectedTextElements.forEach(textElement => {
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
    });
  }, [selectedTextElements, onTextUpdateAction]);

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
          "w-14 h-14 rounded-2xl bg-white/98 backdrop-blur-xl border border-gray-200/80",
          "flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300",
          "text-gray-700 hover:bg-white group cursor-grab active:cursor-grabbing",
          "hover:scale-105 active:scale-95 hover:text-blue-600 hover:border-blue-300/60",
          "ring-1 ring-black/5",
          isDragging && "cursor-grabbing scale-105 shadow-xl",
          isHidden && "animate-pulse opacity-80"
        )}
        title="Click to show text toolbar • Drag to move"
        aria-label="Show text toolbar"
      >
        <Type size={20} className="drop-shadow-sm" />
      </button>

      {/* Main Toolbar */}
      <div
        ref={toolbarRef}
        onClick={handleClick}
        style={toolbarStyles}
        className={cn(
          "flex flex-col bg-white/98 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/60",
          "transition-all duration-300 ease-out w-[420px]",
          "max-h-[70vh] min-h-[180px]",
          "ring-1 ring-black/5",
          isDragging && "cursor-grabbing select-none shadow-2xl scale-[1.02]",
          !isDragging && "hover:shadow-2xl hover:scale-[1.01]",
          isHidden && "opacity-0 pointer-events-none scale-95",
          className
        )}
        role="toolbar"
        aria-label="Text formatting tools"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-100 rounded-t-2xl bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4 group">
            {/* Drag Handle Area */}
            <div 
              ref={dragHandleRef}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              className={cn(
                "flex items-center gap-3 cursor-grab active:cursor-grabbing flex-1",
                "transition-all duration-300 rounded-xl p-3 -m-3 border-2 border-transparent",
                "hover:bg-blue-50/80 hover:border-blue-200/60",
                isDragging && "cursor-grabbing bg-blue-50/90 border-blue-300/60 scale-[1.02]"
              )}
              title="Drag to move • Double-click to reset position"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-blue-500 to-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <Type size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-base truncate">
                  Text Formatting
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{currentFormatting.fontFamily}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="text-xs font-medium">{currentFormatting.fontSize}px</span>
                </div>
              </div>
              <div className="flex items-center text-gray-500 opacity-60 group-hover:opacity-100 transition-opacity">
                <Grip size={16} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 ml-4">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={resetPosition}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95"
                title="Reset position"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleCollapsed}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95"
                title={isCollapsed ? "Expand toolbar" : "Collapse toolbar"}
              >
                {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={toggleHidden}
                className="p-2.5 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95"
                title="Hide toolbar"
              >
                <EyeOff size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Collapsed State */}
        {isCollapsed && (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-600 font-medium">Text formatting tools collapsed</div>
            <div className="text-xs text-gray-500 mt-1">Click expand to show all options</div>
          </div>
        )}

        {/* Main Content */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-5 space-y-6">
              {/* Font and Size Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Type size={16} className="text-blue-600" />
                  Font & Size
                </h3>
                
                <div className="flex gap-3">
                  {/* Font Family */}
                  <select
                    value={currentFormatting.fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="flex-1 p-2.5 text-gray-600 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option className='text-gray-600' key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>

                  {/* Font Size */}
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button
                      onClick={() => adjustFontSize(-2)}
                      className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-gray-800 active:scale-95"
                      title="Decrease font size"
                    >
                      <Minus size={14} />
                    </button>
                    <select
                      value={currentFormatting.fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-16 p-1 bg-transparent text-center text-sm font-mono border-none focus:outline-none text-gray-800"
                    >
                      {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => adjustFontSize(2)}
                      className="p-2 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-gray-800 active:scale-95"
                      title="Increase font size"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Text Formatting */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Bold size={16} className="text-blue-600" />
                  Formatting
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={toggleBold}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      currentFormatting.bold
                        ? "bg-blue-600 text-white shadow-md border-blue-600 hover:bg-blue-700"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={16} />
                  </button>
                  
                  <button
                    onClick={toggleItalic}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      currentFormatting.italic
                        ? "bg-blue-600 text-white shadow-md border-blue-600 hover:bg-blue-700"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={16} />
                  </button>
                  
                  <button
                    onClick={toggleUnderline}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      currentFormatting.underline
                        ? "bg-blue-600 text-white shadow-md border-blue-600 hover:bg-blue-700"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                    title="Underline (Ctrl+U)"
                  >
                    <Underline size={16} />
                  </button>
                  
                  <button
                    onClick={toggleStrikethrough}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      currentFormatting.strikethrough
                        ? "bg-blue-600 text-white shadow-md border-blue-600 hover:bg-blue-700"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                    title="Strikethrough"
                  >
                    <Strikethrough size={16} />
                  </button>
                  
                  <button
                    onClick={toggleHighlight}
                    className={cn(
                      "p-2.5 rounded-lg transition-all duration-200 border",
                      currentFormatting.highlight
                        ? "bg-yellow-500 text-white shadow-md border-yellow-500 hover:bg-yellow-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    )}
                    title="Highlight"
                  >
                    <Highlighter size={16} />
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <AlignLeft size={16} className="text-blue-600" />
                  Alignment
                </h3>
                
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
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
                          ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                          : "text-gray-600 hover:bg-white/60 hover:text-gray-800"
                      )}
                      title={label}
                    >
                      <Icon size={16} className="mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Palette size={16} className="text-blue-600" />
                  Text Color
                </h3>
                
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {COLOR_PRESETS.map(color => (
                    <button
                      key={color}
                      onClick={() => setColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 active:scale-95",
                        "shadow-sm hover:shadow-md",
                        currentFormatting.color === color
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : color === '#ffffff' 
                            ? "border-gray-300 hover:border-gray-400"
                            : "border-gray-200 hover:border-gray-300"
                      )}
                      style={{ 
                        backgroundColor: color,
                        ...(color === '#ffffff' && { 
                          backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
                          backgroundSize: '8px 8px',
                          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                        })
                      }}
                      title={`Set color to ${color}`}
                    />
                  ))}
                </div>
                
                {/* Current color indicator */}
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                  <span>Current:</span>
                  <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: currentFormatting.color }}
                  />
                  <span className="font-mono">{currentFormatting.color}</span>
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