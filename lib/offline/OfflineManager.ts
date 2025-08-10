// Offline support module for WhizBoard

// Define BoardData interface for offline storage
export interface BoardData {
  id: string;
  name: string;
  elements: any[];
  collaborators: any[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  history?: any[];
  historyIndex?: number;
}

export interface OfflineChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  elementId?: string;
  data?: any;
  timestamp: number;
  userId: string;
}

export interface OfflineState {
  isOnline: boolean;
  pendingChanges: OfflineChange[];
  lastSyncTimestamp: number;
  localBoardData: Map<string, BoardData>;
}

export interface OfflineManagerInterface {
  isOnline(): boolean;
  getPendingChangesCount(): number;
  getLastSyncTimestamp(): number;
  saveBoardLocally(boardId: string, boardData: BoardData): Promise<void>;
  getLocalBoard(boardId: string): BoardData | null;
  addPendingChange(change: Omit<OfflineChange, 'id' | 'timestamp'>): void;
  syncPendingChanges(): Promise<void>;
  clearOfflineData(): void;
}

class OfflineManager {
  private state: OfflineState = {
    isOnline: true,
    pendingChanges: [],
    lastSyncTimestamp: Date.now(),
    localBoardData: new Map(),
  };

  private syncQueue: OfflineChange[] = [];
  private conflictResolvers: Map<string, (local: any, remote: any) => any> = new Map();

  constructor() {
    this.initializeOfflineSupport();
    this.setupNetworkListeners();
  }

  private initializeOfflineSupport() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    // Load existing offline data from localStorage
    const savedState = localStorage.getItem('whizboard-offline-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        this.state.pendingChanges = parsed.pendingChanges || [];
        this.state.lastSyncTimestamp = parsed.lastSyncTimestamp || Date.now();
      } catch (error) {
        console.warn('Failed to load offline state:', error);
      }
    }

    // Load local board data
    const localBoards = localStorage.getItem('whizboard-local-boards');
    if (localBoards) {
      try {
        const parsed = JSON.parse(localBoards);
        this.state.localBoardData = new Map(Object.entries(parsed));
      } catch (error) {
        console.warn('Failed to load local board data:', error);
      }
    }
  }

  private setupNetworkListeners() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
    });

    // Periodic sync check
    setInterval(() => {
      if (this.state.isOnline && this.state.pendingChanges.length > 0) {
        this.syncPendingChanges();
      }
    }, 30000); // Check every 30 seconds
  }

  public async saveBoardLocally(boardId: string, boardData: BoardData): Promise<void> {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      this.state.localBoardData.set(boardId, boardData);
      const serialized = Object.fromEntries(this.state.localBoardData);
      localStorage.setItem('whizboard-local-boards', JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save board locally:', error);
    }
  }

  public getLocalBoard(boardId: string): BoardData | null {
    return this.state.localBoardData.get(boardId) || null;
  }

  public addPendingChange(change: OfflineChange): void {
    this.state.pendingChanges.push(change);
    this.saveOfflineState();
  }

  public async syncPendingChanges(): Promise<void> {
    if (!this.state.isOnline || this.state.pendingChanges.length === 0) {
      return;
    }

    const changesToSync = [...this.state.pendingChanges];
    this.state.pendingChanges = [];

    try {
      for (const change of changesToSync) {
        await this.syncChange(change);
      }

      this.state.lastSyncTimestamp = Date.now();
      this.saveOfflineState();
    } catch (error) {
      console.error('Failed to sync changes:', error);
      // Re-add failed changes to pending queue
      this.state.pendingChanges.unshift(...changesToSync);
      this.saveOfflineState();
    }
  }

  private async syncChange(change: OfflineChange): Promise<void> {
    // This would integrate with your existing API endpoints
    // For now, we'll simulate the sync process
    switch (change.type) {
      case 'create':
        // await createElement(change.data);
        break;
      case 'update':
        // await updateElement(change.elementId!, change.data);
        break;
      case 'delete':
        // await deleteElement(change.elementId!);
        break;
    }
  }

  public resolveConflict(localData: any, remoteData: any, elementId: string): any {
    const resolver = this.conflictResolvers.get(elementId);
    if (resolver) {
      return resolver(localData, remoteData);
    }

    // Default conflict resolution: use the most recent change
    const localTimestamp = localData.timestamp || 0;
    const remoteTimestamp = remoteData.timestamp || 0;
    
    return remoteTimestamp > localTimestamp ? remoteData : localData;
  }

  public registerConflictResolver(elementId: string, resolver: (local: any, remote: any) => any): void {
    this.conflictResolvers.set(elementId, resolver);
  }

  public isOnline(): boolean {
    // Check both internal state and browser's online status
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine && this.state.isOnline;
    }
    return this.state.isOnline;
  }

  public getPendingChangesCount(): number {
    return this.state.pendingChanges.length;
  }

  public getLastSyncTimestamp(): number {
    return this.state.lastSyncTimestamp;
  }

  private saveOfflineState(): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      const stateToSave = {
        pendingChanges: this.state.pendingChanges,
        lastSyncTimestamp: this.state.lastSyncTimestamp,
      };
      localStorage.setItem('whizboard-offline-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save offline state:', error);
    }
  }

  public clearOfflineData(): void {
    this.state.pendingChanges = [];
    this.state.localBoardData.clear();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('whizboard-offline-state');
      localStorage.removeItem('whizboard-local-boards');
    }
  }
}

// Lazy-loaded manager to prevent SSR issues
let _offlineManager: OfflineManager | null = null;

export const getOfflineManager = (): OfflineManagerInterface => {
  if (typeof window === 'undefined') {
    // Return a mock manager for SSR
    return {
      isOnline: () => true,
      getPendingChangesCount: () => 0,
      getLastSyncTimestamp: () => Date.now(),
      saveBoardLocally: async () => {},
      getLocalBoard: () => null,
      addPendingChange: () => {},
      syncPendingChanges: async () => {},
      clearOfflineData: () => {},
    };
  }
  
  if (!_offlineManager) {
    _offlineManager = new OfflineManager();
  }
  
  return _offlineManager;
};

export const offlineManager = getOfflineManager();
