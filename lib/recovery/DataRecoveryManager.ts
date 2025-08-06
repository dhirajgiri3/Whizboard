import logger from '@/lib/logger/logger';

export interface BoardState {
  id: string;
  elements: any[];
  history: any[];
  historyIndex: number;
  lastSaved: number;
  version: number;
}

export interface RecoveryConfig {
  autoSaveInterval: number; // milliseconds
  maxLocalStorageSize: number; // bytes
  maxRecoveryVersions: number;
  compressionEnabled: boolean;
}

export class DataRecoveryManager {
  private config: RecoveryConfig;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private isAutoSaving = false;
  private lastAutoSave = 0;
  private pendingChanges = false;

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = {
      autoSaveInterval: 30000, // 30 seconds
      maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
      maxRecoveryVersions: 10,
      compressionEnabled: true,
      ...config,
    };
  }

  /**
   * Start auto-save for a board
   */
  public startAutoSave(boardId: string): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.performAutoSave(boardId);
    }, this.config.autoSaveInterval);

    logger.info({ boardId }, 'Auto-save started');
  }

  /**
   * Stop auto-save
   */
  public stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
    logger.info('Auto-save stopped');
  }

  /**
   * Save board state to local storage
   */
  public saveBoardState(boardId: string, state: Partial<BoardState>): boolean {
    try {
      const fullState: BoardState = {
        id: boardId,
        elements: state.elements || [],
        history: state.history || [],
        historyIndex: state.historyIndex || 0,
        lastSaved: Date.now(),
        version: (state.version || 0) + 1,
      };

      const key = `board_recovery_${boardId}`;
      const data = this.config.compressionEnabled 
        ? this.compressData(fullState)
        : JSON.stringify(fullState);

      // Check storage size before saving
      if (this.wouldExceedStorageLimit(data)) {
        this.cleanupOldRecoveryData(boardId);
      }

      localStorage.setItem(key, data);
      this.lastAutoSave = Date.now();
      this.pendingChanges = false;

      logger.debug({ boardId, version: fullState.version }, 'Board state saved to local storage');
      return true;
    } catch (error) {
      logger.error({ error, boardId }, 'Failed to save board state to local storage');
      return false;
    }
  }

  /**
   * Load board state from local storage
   */
  public loadBoardState(boardId: string): BoardState | null {
    try {
      const key = `board_recovery_${boardId}`;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      const state = this.config.compressionEnabled 
        ? this.decompressData(data)
        : JSON.parse(data);

      logger.debug({ boardId, version: state.version }, 'Board state loaded from local storage');
      return state;
    } catch (error) {
      logger.error({ error, boardId }, 'Failed to load board state from local storage');
      return null;
    }
  }

  /**
   * Check if there's recovery data available
   */
  public hasRecoveryData(boardId: string): boolean {
    const key = `board_recovery_${boardId}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get recovery data info
   */
  public getRecoveryInfo(boardId: string): { exists: boolean; lastSaved?: number; version?: number } {
    const state = this.loadBoardState(boardId);
    return {
      exists: state !== null,
      lastSaved: state?.lastSaved,
      version: state?.version,
    };
  }

  /**
   * Clear recovery data for a board
   */
  public clearRecoveryData(boardId: string): void {
    try {
      const key = `board_recovery_${boardId}`;
      localStorage.removeItem(key);
      logger.info({ boardId }, 'Recovery data cleared');
    } catch (error) {
      logger.error({ error, boardId }, 'Failed to clear recovery data');
    }
  }

  /**
   * Mark that there are pending changes (triggers auto-save)
   */
  public markPendingChanges(): void {
    this.pendingChanges = true;
  }

  /**
   * Perform auto-save if there are pending changes
   */
  private async performAutoSave(boardId: string): Promise<void> {
    if (this.isAutoSaving || !this.pendingChanges) {
      return;
    }

    this.isAutoSaving = true;

    try {
      // Get current board state from the application
      const currentState = await this.getCurrentBoardState(boardId);
      
      if (currentState) {
        this.saveBoardState(boardId, currentState);
      }
    } catch (error) {
      logger.error({ error, boardId }, 'Auto-save failed');
    } finally {
      this.isAutoSaving = false;
    }
  }

  /**
   * Get current board state from the application
   * This should be implemented by the application to provide current state
   */
  private async getCurrentBoardState(boardId: string): Promise<Partial<BoardState> | null> {
    // This is a placeholder - the actual implementation should be provided by the app
    // The app should call this method and provide the current board state
    return null;
  }

  /**
   * Compress data to save storage space
   */
  private compressData(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      // Simple compression - in a real implementation, you might use a proper compression library
      return btoa(jsonString);
    } catch (error) {
      logger.error({ error }, 'Failed to compress data, falling back to JSON');
      return JSON.stringify(data);
    }
  }

  /**
   * Decompress data
   */
  private decompressData(compressedData: string): any {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error({ error }, 'Failed to decompress data, trying as JSON');
      return JSON.parse(compressedData);
    }
  }

  /**
   * Check if saving data would exceed storage limit
   */
  private wouldExceedStorageLimit(data: string): boolean {
    const currentSize = this.getLocalStorageSize();
    const newDataSize = new Blob([data]).size;
    return currentSize + newDataSize > this.config.maxLocalStorageSize;
  }

  /**
   * Get current localStorage size
   */
  private getLocalStorageSize(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([key, value]).size;
        }
      }
    }
    return totalSize;
  }

  /**
   * Clean up old recovery data to free space
   */
  private cleanupOldRecoveryData(boardId: string): void {
    try {
      const keys = Object.keys(localStorage);
      const recoveryKeys = keys.filter(key => key.startsWith('board_recovery_'));
      
      if (recoveryKeys.length > this.config.maxRecoveryVersions) {
        // Sort by last modified and remove oldest
        const sortedKeys = recoveryKeys.sort((a, b) => {
          const aData = localStorage.getItem(a);
          const bData = localStorage.getItem(b);
          if (!aData || !bData) return 0;
          
          try {
            const aState = this.config.compressionEnabled 
              ? this.decompressData(aData)
              : JSON.parse(aData);
            const bState = this.config.compressionEnabled 
              ? this.decompressData(bData)
              : JSON.parse(bData);
            
            return (aState.lastSaved || 0) - (bState.lastSaved || 0);
          } catch {
            return 0;
          }
        });

        // Remove oldest keys
        const keysToRemove = sortedKeys.slice(0, recoveryKeys.length - this.config.maxRecoveryVersions);
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        logger.info({ removedCount: keysToRemove.length }, 'Cleaned up old recovery data');
      }
    } catch (error) {
      logger.error({ error }, 'Failed to cleanup old recovery data');
    }
  }

  /**
   * Validate board state integrity
   */
  public validateBoardState(state: BoardState): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!state.id) {
      errors.push('Board ID is missing');
    }

    if (!Array.isArray(state.elements)) {
      errors.push('Elements must be an array');
    }

    if (!Array.isArray(state.history)) {
      errors.push('History must be an array');
    }

    if (typeof state.historyIndex !== 'number' || state.historyIndex < 0) {
      errors.push('History index must be a non-negative number');
    }

    if (typeof state.version !== 'number' || state.version < 0) {
      errors.push('Version must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get storage usage statistics
   */
  public getStorageStats(): {
    totalSize: number;
    maxSize: number;
    usagePercentage: number;
    recoveryKeysCount: number;
  } {
    const totalSize = this.getLocalStorageSize();
    const recoveryKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('board_recovery_')
    );

    return {
      totalSize,
      maxSize: this.config.maxLocalStorageSize,
      usagePercentage: (totalSize / this.config.maxLocalStorageSize) * 100,
      recoveryKeysCount: recoveryKeys.length,
    };
  }

  /**
   * Export recovery data for debugging
   */
  public exportRecoveryData(boardId: string): string | null {
    try {
      const state = this.loadBoardState(boardId);
      if (!state) return null;
      
      return JSON.stringify(state, null, 2);
    } catch (error) {
      logger.error({ error, boardId }, 'Failed to export recovery data');
      return null;
    }
  }
}

export default DataRecoveryManager; 