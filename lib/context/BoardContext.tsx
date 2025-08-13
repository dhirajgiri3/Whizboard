"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/http/axios';

interface BoardMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  owner?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    username?: string;
  };
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
    isOnline: boolean;
    joinedAt?: string;
  }>;
  pendingInvitations?: number;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt?: string;
}

interface BoardContextType {
  boardMetadata: BoardMetadata | null;
  setBoardMetadata: (metadata: BoardMetadata | null) => void;
  updateBoardName: (name: string) => void;
  updateBoardUpdatedAt: (updatedAt?: string) => void;
  updateBoardTimestamp: (boardId: string) => Promise<void>;
  fetchBoardMetadata: (boardId: string) => Promise<void>;
  addCollaborator: (collaborator: Collaborator) => void;
  removeCollaborator: (collaboratorId: string) => void;
  updateCollaboratorStatus: (collaboratorId: string, isOnline: boolean) => void;
  incrementPendingInvitations: () => void;
  decrementPendingInvitations: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [boardMetadata, setBoardMetadataState] = useState<BoardMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setBoardMetadata = useCallback((metadata: BoardMetadata | null) => {
    setBoardMetadataState(metadata);
  }, []);

  const updateBoardName = useCallback((name: string) => {
    setBoardMetadataState(prev => 
      prev ? { 
        ...prev, 
        name, 
        updatedAt: new Date().toISOString() 
      } : null
    );
  }, []);

  const updateBoardUpdatedAt = useCallback((updatedAt?: string) => {
    setBoardMetadataState(prev => 
      prev ? { 
        ...prev, 
        updatedAt: updatedAt || new Date().toISOString() 
      } : null
    );
  }, []);

  const fetchBoardMetadata = useCallback(async (boardId: string) => {
    if (!boardId) return;
    
    setIsLoading(true);
    try {
      const { data: metadata } = await api.get(`/api/board/${boardId}/metadata`);
      setBoardMetadataState(metadata);
    } catch (error) {
      console.error('Error fetching board metadata:', error);
      // Don't throw error, just log it - let the component handle fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBoardTimestamp = useCallback(async (boardId: string) => {
    if (!boardId) return;
    
    try {
      const { data: result } = await api.patch(`/api/board/${boardId}/update-timestamp`);
      // Update local state with new timestamp
      if ((result as any).updatedAt) {
        updateBoardUpdatedAt((result as any).updatedAt);
      }
    } catch (error) {
      console.error('Error updating board timestamp:', error);
      // Still update local timestamp even if API fails
      updateBoardUpdatedAt();
    }
  }, [updateBoardUpdatedAt]);

  const addCollaborator = useCallback((collaborator: Collaborator) => {
    setBoardMetadataState(prev => 
      prev ? {
        ...prev,
        collaborators: [...(prev.collaborators || []), collaborator]
      } : null
    );
  }, []);

  const removeCollaborator = useCallback((collaboratorId: string) => {
    setBoardMetadataState(prev => 
      prev ? {
        ...prev,
        collaborators: (prev.collaborators || []).filter(c => c.id !== collaboratorId)
      } : null
    );
  }, []);

  const updateCollaboratorStatus = useCallback((collaboratorId: string, isOnline: boolean) => {
    setBoardMetadataState(prev => 
      prev ? {
        ...prev,
        collaborators: (prev.collaborators || []).map(c => 
          c.id === collaboratorId ? { ...c, isOnline } : c
        )
      } : null
    );
  }, []);

  const incrementPendingInvitations = useCallback(() => {
    setBoardMetadataState(prev => 
      prev ? {
        ...prev,
        pendingInvitations: (prev.pendingInvitations || 0) + 1
      } : null
    );
  }, []);

  const decrementPendingInvitations = useCallback(() => {
    setBoardMetadataState(prev => 
      prev ? {
        ...prev,
        pendingInvitations: Math.max(0, (prev.pendingInvitations || 0) - 1)
      } : null
    );
  }, []);

  const value: BoardContextType = {
    boardMetadata,
    setBoardMetadata,
    updateBoardName,
    updateBoardUpdatedAt,
    updateBoardTimestamp,
    fetchBoardMetadata,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorStatus,
    incrementPendingInvitations,
    decrementPendingInvitations,
    isLoading,
    setIsLoading,
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
}

// Utility function to format relative time
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  } catch {
    return dateString;
  }
}

// Utility function to format absolute time
export function formatAbsoluteTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
