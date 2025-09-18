/**
 * Simplified CRDT Provider for React Context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { CRDTDocumentConfig } from './CRDTDocument';
import { useCRDTDocument, UseCRDTDocumentResult } from './useCRDTDocument';

interface CRDTContextValue extends UseCRDTDocumentResult {
  config: CRDTDocumentConfig;
}

const CRDTContext = createContext<CRDTContextValue | null>(null);

interface CRDTProviderProps {
  config: CRDTDocumentConfig;
  children: ReactNode;
}

/**
 * CRDT Provider component
 */
export function CRDTProvider({ config, children }: CRDTProviderProps) {
  const crdtResult = useCRDTDocument(config);

  const contextValue: CRDTContextValue = {
    ...crdtResult,
    config,
  };

  return (
    <CRDTContext.Provider value={contextValue}>
      {children}
    </CRDTContext.Provider>
  );
}

/**
 * Hook to access CRDT context
 */
export function useCRDTContext(): CRDTContextValue {
  const context = useContext(CRDTContext);
  if (!context) {
    throw new Error('useCRDTContext must be used within a CRDTProvider');
  }
  return context;
}

/**
 * Hook to access CRDT document directly
 */
export function useCRDT() {
  const { document } = useCRDTContext();
  return document;
}