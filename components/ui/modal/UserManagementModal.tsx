"use client";

import React, { useState, useEffect } from 'react';
import { X, Crown, Shield, User, UserX, UserCheck, MoreVertical, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useBoardUserManagement } from '@/hooks';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardName: string;
  isMobile?: boolean;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  boardId,
  boardName,
  isMobile
}: UserManagementModalProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  const {
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
  } = useBoardUserManagement({ boardId });

  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  }, [isOpen]);

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'collaborator':
        return <User className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <UserX className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'collaborator':
        return 'Collaborator';
      case 'blocked':
        return 'Blocked';
      default:
        return 'Unknown';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'collaborator':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const canModifyUser = (user: any) => {
    if (!canManageUsers) return false;
    if (user.role === 'owner') return currentUserRole === 'owner';
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin') return user.role !== 'admin';
    return false;
  };

  const handleAction = async (action: string, user: any) => {
    if (!canModifyUser(user)) return;

    setPendingAction({
      action,
      userId: user.id,
      userName: user.name
    });
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      switch (pendingAction.action) {
        case 'promote_to_admin':
          await promoteToAdmin(pendingAction.userId);
          break;
        case 'demote_from_admin':
          await demoteFromAdmin(pendingAction.userId);
          break;
        case 'remove_user':
          await removeUser(pendingAction.userId);
          break;
        case 'block_user':
          await blockUser(pendingAction.userId);
          break;
        case 'unblock_user':
          await unblockUser(pendingAction.userId);
          break;
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Manage Users</h2>
                <p className="text-sm text-slate-500">{boardName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-600">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                        <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-800">{user.name}</h3>
                          {getRoleIcon(user.role)}
                        </div>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs text-slate-500">{user.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>

                    {canModifyUser(user) && (
                      <div className="relative">
                        <button onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical size={16} />
                        </button>

                        {selectedUser?.id === user.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200/60 z-10">
                            <div className="py-1">
                              {user.role === 'collaborator' && (
                                <button onClick={() => handleAction('promote_to_admin', user)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-blue-500" />
                                  Promote to Admin
                                </button>
                              )}
                              {user.role === 'admin' && (
                                <button onClick={() => handleAction('demote_from_admin', user)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                  <User className="w-4 h-4 text-green-500" />
                                  Demote to Collaborator
                                </button>
                              )}
                              {user.role === 'blocked' ? (
                                <button onClick={() => handleAction('unblock_user', user)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-green-500" />
                                  Unblock User
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => handleAction('block_user', user)} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2">
                                    <UserX className="w-4 h-4 text-red-500" />
                                    Block User
                                  </button>
                                  <button onClick={() => handleAction('remove_user', user)} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                    <UserX className="w-4 h-4" />
                                    Remove from Board
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200/60 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {users.length} user{users.length !== 1 ? 's' : ''} • {users.filter((u: any) => u.isOnline).length} online
              </div>
              <button onClick={refreshUsers} className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/60 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-800">Confirm Action</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to {pendingAction.action.replace('_', ' ')} <strong>{pendingAction.userName}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDialog(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmAction} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
