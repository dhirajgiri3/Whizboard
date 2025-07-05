import { useState, useRef, useCallback, useEffect } from 'react';

export interface FloatingToolbarPosition {
  x: number;
  y: number;
}

export interface FloatingToolbarState {
  isVisible: boolean;
  isHidden: boolean;
  isCollapsed: boolean;
  isDragging: boolean;
  position: FloatingToolbarPosition;
}

export interface UseFloatingToolbarDragOptions {
  toolbarId: string;
  initialPosition?: FloatingToolbarPosition;
  minWidth?: number;
  minHeight?: number;
  storageKey?: string;
  onVisibilityChange?: (visible: boolean) => void;
  onPositionChange?: (position: FloatingToolbarPosition) => void;
}

export function useFloatingToolbarDrag({
  toolbarId,
  initialPosition = { x: 24, y: 80 },
  minWidth = 300,
  minHeight = 100,
  storageKey,
  onVisibilityChange,
  onPositionChange,
}: UseFloatingToolbarDragOptions) {
  const storageKeyFinal = storageKey || `cyperboard-${toolbarId}-toolbar`;
  
  // Load saved state from localStorage
  const loadSavedState = useCallback((): FloatingToolbarState => {
    if (typeof window === 'undefined') {
      return {
        isVisible: true,
        isHidden: false,
        isCollapsed: false,
        isDragging: false,
        position: initialPosition,
      };
    }

    try {
      const saved = localStorage.getItem(storageKeyFinal);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          isVisible: parsed.isVisible ?? true,
          isHidden: parsed.isHidden ?? false,
          isCollapsed: parsed.isCollapsed ?? false,
          isDragging: false,
          position: parsed.position ?? initialPosition,
        };
      }
    } catch (error) {
      console.warn(`Failed to load saved state for ${toolbarId}:`, error);
    }

    return {
      isVisible: true,
      isHidden: false,
      isCollapsed: false,
      isDragging: false,
      position: initialPosition,
    };
  }, [toolbarId, initialPosition, storageKeyFinal]);

  // State management
  const [state, setState] = useState<FloatingToolbarState>(loadSavedState);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const eyeButtonRef = useRef<HTMLButtonElement>(null);

  // Save state to localStorage
  const saveState = useCallback((newState: Partial<FloatingToolbarState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKeyFinal, JSON.stringify({
          isVisible: updatedState.isVisible,
          isHidden: updatedState.isHidden,
          isCollapsed: updatedState.isCollapsed,
          position: updatedState.position,
        }));
      } catch (error) {
        console.warn(`Failed to save state for ${toolbarId}:`, error);
      }
    }

    if (newState.position && onPositionChange) {
      onPositionChange(newState.position);
    }
  }, [state, storageKeyFinal, toolbarId, onPositionChange]);

  // Enhanced mouse handlers with proper cursor following
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!toolbarRef.current) return;

    const rect = toolbarRef.current.getBoundingClientRect();
    const newDragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setDragOffset(newDragOffset);
    saveState({ isDragging: true });

    // Enhanced visual feedback
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Add dragging class to body for global styles
    document.body.classList.add('toolbar-dragging');
  }, [saveState]);

  // Eye button mouse handlers for dragging when hidden
  const handleEyeMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate offset from eye button position
    const newDragOffset = {
      x: 8, // Eye button offset from toolbar position
      y: 8,
    };

    setDragOffset(newDragOffset);
    saveState({ isDragging: true });

    // Enhanced visual feedback
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Add dragging class to body for global styles
    document.body.classList.add('toolbar-dragging');
  }, [saveState]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!state.isDragging || !toolbarRef.current) return;

    e.preventDefault();

    // Calculate new position with proper cursor following
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Enhanced boundary constraints
    const padding = 16;
    const toolbar = toolbarRef.current;
    const maxX = window.innerWidth - toolbar.offsetWidth - padding;
    const maxY = window.innerHeight - toolbar.offsetHeight - padding;

    const constrainedPosition = {
      x: Math.max(padding, Math.min(newX, maxX)),
      y: Math.max(padding, Math.min(newY, maxY)),
    };

    saveState({ position: constrainedPosition });
  }, [state.isDragging, dragOffset, saveState]);

  const handleMouseUp = useCallback(() => {
    if (!state.isDragging) return;

    saveState({ isDragging: false });
    
    // Reset cursor and selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.classList.remove('toolbar-dragging');
  }, [state.isDragging, saveState]);

  // Position constraint handler for window resize
  const constrainPosition = useCallback(() => {
    if (!toolbarRef.current) return;

    const toolbar = toolbarRef.current;
    const padding = 16;
    const maxX = window.innerWidth - toolbar.offsetWidth - padding;
    const maxY = window.innerHeight - toolbar.offsetHeight - padding;

    const constrainedPosition = {
      x: Math.max(padding, Math.min(state.position.x, maxX)),
      y: Math.max(padding, Math.min(state.position.y, maxY)),
    };

    if (constrainedPosition.x !== state.position.x || constrainedPosition.y !== state.position.y) {
      saveState({ position: constrainedPosition });
    }
  }, [state.position, saveState]);

  // Double-click to reset position
  const handleDoubleClick = useCallback(() => {
    saveState({ position: initialPosition });
  }, [saveState, initialPosition]);

  // Enhanced visibility controls
  const toggleVisibility = useCallback(() => {
    const newVisible = !state.isVisible;
    saveState({ isVisible: newVisible });
    
    if (onVisibilityChange) {
      onVisibilityChange(newVisible);
    }
  }, [state.isVisible, saveState, onVisibilityChange]);

  const toggleHidden = useCallback(() => {
    const newHidden = !state.isHidden;
    saveState({ isHidden: newHidden });
  }, [state.isHidden, saveState]);

  const toggleCollapsed = useCallback(() => {
    saveState({ isCollapsed: !state.isCollapsed });
  }, [state.isCollapsed, saveState]);

  const resetPosition = useCallback(() => {
    saveState({ position: initialPosition });
  }, [saveState, initialPosition]);

  // Event listeners
  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    window.addEventListener('resize', constrainPosition);
    return () => window.removeEventListener('resize', constrainPosition);
  }, [constrainPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + H to toggle hidden state
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggleHidden();
      }

      // Ctrl/Cmd + T to toggle collapsed state
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleCollapsed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleHidden, toggleCollapsed]);

  // Prevent click events during drag
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (state.isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [state.isDragging]);

  // Generate toolbar styles
  const toolbarStyles = {
    position: 'fixed' as const,
    left: state.position.x,
    top: state.position.y,
    zIndex: 50,
    transform: state.isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: state.isDragging ? 'none' : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: state.isVisible && !state.isHidden ? 1 : 0,
    visibility: state.isVisible && !state.isHidden ? 'visible' as const : 'hidden' as const,
    cursor: state.isDragging ? 'grabbing' : 'default',
    pointerEvents: state.isVisible && !state.isHidden ? 'auto' as const : 'none' as const,
  };

  const eyeButtonStyles = {
    position: 'fixed' as const,
    left: state.position.x + (state.isHidden ? 8 : 16),
    top: state.position.y + (state.isHidden ? 8 : 16),
    zIndex: 60,
    opacity: state.isHidden ? 1 : 0,
    visibility: state.isHidden ? 'visible' as const : 'hidden' as const,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: state.isHidden ? 'auto' as const : 'none' as const,
  };

      return {
    // State
    ...state,
    
    // Refs
    toolbarRef,
    dragHandleRef,
    eyeButtonRef,
    
    // Handlers
    handleMouseDown,
    handleEyeMouseDown,
    handleDoubleClick,
    handleClick,
    
    // Controls
    toggleVisibility,
    toggleHidden,
    toggleCollapsed,
    resetPosition,
    
    // Styles
    toolbarStyles,
    eyeButtonStyles,
    
    // Utility
    saveState,
  };
}

export default useFloatingToolbarDrag;
