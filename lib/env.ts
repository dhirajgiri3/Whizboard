// Lightweight, Node-only dotenv loader. Safe to import in server code.
// Avoid importing this from client or edge runtime files.

import type {} from 'node:process';

try {
  // Only attempt to load in a Node.js environment
  if (typeof process !== 'undefined' && (process as any).release?.name === 'node') {
    // Load once per process
    if (!process.env.__DOTENV_LOADED__) {
      // Use a dynamic import to avoid bundlers trying to include dotenv in client builds
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dotenv = require('dotenv');
      dotenv.config();
      process.env.__DOTENV_LOADED__ = 'true';
    }
  }
} catch {
  // No-op if dotenv is unavailable or in non-Node environments
}

export {};



