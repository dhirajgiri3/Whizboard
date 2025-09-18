/**
 * Simplified CRDT Library Exports
 * Clean, optimized CRDT functionality
 */

// Core CRDT functionality
export { CRDTCore } from './CRDTCore';
export type { CRDTConfig, BoardElement } from './CRDTCore';

// Document wrapper for backward compatibility
export { CRDTDocument } from './CRDTDocument';
export type { CRDTDocumentConfig } from './CRDTDocument';

// React integration
export { useCRDTDocument } from './useCRDTDocument';
export type { UseCRDTDocumentResult } from './useCRDTDocument';

// React context provider exports are handled separately due to JSX compilation
// Import from './CRDTProvider' directly in React components