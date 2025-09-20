import { useState, useEffect, useCallback } from 'react';
import { getOfflineManager, OfflineChange, BoardData } from '@/lib/offline/OfflineManager';

export interface UseOfflineReturn {
  isOnline: boolean;
  pendingChangesCount: number;
  lastSyncTimestamp: number;
  saveBoardLocally: (boardId: string, boardData: BoardData) => Promise<void>;
  getLocalBoard: (boardId: string) => BoardData | null;
  addPendingChange: (change: Omit<OfflineChange, 'id' | 'timestamp'>) => void;
  syncPendingChanges: () => Promise<void>;
  clearOfflineData: () => void;
}

export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with actual online status if in browser
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return false;
  });
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(Date.now());

  // Initialize state on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = getOfflineManager();
      setIsOnline(manager.isOnline());
      setPendingChangesCount(manager.getPendingChangesCount());
      setLastSyncTimestamp(manager.getLastSyncTimestamp());
    }
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => {
      // Use navigator.onLine for immediate response
      const onlineStatus = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(onlineStatus);
    };

    const updatePendingChanges = () => {
      setPendingChangesCount(getOfflineManager().getPendingChangesCount());
    };

    const updateSyncTimestamp = () => {
      setLastSyncTimestamp(getOfflineManager().getLastSyncTimestamp());
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Periodic updates for pending changes and sync timestamp
    const interval = setInterval(() => {
      updatePendingChanges();
      updateSyncTimestamp();
    }, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const saveBoardLocally = useCallback(async (boardId: string, boardData: BoardData) => {
    await getOfflineManager().saveBoardLocally(boardId, boardData);
  }, []);

  const getLocalBoard = useCallback((boardId: string) => {
    return getOfflineManager().getLocalBoard(boardId);
  }, []);

  const addPendingChange = useCallback((change: Omit<OfflineChange, 'id' | 'timestamp'>) => {
    const fullChange: OfflineChange = {
      ...change,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const manager = getOfflineManager();
    manager.addPendingChange(fullChange);
    setPendingChangesCount(manager.getPendingChangesCount());
  }, []);

  const syncPendingChanges = useCallback(async () => {
    const manager = getOfflineManager();
    await manager.syncPendingChanges();
    setPendingChangesCount(manager.getPendingChangesCount());
    setLastSyncTimestamp(manager.getLastSyncTimestamp());
  }, []);

  const clearOfflineData = useCallback(() => {
    getOfflineManager().clearOfflineData();
    setPendingChangesCount(0);
  }, []);

  return {
    isOnline,
    pendingChangesCount,
    lastSyncTimestamp,
    saveBoardLocally,
    getLocalBoard,
    addPendingChange,
    syncPendingChanges,
    clearOfflineData,
  };
};
