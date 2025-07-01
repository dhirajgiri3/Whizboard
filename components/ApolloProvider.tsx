"use client";

import { ApolloProvider as Provider } from '@apollo/client';
import { client } from '@/lib/apollo/client';
import { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
} 