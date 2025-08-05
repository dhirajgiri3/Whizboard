"use client";

import React, { ReactNode } from 'react';
import { AppProvider } from '@/lib/context/AppContext';
import { ContentProvider } from '@/lib/context/ContentContext';
import { SettingsProvider } from '@/lib/context/SettingsContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppProvider>
      <ContentProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </ContentProvider>
    </AppProvider>
  );
}
