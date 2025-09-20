// Shared Yjs import to prevent duplicate imports
// This ensures Yjs is only imported once across the application
import * as Y from 'yjs';

// Re-export everything from Yjs
export * from 'yjs';
export default Y;
export { Y };