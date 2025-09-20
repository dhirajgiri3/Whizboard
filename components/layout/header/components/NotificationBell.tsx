"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Users, MessageSquare, Check, Wifi, WifiOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useHeaderTheme } from '../hooks/useHeaderTheme';
import { useRealTimeNotifications } from '@/hooks';

interface Notification {
  _id: string;
  type: string;
  senderEmail: string;
  data: any;
  read: boolean;
  createdAt: string;
}

const NotificationBell = () => {
  const { data: session } = useSession();
  const { isLightMode } = useHeaderTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const {
    notifications,
    allNotifications,
    unreadCount,
    isConnected,
    isLoading,
    hasMore,
    totalCount,
    fetchNotifications,
    loadMoreNotifications,
    markNotificationsAsRead,
    setUnreadCount
  } = useRealTimeNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `${notification.data.followerName} started following you`;
      case 'message':
        return `New message from ${notification.data.senderName}`;
      default:
        return notification.data.message || 'New notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!session?.user?.email) return null;

  const buttonHover = isLightMode ? 'hover:bg-gray-100' : 'hover:bg-white/5';
  const iconColor = isLightMode ? 'text-gray-700' : 'text-white/80';
  const ringColor = isLightMode ? 'ring-white' : 'ring-[#0A0A0B]';
  const dropdownBg = isLightMode ? 'bg-white border-gray-200' : 'bg-[#111111] border-white/10';
  const headingColor = isLightMode ? 'text-gray-900' : 'text-white';
  const subTextColor = isLightMode ? 'text-gray-600' : 'text-white/60';

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Mark notifications as read when opening
            markNotificationsAsRead();
          }
        }}
        className={`relative p-1.5 sm:p-2 rounded-full ${buttonHover} transition-colors`}
        title={`${unreadCount > 0 ? `${unreadCount} unread • ` : ''}${isConnected ? 'Connected' : 'Disconnected'}`}
      >
        <span className="relative inline-flex">
          <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          {unreadCount > 0 && (
            <span
              className={`absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center ${ringColor} ring-2`}
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {/* Connection status indicator */}
          <span
            className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-2 h-2 sm:w-2.5 sm:h-2.5 ${
              isConnected ? 'bg-emerald-500' : 'bg-gray-400'
            } rounded-full ${ringColor} ring-2`}
            aria-hidden="true"
          />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-xl border z-50 ${dropdownBg} backdrop-blur-md shadow-2xl`}
          >
            <div className={`p-3 sm:p-4 border-b ${isLightMode ? 'border-gray-200' : 'border-white/10'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm sm:text-base ${headingColor}`}>Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`${subTextColor} hover:opacity-80 transition-colors`}
                >
                  <X className={`w-4 h-4 ${subTextColor}`} />
                </button>
              </div>
            </div>

            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`p-4 text-center ${subTextColor}`}>
                  <Bell className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50 ${subTextColor}`} />
                  <div className="text-sm sm:text-base">No notifications yet</div>
                  {!isConnected && (
                    <div className="text-xs mt-2 flex items-center justify-center gap-1">
                      <WifiOff className="w-3 h-3" />
                      Notifications disconnected
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {/* Show either latest 10 or all notifications */}
                  {(showAllNotifications ? allNotifications : notifications).map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2.5 sm:p-3 rounded-lg mb-2 transition-colors ${
                        notification.read 
                          ? (isLightMode ? 'bg-gray-50' : 'bg-white/5')
                          : (isLightMode ? 'bg-blue-50 border border-blue-200' : 'bg-blue-500/10 border border-blue-500/20')
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`${isLightMode ? 'text-gray-900' : 'text-white'} text-xs sm:text-sm leading-relaxed`}>
                            {getNotificationText(notification)}
                          </p>
                          <p className={`${subTextColor} text-xs mt-1`}>
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 mt-2 ${isLightMode ? 'bg-blue-500' : 'bg-blue-400'}`} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination and controls */}
            <div className={`p-2.5 sm:p-3 border-t ${isLightMode ? 'border-gray-200' : 'border-white/10'} space-y-2`}>
              {/* Show more/less toggle */}
              {totalCount > 10 && (
                <button
                  onClick={() => {
                    if (showAllNotifications) {
                      setShowAllNotifications(false);
                    } else {
                      setShowAllNotifications(true);
                      // Load more notifications if needed
                      if (allNotifications.length <= 10 && hasMore) {
                        loadMoreNotifications();
                      }
                    }
                  }}
                  className={`w-full text-center ${subTextColor} hover:opacity-80 text-xs sm:text-sm transition-colors`}
                >
                  {showAllNotifications ? 'Show Latest 10' : `See All (${totalCount})`}
                </button>
              )}
              
              {/* Load more button */}
              {showAllNotifications && hasMore && (
                <button
                  onClick={loadMoreNotifications}
                  disabled={isLoading}
                  className={`w-full text-center ${subTextColor} hover:opacity-80 text-xs sm:text-sm transition-colors disabled:opacity-50`}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              )}
              
              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markNotificationsAsRead();
                    setIsOpen(false);
                  }}
                  className={`w-full text-center ${subTextColor} hover:opacity-80 text-xs sm:text-sm transition-colors`}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
