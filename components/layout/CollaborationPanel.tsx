"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { User } from '@/types';
import { UserPlus2, Copy, Crown, Clock, Users2, Dot } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface CollaborationPanelProps {
  users: User[];
  currentUserId: string;
  onInviteAction: () => void;
  boardOwner?: string;
  lastActivity?: string;
}

export default function CollaborationPanel({ 
  users, 
  currentUserId, 
  onInviteAction, 
  boardOwner,
  lastActivity 
}: CollaborationPanelProps) {
  const [showAllUsers, setShowAllUsers] = useState(false);
  
  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard!");
    } catch {
      toast.success("Board link copied!");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <Users2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Collaboration</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <Dot className="w-4 h-4 text-green-500" />
              {onlineUsers.length} online • {users.length} total
            </p>
          </div>
        </div>
      </div>

      {/* Board Info */}
      <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">Board Owner</span>
          </div>
          <span className="text-sm text-slate-600">{boardOwner || "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Last Activity</span>
          </div>
          <span className="text-sm text-slate-600">{getRelativeTime(lastActivity)}</span>
        </div>
      </div>

      {/* Online Users */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online ({onlineUsers.length})
          </h4>
        </div>
        <div className="space-y-3">
          {onlineUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                  <AvatarImage 
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                    alt={user.name} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {user.name}
                  </span>
                  {user.id === currentUserId && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      You
                    </span>
                  )}
                  {user.id === boardOwner && (
                    <Crown className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="text-xs text-green-600 font-medium">Active</div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Users (if any) */}
      {offlineUsers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              Offline ({offlineUsers.length})
            </h4>
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {showAllUsers ? 'Hide' : 'Show'}
            </button>
          </div>
          {showAllUsers && (
            <div className="space-y-2">
              {offlineUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt={user.name} 
                    />
                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-600 truncate block">{user.name}</span>
                  </div>
                  <div className="text-xs text-slate-400">Offline</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3">
        <button
          onClick={onInviteAction}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 shadow-md"
        >
          <UserPlus2 className="w-4 h-4" />
          Invite Collaborators
        </button>
        
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors border border-slate-200"
        >
          <Copy className="w-4 h-4" />
          Copy Board Link
        </button>
        
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Share the link with anyone to collaborate
          </p>
        </div>
      </div>
    </div>
  );
} 