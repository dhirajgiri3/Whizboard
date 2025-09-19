/**
 * Simplified CRDT Core Implementation
 * Provides all essential CRDT functionality in a clean, optimized package
 */

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { CRDTAwareness } from './CRDTAwareness';
import { getCRDTConfig, type CRDTProductionConfig } from './CRDTConfig';

export interface CRDTConfig {
  boardId: string;
  userId: string;
  websocketUrl?: string;
  enableOffline?: boolean;
  userName?: string;
  productionConfig?: Partial<CRDTProductionConfig>;
}

export interface BoardElement {
  id: string;
  type: 'line' | 'sticky-note' | 'frame' | 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

/**
 * Unified CRDT implementation with all essential features
 */
export class CRDTCore {
  public readonly ydoc: Y.Doc;
  public readonly elements: Y.Array<Y.Map<any>>;
  public readonly metadata: Y.Map<any>;
  public readonly awareness: CRDTAwareness;

  private websocketProvider?: WebsocketProvider;
  private indexeddbProvider?: IndexeddbPersistence;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  constructor(private config: CRDTConfig) {
    // Get production configuration
    const prodConfig = getCRDTConfig();
    if (config.productionConfig) {
      Object.assign(prodConfig, config.productionConfig);
    }

    this.ydoc = new Y.Doc({
      guid: `whizboard-${config.boardId}`,
      gc: prodConfig.performance.compressionEnabled,
    });

    // Core CRDT structures - simplified to just elements array
    this.elements = this.ydoc.getArray('elements');
    this.metadata = this.ydoc.getMap('metadata');
    this.awareness = new CRDTAwareness(this.ydoc, {
      userId: config.userId,
      userName: config.userName || `User ${config.userId.substring(0, 8)}`,
      cursorThrottleMs: prodConfig.awareness.cursorThrottleMs,
      updateInterval: prodConfig.awareness.presenceUpdateInterval,
    });

    // Initialize metadata
    if (this.metadata.size === 0) {
      this.metadata.set('createdAt', Date.now());
      this.metadata.set('createdBy', config.userId);
      this.metadata.set('boardId', config.boardId);
    }

    this.setupProviders();
  }

  /**
   * Setup WebSocket and IndexedDB providers
   */
  private setupProviders(): void {
    // WebSocket for real-time sync
    const wsUrl = this.config.websocketUrl || this.getDefaultWebsocketUrl();
    try {
      this.websocketProvider = new WebsocketProvider(
        wsUrl,
        `whizboard-${this.config.boardId}`,
        this.ydoc,
        { connect: true, awareness: this.awareness.awareness }
      );

      this.websocketProvider.on('status', (event: any) => {
        this.notifyListeners('connection', event);
      });
    } catch (error) {
      console.warn('WebSocket not available:', error);
    }

    // IndexedDB for offline persistence
    if (this.config.enableOffline !== false) {
      try {
        this.indexeddbProvider = new IndexeddbPersistence(
          `whizboard-${this.config.boardId}`,
          this.ydoc
        );
      } catch (error) {
        console.warn('IndexedDB not available:', error);
      }
    }
  }

  /**
   * Add or update an element
   */
  public setElement(element: BoardElement): void {
    const existingIndex = this.findElementIndex(element.id);
    const elementMap = this.createYMapFromElement(element);

    if (existingIndex !== -1) {
      // Update existing element
      this.elements.delete(existingIndex, 1);
      this.elements.insert(existingIndex, [elementMap]);
    } else {
      // Add new element
      this.elements.push([elementMap]);
    }
  }

  /**
   * Get an element by ID
   */
  public getElement(id: string): BoardElement | null {
    const index = this.findElementIndex(id);
    if (index === -1) return null;

    const ymap = this.elements.get(index);
    return this.createElementFromYMap(ymap);
  }

  /**
   * Get all elements
   */
  public getAllElements(): BoardElement[] {
    return this.elements.toArray().map(ymap => this.createElementFromYMap(ymap));
  }

  /**
   * Remove an element
   */
  public removeElement(id: string): void {
    const index = this.findElementIndex(id);
    if (index !== -1) {
      this.elements.delete(index, 1);
    }
  }

  /**
   * Get elements in viewport (simple spatial query)
   */
  public getElementsInViewport(viewport: { x: number; y: number; width: number; height: number }): BoardElement[] {
    return this.getAllElements().filter(element => {
      if (!element.width || !element.height) return true; // Include elements without bounds

      return !(
        element.x + element.width < viewport.x ||
        element.x > viewport.x + viewport.width ||
        element.y + element.height < viewport.y ||
        element.y > viewport.y + viewport.height
      );
    });
  }

  /**
   * Subscribe to element changes
   */
  public onElementsChange(callback: () => void): () => void {
    this.elements.observe(callback);
    return () => this.elements.unobserve(callback);
  }

  /**
   * Add event listener
   */
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  public off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.websocketProvider?.wsconnected || false;
  }

  /**
   * Export data for backup
   */
  public exportData(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Import data from backup
   */
  public importData(data: Uint8Array): void {
    Y.applyUpdate(this.ydoc, data);
  }

  /**
   * Destroy and cleanup
   */
  public destroy(): void {
    this.awareness.destroy();
    this.websocketProvider?.destroy();
    this.indexeddbProvider?.destroy();
    this.ydoc.destroy();
    this.listeners.clear();
  }

  // Helper methods

  private findElementIndex(id: string): number {
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements.get(i);
      if (element.get('id') === id) {
        return i;
      }
    }
    return -1;
  }

  private createYMapFromElement(element: BoardElement): Y.Map<any> {
    const ymap = new Y.Map();

    // Convert nested objects to Y.Map
    Object.entries(element).forEach(([key, value]) => {
      if (key === 'data' && typeof value === 'object' && value !== null) {
        const dataMap = new Y.Map();
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          dataMap.set(dataKey, dataValue);
        });
        ymap.set(key, dataMap);
      } else {
        ymap.set(key, value);
      }
    });

    return ymap;
  }

  private createElementFromYMap(ymap: Y.Map<any>): BoardElement {
    const element: any = {};

    ymap.forEach((value, key) => {
      if (key === 'data' && value instanceof Y.Map) {
        const data: any = {};
        value.forEach((dataValue, dataKey) => {
          data[dataKey] = dataValue;
        });
        element[key] = data;
      } else {
        element[key] = value;
      }
    });

    return element as BoardElement;
  }

  private getDefaultWebsocketUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:3000/api/ws/crdt';

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws/crdt`;
  }

  private notifyListeners(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in CRDT listener for ${event}:`, error);
      }
    });
  }
}