'use client';

import { useOffline } from '@/hooks';
import { Wifi, WifiOff, Cloud, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const OfflineStatusIndicator = () => {
  const { isOnline, pendingChangesCount, lastSyncTimestamp, syncPendingChanges } = useOffline();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render during SSR
  if (!isMounted) {
    return null;
  }

  const formatLastSync = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (isOnline && pendingChangesCount === 0) {
    return null; // Don't show indicator when online and no pending changes
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 p-3">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          
          <span className="text-sm font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>

          {pendingChangesCount > 0 && (
            <div className="flex items-center gap-1">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pendingChangesCount} pending
              </span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <AlertCircle className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Last sync: {formatLastSync(lastSyncTimestamp)}
              </div>
              
              {pendingChangesCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {pendingChangesCount} changes waiting to sync
                  </span>
                  {isOnline && (
                    <button
                      onClick={syncPendingChanges}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Sync Now
                    </button>
                  )}
                </div>
              )}

              {!isOnline && (
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Changes will sync when connection is restored
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
