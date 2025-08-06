"use client";

import { useState } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { Users2, UserPlus2 } from 'lucide-react';

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
  onOpenCollaborationAction: () => void;
  onInviteAction: () => void;
}

export default function UserPresence({ 
  users, 
  currentUserId, 
  onOpenCollaborationAction, 
  onInviteAction 
}: UserPresenceProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const onlineUsers = users.filter(user => user.isOnline);
  const maxVisible = 4;
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const extraCount = Math.max(0, onlineUsers.length - maxVisible);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <div 
        className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 border border-slate-200/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={onOpenCollaborationAction}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* User Avatars */}
        <div className="flex -space-x-2 items-center">
          {visibleUsers.map((user, index) => (
            <div key={user.id} className="relative group">
              <Avatar 
                className={`h-8 w-8 border-2 border-white shadow-md transition-transform duration-200 ${
                  isHovered ? 'scale-110' : ''
                }`}
                style={{ zIndex: maxVisible - index }}
              >
                <AvatarImage 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt={user.name} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              
              {/* Current user indicator */}
              {user.id === currentUserId && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border border-white"></div>
              )}
              
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {user.id === currentUserId ? `${user.name} (You)` : user.name}
              </div>
            </div>
          ))}
          
          {/* Extra count indicator */}
          {extraCount > 0 && (
            <div className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full border-2 border-white shadow-md text-xs font-bold">
              +{extraCount}
            </div>
          )}
        </div>

        {/* Collaboration indicator */}
        <div className="flex items-center gap-1 text-slate-600">
          <Users2 className="w-4 h-4" />
          <span className="text-sm font-medium">{onlineUsers.length}</span>
        </div>

        {/* Quick invite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInviteAction();
          }}
          className="ml-1 p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          title="Quick invite"
        >
          <UserPlus2 className="w-3 h-3" />
        </button>
      </div>

      {/* Floating tooltip */}
      {isHovered && (
        <div className="absolute top-12 right-0 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-90 pointer-events-none whitespace-nowrap">
          Click to open collaboration panel
        </div>
      )}
    </div>
  );
} 