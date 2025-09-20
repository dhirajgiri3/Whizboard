/**
 * Global type declarations to help with build process
 */

// Temporarily disable strict type checking for deployment
// Remove once proper types are implemented
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Any = any;
}