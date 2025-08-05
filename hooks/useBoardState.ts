import { useState, useCallback } from 'react';
import { ILine, StickyNoteElement, FrameElement, TextElement, ShapeElement } from '@/types';
import { Tool } from '@/components/toolbar/MainToolbar';
import { getRandomStickyNoteColor } from '@/components/canvas/stickynote/StickyNote';

export interface UseBoardStateReturn {
  // Drawing state
  lines: ILine[];
  setLines: (lines: ILine[]) => void;
  
  // Sticky notes state
  stickyNotes: StickyNoteElement[];
  setStickyNotes: (notes: StickyNoteElement[]) => void;
  selectedStickyNote: string | null;
  setSelectedStickyNote: (id: string | null) => void;
  currentStickyNoteColor: string;
  setCurrentStickyNoteColor: (color: string) => void;
  
  // Frames state
  frames: FrameElement[];
  setFrames: (frames: FrameElement[]) => void;
  selectedFrame: string | null;
  setSelectedFrame: (id: string | null) => void;
  
  // Text elements state
  textElements: TextElement[];
  setTextElements: (elements: TextElement[]) => void;
  selectedTextElement: string | null;
  setSelectedTextElement: (id: string | null) => void;
  editingTextElement: string | null;
  setEditingTextElement: (id: string | null) => void;
  
  // Shapes state
  shapes: ShapeElement[];
  setShapes: (shapes: ShapeElement[]) => void;
  selectedShape: string | null;
  setSelectedShape: (id: string | null) => void;
  selectedShapes: string[];
  setSelectedShapes: (ids: string[]) => void;
  
  // History state
  history: unknown[];
  setHistory: (history: unknown[]) => void;
  historyIndex: number;
  setHistoryIndex: (index: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Tool state
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  
  // UI state
  showKeyboardShortcuts: boolean;
  setShowKeyboardShortcuts: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isCollaborationOpen: boolean;
  setIsCollaborationOpen: (open: boolean) => void;
  
  // Modal state
  showRenameModal: boolean;
  setShowRenameModal: (show: boolean) => void;
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  renamedBoard: { id: string; name: string } | null;
  setRenamedBoard: (board: { id: string; name: string } | null) => void;
  
  // Ownership state
  isOwner: boolean;
  setIsOwner: (isOwner: boolean) => void;
  
  // Drag state
  isDragInProgress: boolean;
  setIsDragInProgress: (dragging: boolean) => void;
  recentDragEnd: boolean;
  setRecentDragEnd: (recent: boolean) => void;
  
  // Presentation mode
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  
  // Selection handlers
  handleStickyNoteSelect: (stickyNoteId: string) => void;
  handleFrameSelect: (frameId: string) => void;
  handleTextElementSelect: (textElementId: string) => void;
  handleShapeSelect: (shapeId: string) => void;
  handleShapeMultiSelect: (shapeIds: string[]) => void;
  
  // Drag handlers
  handleStickyNoteDragStart: () => void;
  handleStickyNoteDragEnd: () => void;
  handleFrameDragStart: () => void;
  handleFrameDragEnd: () => void;
  handleTextElementDragStart: () => void;
  handleTextElementDragEnd: () => void;
  handleShapeDragStart: () => void;
  handleShapeDragEnd: () => void;
  
  // Clear selection
  clearSelections: () => void;
}

export function useBoardState(): UseBoardStateReturn {
  // Drawing state
  const [lines, setLines] = useState<ILine[]>([]);
  
  // Sticky notes state
  const [stickyNotes, setStickyNotes] = useState<StickyNoteElement[]>([]);
  const [selectedStickyNote, setSelectedStickyNote] = useState<string | null>(null);
  const [currentStickyNoteColor, setCurrentStickyNoteColor] = useState(getRandomStickyNoteColor());
  
  // Frames state
  const [frames, setFrames] = useState<FrameElement[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  
  // Text elements state
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [editingTextElement, setEditingTextElement] = useState<string | null>(null);
  
  // Shapes state
  const [shapes, setShapes] = useState<ShapeElement[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  
  // History state
  const [history, setHistory] = useState<unknown[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Tool state
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // UI state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  
  // Modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [renamedBoard, setRenamedBoard] = useState<{ id: string; name: string } | null>(null);
  
  // Ownership state
  const [isOwner, setIsOwner] = useState(false);
  
  // Drag state tracking to prevent post-drag clicks
  const [isDragInProgress, setIsDragInProgress] = useState(false);
  const [recentDragEnd, setRecentDragEnd] = useState(false);
  
  // Presentation mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  // Calculate canUndo and canRedo based on current state
  const canUndo = history.length > 0 && historyIndex >= 0;
  const canRedo = history.length > 0 && historyIndex < history.length - 1;
  
  // Selection handlers
  const handleStickyNoteSelect = useCallback((stickyNoteId: string) => {
    // Always select the clicked sticky note (no toggle behavior)
    setSelectedStickyNote(stickyNoteId);
  }, []);
  
  const handleFrameSelect = useCallback((frameId: string) => {
    // Always select the clicked frame (no toggle behavior)
    setSelectedFrame(frameId);
  }, []);
  
  const handleTextElementSelect = useCallback((textElementId: string) => {
    // Always select the clicked text element (no toggle behavior)
    setSelectedTextElement(textElementId);
  }, []);
  
  const handleShapeSelect = useCallback((shapeId: string) => {
    // Always select the clicked shape (no toggle behavior)
    setSelectedShape(shapeId);
    setSelectedShapes([shapeId]);
  }, []);
  
  const handleShapeMultiSelect = useCallback((shapeIds: string[]) => {
    // Set multiple selected shapes
    setSelectedShapes(shapeIds);
    setSelectedShape(shapeIds.length > 0 ? shapeIds[0] : null);
  }, []);
  
  // Drag handlers
  const handleStickyNoteDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);
  
  const handleStickyNoteDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    
    // Clear the recent drag flag after a short delay
    setTimeout(() => {
      setRecentDragEnd(false);
    }, 150); // 150ms delay to prevent immediate canvas clicks
  }, []);
  
  const handleFrameDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);
  
  const handleFrameDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    
    // Clear the recent drag flag after a short delay
    setTimeout(() => {
      setRecentDragEnd(false);
    }, 150); // 150ms delay to prevent immediate canvas clicks
  }, []);
  
  const handleTextElementDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);
  
  const handleTextElementDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    
    // Clear the recent drag flag after a short delay
    setTimeout(() => {
      setRecentDragEnd(false);
    }, 150); // 150ms delay to prevent immediate canvas clicks
  }, []);
  
  const handleShapeDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);
  
  const handleShapeDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    
    // Clear the recent drag flag after a short delay
    setTimeout(() => {
      setRecentDragEnd(false);
    }, 150); // 150ms delay to prevent immediate canvas clicks
  }, []);
  
  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedStickyNote(null);
    setSelectedFrame(null);
    setSelectedTextElement(null);
    setEditingTextElement(null);
    setSelectedShape(null);
    setSelectedShapes([]);
  }, []);
  
  return {
    // Drawing state
    lines,
    setLines,
    
    // Sticky notes state
    stickyNotes,
    setStickyNotes,
    selectedStickyNote,
    setSelectedStickyNote,
    currentStickyNoteColor,
    setCurrentStickyNoteColor,
    
    // Frames state
    frames,
    setFrames,
    selectedFrame,
    setSelectedFrame,
    
    // Text elements state
    textElements,
    setTextElements,
    selectedTextElement,
    setSelectedTextElement,
    editingTextElement,
    setEditingTextElement,
    
    // Shapes state
    shapes,
    setShapes,
    selectedShape,
    setSelectedShape,
    selectedShapes,
    setSelectedShapes,
    
    // History state
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    canUndo,
    canRedo,
    
    // Tool state
    tool,
    setTool,
    color,
    setColor,
    strokeWidth,
    setStrokeWidth,
    
    // UI state
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    showGrid,
    setShowGrid,
    isSidebarOpen,
    setIsSidebarOpen,
    isCollaborationOpen,
    setIsCollaborationOpen,
    
    // Modal state
    showRenameModal,
    setShowRenameModal,
    showInviteModal,
    setShowInviteModal,
    showSuccessModal,
    setShowSuccessModal,
    renamedBoard,
    setRenamedBoard,
    
    // Ownership state
    isOwner,
    setIsOwner,
    
    // Drag state
    isDragInProgress,
    setIsDragInProgress,
    recentDragEnd,
    setRecentDragEnd,
    
    // Presentation mode
    isPresentationMode,
    setIsPresentationMode,
    
    // Selection handlers
    handleStickyNoteSelect,
    handleFrameSelect,
    handleTextElementSelect,
    handleShapeSelect,
    handleShapeMultiSelect,
    
    // Drag handlers
    handleStickyNoteDragStart,
    handleStickyNoteDragEnd,
    handleFrameDragStart,
    handleFrameDragEnd,
    handleTextElementDragStart,
    handleTextElementDragEnd,
    handleShapeDragStart,
    handleShapeDragEnd,
    
    // Clear selection
    clearSelections
  };
}