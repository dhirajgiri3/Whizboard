"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Users, Crown, Wifi, WifiOff, UserPlus, Mail } from 'lucide-react';
import { useBoardContext } from '@/components/context/BoardContext';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  joinedAt?: string;
  isOwner?: boolean;
}

interface CollaborationStatsProps {
  boardId: string;
  currentUser?: User;
  isOwner?: boolean;
}

export default function CollaborationStats({ 
  boardId, 
  currentUser, 
  isOwner = false 
}: CollaborationStatsProps) {
  const { boardMetadata } = useBoardContext();
  const [showDetails, setShowDetails] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const collaborators = boardMetadata?.collaborators || [];
  const pendingInvitations = boardMetadata?.pendingInvitations || 0;
  const onlineCount = collaborators.filter(c => c.isOnline).length;
  const totalUsers = collaborators.length + (currentUser ? 1 : 0);

  const handleQuickInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    setIsInviting(true);
    try {
      const response = await fetch('/api/board/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId,
          inviteeEmail: inviteEmail.trim(),
          message: 'Join our collaborative whiteboard session!'
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Invitation sent to ${inviteEmail}!`);
        setInviteEmail('');
      } else {
        toast.error(data.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const formatJoinTime = (joinedAt?: string) => {
    if (!joinedAt) return 'Just joined';
    const date = new Date(joinedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just joined';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Collaboration</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
            <Wifi className="w-4 h-4" />
            <span className="text-lg font-bold">{onlineCount}</span>
          </div>
          <p className="text-xs text-green-700">Online Now</p>
        </div>
        
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-lg font-bold">{totalUsers}</span>
          </div>
          <p className="text-xs text-blue-700">Total Users</p>
        </div>
        
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
            <Mail className="w-4 h-4" />
            <span className="text-lg font-bold">{pendingInvitations}</span>
          </div>
          <p className="text-xs text-orange-700">Pending</p>
        </div>
      </div>

      {/* Quick Invite (Owner Only) */}
      {isOwner && (
        <form onSubmit={handleQuickInvite} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email to invite..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isInviting}
            />
            <button
              type="submit"
              disabled={!inviteEmail.trim() || isInviting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-1"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isInviting ? 'Sending...' : 'Invite'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div className="space-y-3">
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Active Collaborators</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {/* Current User */}
              {currentUser && (
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                  <div className="relative">
                    <Image
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`}
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentUser.name} (You)
                      </p>
                      {isOwner && <Crown className="w-3 h-3 text-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <Wifi className="w-3 h-3" />
                    <span className="text-xs font-medium">Online</span>
                  </div>
                </div>
              )}

              {/* Other Collaborators */}
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <Image
                      src={collaborator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${collaborator.id}`}
                      alt={collaborator.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {collaborator.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{collaborator.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className={`flex items-center space-x-1 ${
                      collaborator.isOnline ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {collaborator.isOnline ? (
                        <Wifi className="w-3 h-3" />
                      ) : (
                        <WifiOff className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">
                        {collaborator.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatJoinTime(collaborator.joinedAt)}
                    </span>
                  </div>
                </div>
              ))}

              {collaborators.length === 0 && !currentUser && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No active collaborators
                </div>
              )}
            </div>
          </div>

          {/* Pending Invitations */}
          {pendingInvitations > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Pending Invitations ({pendingInvitations})
              </h4>
              <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-2">
                <Mail className="w-4 h-4" />
                <span>
                  {pendingInvitations} invitation{pendingInvitations !== 1 ? 's' : ''} waiting for response
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
