import { useState, useCallback, useRef } from 'react';
import { FrameElement } from '@/types';
import { 
  createFrame, 
  createFrameFromTemplate, 
  duplicateFrame, 
  FRAME_TEMPLATES,
  FRAME_TYPES 
} from '@/lib/utils/FrameUtils';

interface FrameManagerState {
  frames: FrameElement[];
  selectedFrameIds: string[];
  history: {
    past: FrameElement[][];
    present: FrameElement[];
    future: FrameElement[][];
  };
  clipboard: FrameElement[];
}

interface FrameManagerHook {
  frames: FrameElement[];
  selectedFrameIds: string[];
  
  // Frame operations
  createNewFrame: (x: number, y: number, template?: keyof typeof FRAME_TEMPLATES) => void;
  updateFrame: (frameId: string, updates: Partial<FrameElement>) => void;
  deleteFrame: (frameId: string) => void;
  duplicateFrames: (frameIds: string[]) => void;
  
  // Selection operations
  selectFrame: (frameId: string, multiSelect?: boolean) => void;
  selectFrames: (frameIds: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Clipboard operations
  copyFrames: (frameIds: string[]) => void;
  pasteFrames: (x: number, y: number) => void;
  cutFrames: (frameIds: string[]) => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Bulk operations
  groupFrames: (frameIds: string[]) => void;
  alignFrames: (frameIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeFrames: (frameIds: string[], direction: 'horizontal' | 'vertical') => void;
  
  // Import/Export
  exportFrames: (frameIds: string[]) => string;
  importFrames: (data: string, x: number, y: number) => void;
  
  // Direct replace of frames (server sync)
  replaceFrames: (newFrames: FrameElement[]) => void;
  addFrame: (frame: FrameElement) => void;
}

export function useFrameManager(initialFrames: FrameElement[] = []): FrameManagerHook {
  const [state, setState] = useState<FrameManagerState>({
    frames: initialFrames,
    selectedFrameIds: [],
    history: {
      past: [],
      present: initialFrames,
      future: [],
    },
    clipboard: [],
  });

  const nextFrameId = useRef(1);

  // History management
  const addToHistory = useCallback((newFrames: FrameElement[]) => {
    setState(prev => ({
      ...prev,
      frames: newFrames,
      history: {
        past: [...prev.history.past, prev.history.present],
        present: newFrames,
        future: [],
      },
    }));
  }, []);

  // Frame operations
  const createNewFrame = useCallback((x: number, y: number, template?: keyof typeof FRAME_TEMPLATES) => {
    let newFrame: FrameElement;
    
    if (template && template in FRAME_TEMPLATES) {
      newFrame = createFrameFromTemplate(template, x, y);
    } else {
      newFrame = createFrame({
        x,
        y,
        width: 300,
        height: 200,
        name: `Frame ${nextFrameId.current++}`,
      });
    }
    
    const newFrames = [...state.frames, newFrame];
    addToHistory(newFrames);
    
    // Auto-select the new frame
    setState(prev => ({
      ...prev,
      selectedFrameIds: [newFrame.id],
    }));
  }, [state.frames, addToHistory]);

  const updateFrame = useCallback((frameId: string, updates: Partial<FrameElement>) => {
    const newFrames = state.frames.map(frame =>
      frame.id === frameId
        ? { ...frame, ...updates, updatedAt: Date.now() }
        : frame
    );
    addToHistory(newFrames);
  }, [state.frames, addToHistory]);

  const deleteFrame = useCallback((frameId: string) => {
    const newFrames = state.frames.filter(frame => frame.id !== frameId);
    addToHistory(newFrames);
    
    // Remove from selection
    setState(prev => ({
      ...prev,
      selectedFrameIds: prev.selectedFrameIds.filter(id => id !== frameId),
    }));
  }, [state.frames, addToHistory]);

  const duplicateFrames = useCallback((frameIds: string[]) => {
    const framesToDuplicate = state.frames.filter(frame => frameIds.includes(frame.id));
    const duplicatedFrames = framesToDuplicate.map(frame => duplicateFrame(frame));
    const newFrames = [...state.frames, ...duplicatedFrames];
    
    addToHistory(newFrames);
    
    // Select the duplicated frames
    setState(prev => ({
      ...prev,
      selectedFrameIds: duplicatedFrames.map(frame => frame.id),
    }));
  }, [state.frames, addToHistory]);

  // Selection operations
  const selectFrame = useCallback((frameId: string, multiSelect = false) => {
    setState(prev => {
      if (multiSelect) {
        const isSelected = prev.selectedFrameIds.includes(frameId);
        return {
          ...prev,
          selectedFrameIds: isSelected
            ? prev.selectedFrameIds.filter(id => id !== frameId)
            : [...prev.selectedFrameIds, frameId],
        };
      } else {
        return {
          ...prev,
          selectedFrameIds: [frameId],
        };
      }
    });
  }, []);

  const selectFrames = useCallback((frameIds: string[]) => {
    setState(prev => ({
      ...prev,
      selectedFrameIds: frameIds,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFrameIds: [],
    }));
  }, []);

  const selectAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedFrameIds: prev.frames.map(frame => frame.id),
    }));
  }, []);

  // Clipboard operations
  const copyFrames = useCallback((frameIds: string[]) => {
    const framesToCopy = state.frames.filter(frame => frameIds.includes(frame.id));
    setState(prev => ({
      ...prev,
      clipboard: framesToCopy,
    }));
  }, [state.frames]);

  const pasteFrames = useCallback((x: number, y: number) => {
    if (state.clipboard.length === 0) return;
    
    // Calculate offset from the first frame in clipboard
    const firstFrame = state.clipboard[0];
    const offsetX = x - firstFrame.x;
    const offsetY = y - firstFrame.y;
    
    const pastedFrames = state.clipboard.map(frame => ({
      ...frame,
      id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x: frame.x + offsetX,
      y: frame.y + offsetY,
      name: `${frame.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    
    const newFrames = [...state.frames, ...pastedFrames];
    addToHistory(newFrames);
    
    // Select the pasted frames
    setState(prev => ({
      ...prev,
      selectedFrameIds: pastedFrames.map(frame => frame.id),
    }));
  }, [state.clipboard, state.frames, addToHistory]);

  const cutFrames = useCallback((frameIds: string[]) => {
    copyFrames(frameIds);
    const newFrames = state.frames.filter(frame => !frameIds.includes(frame.id));
    addToHistory(newFrames);
    
    setState(prev => ({
      ...prev,
      selectedFrameIds: [],
    }));
  }, [copyFrames, state.frames, addToHistory]);

  // History operations
  const undo = useCallback(() => {
    if (state.history.past.length === 0) return;
    
    setState(prev => {
      const previous = prev.history.past[prev.history.past.length - 1];
      const newPast = prev.history.past.slice(0, prev.history.past.length - 1);
      
      return {
        ...prev,
        frames: previous,
        history: {
          past: newPast,
          present: previous,
          future: [prev.history.present, ...prev.history.future],
        },
      };
    });
  }, [state.history]);

  const redo = useCallback(() => {
    if (state.history.future.length === 0) return;
    
    setState(prev => {
      const next = prev.history.future[0];
      const newFuture = prev.history.future.slice(1);
      
      return {
        ...prev,
        frames: next,
        history: {
          past: [...prev.history.past, prev.history.present],
          present: next,
          future: newFuture,
        },
      };
    });
  }, [state.history]);

  // Bulk operations
  const groupFrames = useCallback((frameIds: string[]) => {
    if (frameIds.length < 2) return;
    
    const framesToGroup = state.frames.filter(frame => frameIds.includes(frame.id));
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    framesToGroup.forEach(frame => {
      minX = Math.min(minX, frame.x);
      minY = Math.min(minY, frame.y);
      maxX = Math.max(maxX, frame.x + frame.width);
      maxY = Math.max(maxY, frame.y + frame.height);
    });
    
    // Create group frame
    const groupFrame = createFrame({
      x: minX - 10,
      y: minY - 10,
      width: maxX - minX + 20,
      height: maxY - minY + 20,
      name: `Group (${framesToGroup.length} frames)`,
      frameType: FRAME_TYPES.ORGANIZATION,
      style: {
        fill: 'rgba(249, 250, 251, 0.6)',
        stroke: '#64748b',
        strokeWidth: 2,
        strokeDasharray: [5, 5],
        cornerRadius: 8,
      },
    });
    
    // Update child frames to reference the group
    const updatedFrames = state.frames.map(frame => {
      if (frameIds.includes(frame.id)) {
        return {
          ...frame,
          hierarchy: {
            ...frame.hierarchy,
            parentId: groupFrame.id,
          },
        };
      }
      return frame;
    });
    
    const newFrames = [...updatedFrames, groupFrame];
    addToHistory(newFrames);
    
    // Select the group frame
    setState(prev => ({
      ...prev,
      selectedFrameIds: [groupFrame.id],
    }));
  }, [state.frames, addToHistory]);

  const alignFrames = useCallback((frameIds: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (frameIds.length < 2) return;
    
    const framesToAlign = state.frames.filter(frame => frameIds.includes(frame.id));
    
    // Calculate alignment reference
    let reference: number;
    switch (alignment) {
      case 'left':
        reference = Math.min(...framesToAlign.map(f => f.x));
        break;
      case 'center':
        reference = framesToAlign.reduce((sum, f) => sum + f.x + f.width / 2, 0) / framesToAlign.length;
        break;
      case 'right':
        reference = Math.max(...framesToAlign.map(f => f.x + f.width));
        break;
      case 'top':
        reference = Math.min(...framesToAlign.map(f => f.y));
        break;
      case 'middle':
        reference = framesToAlign.reduce((sum, f) => sum + f.y + f.height / 2, 0) / framesToAlign.length;
        break;
      case 'bottom':
        reference = Math.max(...framesToAlign.map(f => f.y + f.height));
        break;
    }
    
    // Apply alignment
    const newFrames = state.frames.map(frame => {
      if (!frameIds.includes(frame.id)) return frame;
      
      let newX = frame.x;
      let newY = frame.y;
      
      switch (alignment) {
        case 'left':
          newX = reference;
          break;
        case 'center':
          newX = reference - frame.width / 2;
          break;
        case 'right':
          newX = reference - frame.width;
          break;
        case 'top':
          newY = reference;
          break;
        case 'middle':
          newY = reference - frame.height / 2;
          break;
        case 'bottom':
          newY = reference - frame.height;
          break;
      }
      
      return {
        ...frame,
        x: newX,
        y: newY,
        updatedAt: Date.now(),
      };
    });
    
    addToHistory(newFrames);
  }, [state.frames, addToHistory]);

  const distributeFrames = useCallback((frameIds: string[], direction: 'horizontal' | 'vertical') => {
    if (frameIds.length < 3) return;
    
    const framesToDistribute = state.frames
      .filter(frame => frameIds.includes(frame.id))
      .sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y);
    
    const first = framesToDistribute[0];
    const last = framesToDistribute[framesToDistribute.length - 1];
    
    const totalSpace = direction === 'horizontal'
      ? (last.x + last.width) - first.x
      : (last.y + last.height) - first.y;
    
    const totalFrameSize = framesToDistribute.reduce((sum, frame) =>
      sum + (direction === 'horizontal' ? frame.width : frame.height), 0
    );
    
    const spacing = (totalSpace - totalFrameSize) / (framesToDistribute.length - 1);
    
    let currentPos = direction === 'horizontal' ? first.x : first.y;
    
    const newFrames = state.frames.map(frame => {
      const index = framesToDistribute.findIndex(f => f.id === frame.id);
      if (index === -1) return frame;
      
      if (index === 0) {
        currentPos += direction === 'horizontal' ? frame.width : frame.height;
        return frame;
      }
      
      currentPos += spacing;
      const newFrame = {
        ...frame,
        ...(direction === 'horizontal' ? { x: currentPos } : { y: currentPos }),
        updatedAt: Date.now(),
      };
      
      currentPos += direction === 'horizontal' ? frame.width : frame.height;
      return newFrame;
    });
    
    addToHistory(newFrames);
  }, [state.frames, addToHistory]);

  // Import/Export
  const exportFrames = useCallback((frameIds: string[]) => {
    const framesToExport = state.frames.filter(frame => frameIds.includes(frame.id));
    return JSON.stringify({
      version: '1.0',
      frames: framesToExport,
      exportedAt: Date.now(),
    });
  }, [state.frames]);

  const importFrames = useCallback((data: string, x: number, y: number) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.frames || !Array.isArray(parsed.frames)) {
        throw new Error('Invalid frame data');
      }
      
      // Calculate offset from the first frame
      const firstFrame = parsed.frames[0];
      const offsetX = x - firstFrame.x;
      const offsetY = y - firstFrame.y;
      
      const importedFrames = parsed.frames.map((frame: FrameElement) => ({
        ...frame,
        id: `frame-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        x: frame.x + offsetX,
        y: frame.y + offsetY,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      
      const newFrames = [...state.frames, ...importedFrames];
      addToHistory(newFrames);
      
      // Select the imported frames
      setState(prev => ({
        ...prev,
        selectedFrameIds: importedFrames.map((frame: FrameElement) => frame.id),
      }));
    } catch (error) {
      console.error('Failed to import frames:', error);
    }
  }, [state.frames, addToHistory]);

  // Replace frames with external source (e.g., server push)
  const replaceFrames = useCallback((newFrames: FrameElement[]) => {
    // Skip if frames are identical
    if (JSON.stringify(state.frames) === JSON.stringify(newFrames)) return;

    setState(prev => ({
      ...prev,
      frames: newFrames,
      history: {
        past: [...prev.history.past, prev.history.present],
        present: newFrames,
        future: [],
      },
    }));
  }, [state.frames]);

  // Add a fully-defined frame (e.g., from external creation logic)
  const addFrame = useCallback((frame: FrameElement) => {
    const newFrames = [...state.frames, frame];
    addToHistory(newFrames);
    setState(prev => ({
      ...prev,
      selectedFrameIds: [frame.id],
    }));
  }, [state.frames, addToHistory]);

  return {
    frames: state.frames,
    selectedFrameIds: state.selectedFrameIds,
    createNewFrame,
    updateFrame,
    deleteFrame,
    duplicateFrames,
    selectFrame,
    selectFrames,
    clearSelection,
    selectAll,
    copyFrames,
    pasteFrames,
    cutFrames,
    undo,
    redo,
    canUndo: state.history.past.length > 0,
    canRedo: state.history.future.length > 0,
    groupFrames,
    alignFrames,
    distributeFrames,
    exportFrames,
    importFrames,
    replaceFrames,
    addFrame,
  };
}
