/**
 * Simplified CRDT Document
 * Lightweight wrapper around CRDTCore for backward compatibility
 */

import { CRDTCore, CRDTConfig, BoardElement } from './CRDTCore';

export type { CRDTConfig as CRDTDocumentConfig, BoardElement };

/**
 * Simplified CRDT Document implementation
 */
export class CRDTDocument extends CRDTCore {
  constructor(config: CRDTConfig) {
    super(config);
  }

  /**
   * Get statistics about the document
   */
  public getStats() {
    const elements = this.getAllElements();
    const elementsByType = elements.reduce((acc, el) => {
      acc[el.type] = (acc[el.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalElements: elements.length,
      lines: elementsByType.line || 0,
      stickyNotes: elementsByType['sticky-note'] || 0,
      frames: elementsByType.frame || 0,
      textElements: elementsByType.text || 0,
      shapes: elementsByType.shape || 0,
      imageElements: elementsByType.image || 0,
      isConnected: this.isConnected(),
    };
  }

  /**
   * Export document as JSON
   */
  public toJSON() {
    return {
      elements: this.getAllElements(),
      metadata: Object.fromEntries(this.metadata.entries()),
    };
  }

  /**
   * Manual sync trigger
   */
  public sync(): void {
    // Force a small update to trigger sync
    this.metadata.set('lastSync', Date.now());
  }
}