import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/http/axios';
import { toast } from 'sonner';

interface BoardUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  role: 'owner' | 'admin' | 'collaborator' | 'blocked';
}

interface UseBoardUserManagementProps {
  boardId: string;
}

interface UseBoardUserManagementReturn {
  users: BoardUser[];
  currentUserRole: 'owner' | 'admin' | 'collaborator' | null;
  canManageUsers: boolean;
  isLoading: boolean;
  error: string | null;
  promoteToAdmin: (userId: string) => Promise<void>;
  demoteFromAdmin: (userId: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export function useBoardUserManagement({ boardId }: UseBoardUserManagementProps): UseBoardUserManagementReturn {
  const { data: session } = useSession();
  const [users, setUsers] = useState<BoardUser[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<'owner' | 'admin' | 'collaborator' | null>(null);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!boardId || !session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/api/board/${boardId}/admin/manage-users`);
      setUsers(data.users || []);
      setCurrentUserRole(data.currentUserRole || null);
      setCanManageUsers(data.canManageUsers || false);
    } catch (err: any) {
      console.error('Error fetching board users:', err);
      setError(err.response?.data?.error || 'Failed to fetch users');
      toast.error('Failed to load board users');
    } finally {
      setIsLoading(false);
    }
  }, [boardId, session?.user?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const performUserAction = useCallback(async (
    action: string,
    userId: string,
    successMessage: string
  ) => {
    if (!boardId || !session?.user?.id) return;

    try {
      await api.post(`/api/board/${boardId}/admin/manage-users`, {
        action,
        targetUserId: userId
      });

      toast.success(successMessage);
      await fetchUsers(); // Refresh the user list
    } catch (err: any) {
      console.error(`Error performing ${action}:`, err);
      const errorMessage = err.response?.data?.error || `Failed to ${action.replace('_', ' ')}`;
      toast.error(errorMessage);
      throw err;
    }
  }, [boardId, session?.user?.id, fetchUsers]);

  const promoteToAdmin = useCallback(async (userId: string) => {
    await performUserAction(
      'promote_to_admin',
      userId,
      'User promoted to admin successfully'
    );
  }, [performUserAction]);

  const demoteFromAdmin = useCallback(async (userId: string) => {
    await performUserAction(
      'demote_from_admin',
      userId,
      'User demoted from admin successfully'
    );
  }, [performUserAction]);

  const removeUser = useCallback(async (userId: string) => {
    await performUserAction(
      'remove_user',
      userId,
      'User removed from board successfully'
    );
  }, [performUserAction]);

  const blockUser = useCallback(async (userId: string) => {
    await performUserAction(
      'block_user',
      userId,
      'User blocked successfully'
    );
  }, [performUserAction]);

  const unblockUser = useCallback(async (userId: string) => {
    await performUserAction(
      'unblock_user',
      userId,
      'User unblocked successfully'
    );
  }, [performUserAction]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    currentUserRole,
    canManageUsers,
    isLoading,
    error,
    promoteToAdmin,
    demoteFromAdmin,
    removeUser,
    blockUser,
    unblockUser,
    refreshUsers
  };
}
