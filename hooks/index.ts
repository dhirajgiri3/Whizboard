// Category exports
// Board-related hooks
export * from './board';
// Canvas-related hooks
export * from './canvas';
// Collaboration-related hooks
export * from './collaboration';
// Utility hooks
export * from './utility';
// Miscellaneous hooks
export * from './misc';
// Integration hooks
export * from './integrations';
// UI hooks
export * from './ui';

// Legacy exports to maintain backward compatibility
// These allow imports from original paths like '@/hooks/useHookName'

// Board hooks
export { useBoardAccess } from './board/useBoardAccess';
export { useBoardActions } from './board/useBoardActions';
export { useBoardElementHandlers } from './board/useBoardElementHandlers';
export { useBoardHistory } from './board/useBoardHistory';
export { useBoardKeyboard } from './board/useBoardKeyboard';
export { useBoardResponsive } from './board/useBoardResponsive';
export { useBoardState } from './board/useBoardState';
export { useBoardUserManagement } from './board/useBoardUserManagement';
export { useBoardZoom } from './board/useBoardZoom';
export { useEnhancedBoardManager } from './board/useEnhancedBoardManager';
export { useFrameManager } from './board/useFrameManager';
export { useOptimizedUndoRedo } from './board/useOptimizedUndoRedo';

// Canvas hooks
// Note: useCanvasHistory.ts is an empty file, so we don't export it
export { useCanvasInteractions } from './canvas/useCanvasInteractions';
export { useCanvasZoom } from './canvas/useCanvasZoom';

// Collaboration hooks
export { useAwarenessCollaboration } from './collaboration/useAwarenessCollaboration';
export { useCollaborationEvents } from './collaboration/useCollaborationEvents';
export { useCollaborationStats } from './collaboration/useCollaborationStats';
export { useHybridCollaboration } from './collaboration/useHybridCollaboration';
export { useRealTimeCollaboration } from './collaboration/useRealTimeCollaboration';
export { useRealTimeNotifications } from './collaboration/useRealTimeNotifications';

// Utility hooks
export { useAlertSystem } from './utility/useAlertSystem';
export { useErrorTracking } from './utility/useErrorTracking';
export { useFloatingToolbarDrag } from './utility/useFloatingToolbarDrag';
export { usePerformanceMonitoring } from './utility/usePerformanceMonitoring';
export { useScrollDirection } from './utility/useScrollDirection';

// Misc hooks
export { useOffline } from './misc/useOffline';

// Integration hooks
export { useGoogleDrive } from './integrations/useGoogleDrive';

// UI hooks
export { useStickyNoteColor } from './ui/useStickyNoteColor';
export { useStickyNoteColorPicker } from './ui/useStickyNoteColorPicker';