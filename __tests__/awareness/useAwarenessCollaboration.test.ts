import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAwarenessCollaboration } from '@/hooks/useAwarenessCollaboration';
import React from 'react';

// Mock dependencies
vi.mock('@/lib/crdt/CRDTProvider', () => ({
  useCRDTContext: vi.fn(() => ({
    document: {
      awareness: {
        updateCursor: vi.fn(),
        updatePresence: vi.fn(),
        setEditingState: vi.fn(),
        clearEditingState: vi.fn(),
        updateSelection: vi.fn(),
        onCursorsChange: vi.fn(() => vi.fn()), // returns unsubscribe function
        onPresenceChange: vi.fn(() => vi.fn()),
        getConnectionStats: vi.fn(() => ({
          connectedUsers: 2,
          localClientId: 1,
          totalClients: 3,
        })),
        getEditingUsers: vi.fn(() => ({})),
      },
      isConnected: vi.fn(() => true),
      on: vi.fn(),
      off: vi.fn(),
    },
    isConnected: true,
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    createElement: vi.fn((component, props) => ({ component, props })),
  };
});

vi.mock('lucide-react', () => ({
  UserPlus: vi.fn(() => 'UserPlus'),
  UserMinus: vi.fn(() => 'UserMinus'),
  Wifi: vi.fn(() => 'Wifi'),
  WifiOff: vi.fn(() => 'WifiOff'),
}));

describe('useAwarenessCollaboration', () => {
  const defaultProps = {
    boardId: 'test-board',
    userId: 'test-user',
    userName: 'Test User',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.cursors).toEqual({});
    expect(result.current.presence).toEqual({});
    expect(result.current.connectedUsers).toBe(0);
  });

  it('should broadcast cursor movement', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    act(() => {
      result.current.broadcastCursorMovement(
        100, 200, 'pen', true, false, 'element-1', 0.8
      );
    });

    expect(result.current.document?.awareness.updateCursor).toHaveBeenCalledWith({
      x: 100,
      y: 200,
      isActive: true,
      currentTool: 'pen',
      isDrawing: true,
      isSelecting: false,
      activeElementId: 'element-1',
      pressure: 0.8,
    });
  });

  it('should update user presence', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    const presenceUpdate = {
      status: 'away' as const,
      currentActivity: 'Taking a break',
    };

    act(() => {
      result.current.updateUserPresence(presenceUpdate);
    });

    expect(result.current.document?.awareness.updatePresence).toHaveBeenCalledWith({
      ...presenceUpdate,
      lastSeen: expect.any(Number),
    });
  });

  it('should set and clear editing element', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    act(() => {
      result.current.setEditingElement('text-element-1', 'text');
    });

    expect(result.current.document?.awareness.setEditingState).toHaveBeenCalledWith({
      elementId: 'text-element-1',
      type: 'text',
      startTime: expect.any(Number),
    });

    act(() => {
      result.current.clearEditingElement();
    });

    expect(result.current.document?.awareness.clearEditingState).toHaveBeenCalled();
  });

  it('should update selection', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    const selection = {
      elementIds: ['el1', 'el2'],
      boundingBox: { x: 0, y: 0, width: 100, height: 200 },
    };

    act(() => {
      result.current.updateSelection(selection.elementIds, selection.boundingBox);
    });

    expect(result.current.document?.awareness.updateSelection).toHaveBeenCalledWith({
      elementIds: selection.elementIds,
      boundingBox: selection.boundingBox,
    });
  });

  it('should return connection statistics', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    const stats = result.current.getConnectionStats();

    expect(stats).toEqual({
      connectedUsers: 2,
      localClientId: 1,
      totalClients: 3,
    });
  });

  it('should handle user joins and leaves', () => {
    const onUserJoined = vi.fn();
    const onUserLeft = vi.fn();

    renderHook(() => useAwarenessCollaboration({
      ...defaultProps,
      onUserJoined,
      onUserLeft,
    }));

    // Mock presence changes would trigger these callbacks
    // This would normally be tested with more complex mocking of the awareness system
  });

  it('should not broadcast when disconnected', () => {
    // Mock disconnected state
    const { useCRDTContext } = require('@/lib/crdt/CRDTProvider');
    useCRDTContext.mockReturnValue({
      document: null,
      isConnected: false,
    });

    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    act(() => {
      result.current.broadcastCursorMovement(100, 200);
    });

    // Should not throw or call any methods when disconnected
    expect(result.current.isConnected).toBe(false);
  });

  it('should get editing users', () => {
    const { result } = renderHook(() => useAwarenessCollaboration(defaultProps));

    const editingUsers = result.current.getEditingUsers();

    expect(result.current.document?.awareness.getEditingUsers).toHaveBeenCalled();
    expect(editingUsers).toEqual({});
  });
});