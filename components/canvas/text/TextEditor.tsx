import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TextElement } from '@/types';
import { cn, createDefaultTextFormatting, mergeTextFormatting } from '@/lib/utils/utils';
import { 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  Palette, 
  Check, 
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus
} from 'lucide-react';

interface TextEditorProps {
  textElement: TextElement | null;
  isVisible: boolean;
  onUpdateAction: (textElement: TextElement) => void;
  onFinishEditingAction: () => void;
  stageScale?: number;
  stagePosition?: { x: number; y: number };
  isMobile?: boolean;
  isTablet?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  textElement,
  isVisible,
  onUpdateAction,
  onFinishEditingAction,
  stageScale = 1,
  stagePosition = { x: 0, y: 0 },
  isMobile = false,
  isTablet = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(textElement?.text || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  // Calculate position and size based on stage transform
  const editorPosition = {
    x: (textElement?.x * stageScale) + stagePosition.x,
    y: (textElement?.y * stageScale) + stagePosition.y,
    width: Math.max(textElement?.width * stageScale, 120),
    height: Math.max(textElement?.height * stageScale, 40),
  };

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !textElement) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const minHeight = Math.max((textElement.height || 50) * stageScale, 40);
    textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;

    // Update element height if needed
    const currentHeight = textElement.height || 50;
    const newHeight = Math.max(scrollHeight / stageScale, currentHeight);
    if (Math.abs(newHeight - currentHeight) > 5) {
      const updatedElement: TextElement = {
        ...textElement,
        height: newHeight,
        updatedAt: Date.now(),
        version: (textElement.version || 0) + 1,
      };
      onUpdateAction(updatedElement);
    }
  }, [textElement, stageScale, onUpdateAction]);

  // Debounced text update to prevent excessive updates
  const updateTextDebounced = useCallback((newText: string) => {
    if (!textElement) return;
    
    const updatedElement: TextElement = {
      ...textElement,
      text: newText,
      updatedAt: Date.now(),
      version: (textElement.version || 0) + 1,
    };
    onUpdateAction(updatedElement);
  }, [textElement, onUpdateAction]);

  // Handle text change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    adjustHeight();
    
    // Only update if not composing (for better IME support)
    if (!isComposing) {
      updateTextDebounced(newText);
    }
  }, [adjustHeight, updateTextDebounced, isComposing]);

  // Handle composition events for better IME support
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setIsComposing(false);
    const newText = (e.target as HTMLTextAreaElement).value;
    setText(newText);
    updateTextDebounced(newText);
  }, [updateTextDebounced]);

  // Format update handler
  const updateFormatting = useCallback((updates: Partial<TextElement['formatting']>) => {
    if (!textElement) return;

    const updatedElement: TextElement = {
      ...textElement,
      formatting: mergeTextFormatting(textElement.formatting, updates),
      updatedAt: Date.now(),
      version: (textElement.version || 0) + 1,
    };
    onUpdateAction(updatedElement);
  }, [textElement, onUpdateAction]);

  // Handle keyboard shortcuts and prevent conflicts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Always prevent event propagation to canvas
    e.stopPropagation();

    // Handle special keys that should finish editing
    if (e.key === 'Escape') {
      e.preventDefault();
      onFinishEditingAction();
      return;
    }

    // Handle Ctrl/Cmd + Enter to finish editing
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onFinishEditingAction();
      return;
    }

    // Handle formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      let formatting: Partial<TextElement['formatting']> | null = null;

      if (!textElement) return;

      const currentFormatting = mergeTextFormatting(textElement.formatting);

      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatting = { bold: !currentFormatting.bold };
          break;
        case 'i':
          e.preventDefault();
          formatting = { italic: !currentFormatting.italic };
          break;
        case 'u':
          e.preventDefault();
          formatting = { underline: !currentFormatting.underline };
          break;
        // Prevent other shortcuts from propagating
        case 'z':
        case 'y':
        case 's':
        case 'a':
        case 'c':
        case 'v':
        case 'x':
          e.stopPropagation();
          break;
      }

      if (formatting) {
        updateFormatting(formatting);
      }
    }

    // Tab key should insert tab
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.substring(0, start) + '  ' + text.substring(end); // 2 spaces instead of tab
      setText(newText);
      updateTextDebounced(newText);
      
      // Set cursor position after spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [textElement, updateFormatting, onFinishEditingAction, text, updateTextDebounced]);

  // Handle key up to prevent propagation
  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  }, []);

  // Handle blur (finish editing when clicking outside)
  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Check if the new focus target is within our container
    const relatedTarget = e.relatedTarget as Element;
    if (containerRef.current && relatedTarget && containerRef.current.contains(relatedTarget)) {
      return; // Don't finish editing if focusing within our container
    }

    setIsFocused(false);
    setShowToolbar(false);
    // Small delay to allow for toolbar interactions
    setTimeout(() => {
      onFinishEditingAction();
    }, 150);
  }, [onFinishEditingAction]);

  // Focus and select text when becoming visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      // Small delay to ensure proper rendering
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          if (textElement?.text === 'Type your text here...') {
            textareaRef.current.select();
          }
          setIsFocused(true);
          setShowToolbar(true);
          adjustHeight();
        }
      }, 50);
    }
  }, [isVisible, adjustHeight, textElement?.text]);

  // Update text when textElement changes externally
  useEffect(() => {
    if (textElement?.text !== text && !isFocused) {
      setText(textElement.text);
    }
  }, [textElement?.text, text, isFocused]);

  // Apply text formatting styles
  const getTextStyle = useCallback((): React.CSSProperties => {
    if (!textElement) {
      const defaultFormatting = createDefaultTextFormatting();
      return {
        fontFamily: defaultFormatting.fontFamily,
        fontSize: `${defaultFormatting.fontSize * stageScale}px`,
        color: defaultFormatting.color,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: defaultFormatting.align,
        lineHeight: defaultFormatting.lineHeight,
        letterSpacing: `${defaultFormatting.letterSpacing}px`,
        textTransform: defaultFormatting.textTransform,
        backgroundColor: 'transparent',
        opacity: 1,
      };
    }

    const formatting = mergeTextFormatting(textElement.formatting);
    const style = textElement.style || { opacity: 1 };
    
    return {
      fontFamily: formatting.fontFamily,
      fontSize: `${formatting.fontSize * stageScale}px`,
      color: formatting.color,
      fontWeight: formatting.bold ? 'bold' : 'normal',
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: [
        formatting.underline ? 'underline' : '',
        formatting.strikethrough ? 'line-through' : '',
      ].filter(Boolean).join(' ') || 'none',
      textAlign: formatting.align,
      lineHeight: formatting.lineHeight,
      letterSpacing: `${formatting.letterSpacing}px`,
      textTransform: formatting.textTransform,
      backgroundColor: formatting.highlight ? formatting.highlightColor : 'transparent',
      opacity: style.opacity,
    };
  }, [textElement, stageScale]);

  // Prevent all mouse events from propagating to canvas
  const handleMouseEvent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Finish editing handler
  const handleFinish = useCallback(() => {
    onFinishEditingAction();
  }, [onFinishEditingAction]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-[9999] pointer-events-auto"
      style={{
        left: `${editorPosition.x}px`,
        top: `${editorPosition.y}px`,
        width: `${editorPosition.width}px`,
        minHeight: `${editorPosition.height}px`,
      }}
      onMouseDown={handleMouseEvent}
      onMouseUp={handleMouseEvent}
      onClick={handleMouseEvent}
      onDoubleClick={handleMouseEvent}
    >
      {/* Modern editing container */}
      <div className="relative">
        {/* Background with glassmorphism effect */}
        <div
          className="absolute inset-0 bg-white/90 backdrop-blur-md border-2 border-blue-400/60 rounded-xl shadow-2xl"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)',
          }}
        />

        {/* Text editor */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={handleBlur}
          onFocus={() => {
            setIsFocused(true);
            setShowToolbar(true);
          }}
          placeholder="Start typing..."
          className={cn(
            "relative w-full bg-transparent border-none outline-none resize-none",
            "selection:bg-blue-200 selection:text-blue-900",
            "placeholder:text-gray-500 placeholder:font-normal placeholder:italic",
            "focus:ring-0 focus:outline-none",
            "text-gray-900"
          )}
          style={{
            ...getTextStyle(),
            padding: '12px 16px',
            minHeight: `${editorPosition.height}px`,
            borderRadius: '12px',
            // Ensure good contrast for placeholder
            color: text.trim() === '' ? '#6b7280' : getTextStyle().color,
          }}
          spellCheck={true}
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          rows={1}
        />

        {/* Floating Toolbar */}
        {showToolbar && (
          <div className="absolute -top-16 left-0 right-0 flex justify-center">
            <div className="bg-white/98 backdrop-blur-xl border border-gray-300/80 rounded-xl shadow-2xl px-3 py-2 flex items-center space-x-1 ring-1 ring-black/5">
              {/* Font Size Controls */}
              <div className="flex items-center space-x-1 pr-2 border-r border-gray-300/60">
                <button
                  onClick={() => updateFormatting({ fontSize: Math.max(8, (textElement?.formatting?.fontSize || 16) - 2) })}
                  className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
                  title="Decrease font size"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-semibold min-w-[24px] text-center text-gray-800 bg-gray-100/50 px-2 py-1 rounded">
                  {textElement?.formatting?.fontSize || 16}
                </span>
                <button
                  onClick={() => updateFormatting({ fontSize: Math.min(72, (textElement?.formatting?.fontSize || 16) + 2) })}
                  className="p-1.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
                  title="Increase font size"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Formatting Controls */}
              <button
                onClick={() => updateFormatting({ bold: !(textElement?.formatting?.bold || false) })}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  textElement?.formatting?.bold 
                    ? "bg-blue-500 text-white shadow-sm" 
                    : "hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900"
                )}
                title="Bold (Ctrl+B)"
              >
                <Bold size={14} />
              </button>
              
              <button
                onClick={() => updateFormatting({ italic: !(textElement?.formatting?.italic || false) })}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  textElement?.formatting?.italic 
                    ? "bg-blue-500 text-white shadow-sm" 
                    : "hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900"
                )}
                title="Italic (Ctrl+I)"
              >
                <Italic size={14} />
              </button>
              
              <button
                onClick={() => updateFormatting({ underline: !(textElement?.formatting?.underline || false) })}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  textElement?.formatting?.underline 
                    ? "bg-blue-500 text-white shadow-sm" 
                    : "hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900"
                )}
                title="Underline (Ctrl+U)"
              >
                <Underline size={14} />
              </button>

              {/* Alignment Controls */}
              <div className="flex items-center space-x-1 px-2 border-l border-gray-300/60">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateFormatting({ align })}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      (textElement?.formatting?.align || 'left') === align 
                        ? "bg-blue-500 text-white shadow-sm" 
                        : "hover:bg-gray-100 active:bg-gray-200 text-gray-700 hover:text-gray-900"
                    )}
                    title={`Align ${align}`}
                  >
                    {align === 'left' && <AlignLeft size={14} />}
                    {align === 'center' && <AlignCenter size={14} />}
                    {align === 'right' && <AlignRight size={14} />}
                  </button>
                ))}
              </div>

              {/* Color Picker */}
              <div className="flex items-center space-x-1 px-2 border-l border-gray-300/60">
                <div className="relative">
                  <input
                    type="color"
                    value={textElement?.formatting?.color || '#000000'}
                    onChange={(e) => updateFormatting({ color: e.target.value })}
                    className="w-6 h-6 rounded border border-gray-300 cursor-pointer shadow-sm"
                    title="Text color"
                  />
                  <div 
                    className="absolute inset-0 rounded border border-gray-300 pointer-events-none ring-1 ring-black/10"
                    style={{ backgroundColor: textElement?.formatting?.color || '#000000' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 pl-2 border-l border-gray-300/60">
                <button
                  onClick={handleFinish}
                  className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 active:bg-green-700 transition-colors shadow-sm"
                  title="Finish editing (Esc)"
                >
                  <Check size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="absolute -bottom-8 left-0 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Editing • Press Esc to finish</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor; 