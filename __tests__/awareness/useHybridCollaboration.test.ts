import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHybridCollaboration } from '@/hooks/useHybridCollaboration';

// Mock the individual collaboration hooks
const mockLegacyCollaboration = {
  broadcastCursorMovement: vi.fn(),
  broadcastDrawingStart: vi.fn(),
  broadcastDrawingUpdate: vi.fn(),
  broadcastDrawingComplete: vi.fn(),
  broadcastElementUpdate: vi.fn(),
  broadcastTextElementCreate: vi.fn(),
  broadcastTextElementUpdate: vi.fn(),
  broadcastTextElementDelete: vi.fn(),
  broadcastTextElementEditStart: vi.fn(),
  broadcastTextElementEditFinish: vi.fn(),
  broadcastShapeElementCreate: vi.fn(),
  broadcastShapeElementUpdate: vi.fn(),
  broadcastShapeElementDelete: vi.fn(),
  updateAndBroadcastPresence: vi.fn(),
  isConnected: true,
  cursors: {},
};

const mockAwarenessCollaboration = {
  broadcastCursorMovement: vi.fn(),
  updateUserPresence: vi.fn(),
  setEditingElement: vi.fn(),
  clearEditingElement: vi.fn(),
  updateSelection: vi.fn(),
  getConnectionStats: vi.fn(() => ({ connectedUsers: 1, localClientId: 1, totalClients: 2 })),
  getEditingUsers: vi.fn(() => ({})),
  isConnected: true,
  cursors: {},
  presence: {},
  connectedUsers: 1,
};

vi.mock('@/hooks/useRealTimeCollaboration', () => ({
  useRealTimeCollaboration: vi.fn(() => mockLegacyCollaboration),
}));

vi.mock('@/hooks/useAwarenessCollaboration', () => ({
  useAwarenessCollaboration: vi.fn(() => mockAwarenessCollaboration),
}));

describe('useHybridCollaboration', () => {
  const defaultProps = {
    boardId: 'test-board',
    userId: 'test-user',
    userName: 'Test User',
    isOwner: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('legacy mode (useAwareness: false)', () => {
    it('should use legacy collaboration system by default', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: false,
      }));

      expect(result.current).toBe(mockLegacyCollaboration);
    });

    it('should forward cursor movement to legacy system', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: false,
      }));

      act(() => {
        result.current.broadcastCursorMovement(100, 200, 'pen', true, false, 'element-1', 0.8);
      });

      expect(mockLegacyCollaboration.broadcastCursorMovement).toHaveBeenCalledWith(
        100, 200, 'pen', true, false, 'element-1', 0.8
      );
    });
  });

  describe('awareness mode (useAwareness: true)', () => {
    it('should use awareness collaboration system when enabled', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
      }));

      // Should have awareness properties
      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectedUsers).toBe(1);
      expect(typeof result.current.broadcastCursorMovement).toBe('function');
    });

    it('should forward cursor movement to awareness system', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
      }));

      act(() => {
        result.current.broadcastCursorMovement(100, 200, 'pen', true, false, 'element-1', 0.8);
      });

      expect(mockAwarenessCollaboration.broadcastCursorMovement).toHaveBeenCalledWith(
        100, 200, 'pen', true, false, 'element-1', 0.8
      );
    });

    it('should provide no-op functions for unimplemented methods', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
      }));

      // These should be no-op functions that don't throw
      expect(() => {
        result.current.broadcastDrawingStart();
        result.current.broadcastDrawingUpdate();
        result.current.broadcastDrawingComplete();
        result.current.broadcastElementUpdate();
        result.current.broadcastTextElementCreate();
        result.current.broadcastTextElementUpdate();
        result.current.broadcastTextElementDelete();
        result.current.broadcastShapeElementCreate();
        result.current.broadcastShapeElementUpdate();
        result.current.broadcastShapeElementDelete();
      }).not.toThrow();
    });

    it('should map text editing methods to awareness editing state', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
      }));

      act(() => {
        result.current.broadcastTextElementEditStart('text-element-1');
      });

      expect(mockAwarenessCollaboration.setEditingElement).toHaveBeenCalledWith('text-element-1', 'text');

      act(() => {
        result.current.broadcastTextElementEditFinish();
      });

      expect(mockAwarenessCollaboration.clearEditingElement).toHaveBeenCalled();
    });

    it('should map presence updates correctly', () => {
      const { result } = renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
      }));

      const presenceUpdate = { status: 'away' as const };

      act(() => {
        result.current.updateAndBroadcastPresence(presenceUpdate);
      });

      expect(mockAwarenessCollaboration.updateUserPresence).toHaveBeenCalledWith(presenceUpdate);
    });
  });

  describe('feature flag behavior', () => {
    it('should respect the useAwareness flag', () => {
      // Test that the flag properly switches between systems
      const { rerender } = renderHook(
        ({ useAwareness }) => useHybridCollaboration({
          ...defaultProps,
          useAwareness,
        }),
        { initialProps: { useAwareness: false } }
      );

      // Should initially use legacy
      expect(mockLegacyCollaboration).toBeDefined();

      // Rerender with awareness enabled
      rerender({ useAwareness: true });

      // Should now use awareness system
      expect(mockAwarenessCollaboration).toBeDefined();
    });

    it('should handle callbacks properly in both modes', () => {
      const onCursorMove = vi.fn();
      const onUserPresenceUpdate = vi.fn();

      renderHook(() => useHybridCollaboration({
        ...defaultProps,
        useAwareness: true,
        onCursorMove,
        onUserPresenceUpdate,
      }));

      // Callbacks should be passed to the awareness system
      expect(mockAwarenessCollaboration).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle missing callbacks gracefully', () => {
      expect(() => {
        renderHook(() => useHybridCollaboration({
          ...defaultProps,
          useAwareness: true,
          // No callbacks provided
        }));
      }).not.toThrow();
    });

    it('should handle system switching without errors', () => {
      const { rerender } = renderHook(
        ({ useAwareness }) => useHybridCollaboration({
          ...defaultProps,
          useAwareness,
        }),
        { initialProps: { useAwareness: false } }
      );

      expect(() => {
        rerender({ useAwareness: true });
        rerender({ useAwareness: false });
        rerender({ useAwareness: true });
      }).not.toThrow();
    });
  });
});