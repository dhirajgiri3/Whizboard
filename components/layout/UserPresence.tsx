"use client";

import { useState, useEffect } from 'react';
import { User, UserPresenceData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar/avatar";
import { Users2, UserPlus2, Wifi, WifiOff, Clock, Activity, Crown, Shield, Eye, Edit3, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserPresenceProps {
  users: User[];
  currentUserId: string;
  onOpenCollaborationAction: () => void;
  onInviteAction: () => void;
  onUserClick?: (userId: string) => void;
}

export default function UserPresence({ 
  users, 
  currentUserId, 
  onOpenCollaborationAction, 
  onInviteAction,
  onUserClick
}: UserPresenceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  const onlineUsers = users.filter(user => user.isOnline);
  const maxVisible = 4;
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const extraCount = Math.max(0, onlineUsers.length - maxVisible);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (user: User) => {
    if (!user.presence) return 'bg-green-500';
    
    switch (user.presence.status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-green-500';
    }
  };

  const getConnectionQualityIcon = (user: User) => {
    if (!user.presence?.connectionQuality) return null;
    
    switch (user.presence.connectionQuality) {
      case 'excellent':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'good':
        return <Wifi className="w-3 h-3 text-yellow-500" />;
      case 'poor':
        return <Wifi className="w-3 h-3 text-red-500" />;
      case 'disconnected':
        return <WifiOff className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (user: User) => {
    if (!user.presence) return null;
    
    if (user.presence.isDrawing) return <Edit3 className="w-3 h-3 text-blue-500" />;
    if (user.presence.isTyping) return <MessageSquare className="w-3 h-3 text-purple-500" />;
    if (user.presence.isSelecting) return <Eye className="w-3 h-3 text-green-500" />;
    return <Activity className="w-3 h-3 text-gray-400" />;
  };

  const getRoleIcon = (user: User) => {
    if (!user.permissions) return null;
    
    switch (user.permissions.role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-amber-500" />;
      case 'admin':
        return <Shield className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <motion.div 
        className="bg-white/95 backdrop-blur-xl shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 border border-slate-200/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={onOpenCollaborationAction}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* User Avatars */}
        <div className="flex -space-x-2 items-center">
          <AnimatePresence>
            {visibleUsers.map((user, index) => (
              <motion.div 
                key={user.id} 
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(selectedUser === user.id ? null : user.id);
                  onUserClick?.(user.id);
                }}
              >
                <Avatar 
                  className={`h-8 w-8 border-2 border-white shadow-md transition-all duration-200 ${
                    isHovered ? 'scale-110' : ''
                  } ${selectedUser === user.id ? 'ring-2 ring-blue-500' : ''}`}
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
                
                {/* Status indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user)}`}></div>
                
                {/* Current user indicator */}
                {user.id === currentUserId && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border border-white"></div>
                )}
                
                {/* Activity indicator */}
                {getActivityIcon(user) && (
                  <div className="absolute -top-1 -left-1 p-0.5 bg-white rounded-full shadow-sm">
                    {getActivityIcon(user)}
                  </div>
                )}
                
                {/* Role indicator */}
                {getRoleIcon(user) && (
                  <div className="absolute -bottom-1 -left-1 p-0.5 bg-white rounded-full shadow-sm">
                    {getRoleIcon(user)}
                  </div>
                )}
                
                {/* Enhanced tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 min-w-max">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {user.id === currentUserId ? `${user.name} (You)` : user.name}
                    </span>
                    {getConnectionQualityIcon(user)}
                  </div>
                  {user.presence?.currentActivity && (
                    <div className="text-slate-300 text-xs">
                      {user.presence.currentActivity}
                    </div>
                  )}
                  {user.presence?.sessionDuration && (
                    <div className="text-slate-300 text-xs flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(user.presence.sessionDuration)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Extra count indicator */}
          {extraCount > 0 && (
            <motion.div 
              className="h-8 w-8 flex items-center justify-center bg-slate-100 text-slate-700 rounded-full border-2 border-white shadow-md text-xs font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              +{extraCount}
            </motion.div>
          )}
        </div>

        {/* Collaboration indicator */}
        <div className="flex items-center gap-1 text-slate-600">
          <Users2 className="w-4 h-4" />
          <span className="text-sm font-medium">{onlineUsers.length}</span>
        </div>

        {/* Quick invite button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onInviteAction();
          }}
          className="ml-1 p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
          title="Quick invite"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <UserPlus2 className="w-3 h-3" />
        </motion.button>
      </motion.div>

      {/* Detailed user view */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 min-w-64"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const user = users.find(u => u.id === selectedUser);
              if (!user) return null;
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                        alt={user.name} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{user.name}</span>
                        {user.id === currentUserId && (
                          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                        {getRoleIcon(user)}
                      </div>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.presence && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.presence.status === 'online' ? 'bg-green-100 text-green-700' :
                          user.presence.status === 'away' ? 'bg-yellow-100 text-yellow-700' :
                          user.presence.status === 'busy' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.presence.status}
                        </span>
                      </div>
                      
                      {user.presence.currentActivity && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Activity</span>
                          <span className="text-slate-800 font-medium">{user.presence.currentActivity}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Session</span>
                        <span className="text-slate-800 font-medium">
                          {formatDuration(user.presence.sessionDuration)}
                        </span>
                      </div>
                      
                      {user.presence.connectionQuality && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Connection</span>
                          <div className="flex items-center gap-1">
                            {getConnectionQualityIcon(user)}
                            <span className="text-slate-800 font-medium capitalize">
                              {user.presence.connectionQuality}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {user.activity && (
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs text-slate-500 mb-2">Activity Stats</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Actions</span>
                          <div className="font-medium">{user.activity.totalActions}</div>
                        </div>
                        <div>
                          <span className="text-slate-600">Score</span>
                          <div className="font-medium">{user.activity.collaborationScore}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating tooltip */}
      <AnimatePresence>
        {isHovered && !selectedUser && (
          <motion.div 
            className="absolute top-12 right-0 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 opacity-90 pointer-events-none whitespace-nowrap"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            Click to open collaboration panel
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 