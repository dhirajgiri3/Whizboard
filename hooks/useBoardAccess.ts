'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BoardAccess {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseBoardAccessOptions {
  boardId: string;
  redirectOnDeny?: boolean;
  redirectTo?: string;
}

export function useBoardAccess({ 
  boardId, 
  redirectOnDeny = true, 
  redirectTo 
}: UseBoardAccessOptions): BoardAccess {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boardAccess, setBoardAccess] = useState<BoardAccess>({
    hasAccess: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function checkAccess() {
      if (status === 'loading') return;

      // If not authenticated, deny access
      if (!session) {
        setBoardAccess({
          hasAccess: false,
          isLoading: false,
          error: 'Authentication required'
        });
        
        if (redirectOnDeny) {
          const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/board/${boardId}`)}`;
          router.push(loginUrl);
        }
        return;
      }

      try {
        // Check board access via API
        const response = await fetch(`/api/board/${boardId}/metadata`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setBoardAccess({
            hasAccess: true,
            isLoading: false,
            error: null
          });
        } else if (response.status === 403) {
          setBoardAccess({
            hasAccess: false,
            isLoading: false,
            error: 'Access denied to this board'
          });
          
          if (redirectOnDeny) {
            const redirectUrl = redirectTo || '/my-boards';
            router.push(redirectUrl);
          }
        } else if (response.status === 404) {
          setBoardAccess({
            hasAccess: false,
            isLoading: false,
            error: 'Board not found'
          });
          
          if (redirectOnDeny) {
            router.push('/my-boards');
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Error checking board access:', error);
        setBoardAccess({
          hasAccess: false,
          isLoading: false,
          error: 'Failed to verify board access'
        });
        
        if (redirectOnDeny) {
          router.push('/my-boards');
        }
      }
    }

    checkAccess();
  }, [session, status, boardId, redirectOnDeny, redirectTo, router]);

  return boardAccess;
}

// Convenience hook for checking if user is board owner
export function useBoardOwnership(boardId: string) {
  const { data: session, status } = useSession();
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkOwnership() {
      if (status === 'loading' || !session) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/board/${boardId}/metadata`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const boardData = await response.json();
          setIsOwner(boardData.ownerId === session.user.id);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error checking board ownership:', error);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkOwnership();
  }, [session, status, boardId]);

  return { isOwner, isLoading };
}
