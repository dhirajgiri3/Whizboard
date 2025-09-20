"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Notification {
  _id: string;
  type: string;
  senderEmail: string;
  data: any;
  read: boolean;
  createdAt: string;
}

interface NotificationEvent {
  type: string;
  notification?: Notification;
  message?: string;
  timestamp?: number;
}

export function useRealTimeNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial notifications (latest 10)
  const fetchNotifications = useCallback(async (markAsRead = false) => {
    if (!session?.user?.email) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications?limit=10&markAsRead=${markAsRead}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
        setAllNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setHasMore(data.hasMore || false);
        setTotalCount(data.totalCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Load more notifications
  const loadMoreNotifications = useCallback(async () => {
    if (!session?.user?.email || !hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const offset = allNotifications.length;
      const response = await fetch(`/api/notifications?limit=10&offset=${offset}`);
      const data = await response.json();
      
      if (data.success) {
        setAllNotifications(prev => [...prev, ...data.notifications]);
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, hasMore, isLoading, allNotifications.length]);

  // Mark notifications as read
  const markNotificationsAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds,
          markAllAsRead: !notificationIds
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date() }))
        );
        setAllNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }, [session?.user?.email]);

  // Handle new notification
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 most recent
    setAllNotifications(prev => [notification, ...prev]); // Add to all notifications
    setUnreadCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);

    // Show toast notification
    switch (notification.type) {
      case 'follow':
        toast.success(`${notification.data.followerName} started following you!`, {
          description: 'Click to view their profile',
          duration: 5000,
          action: {
            label: 'View Profile',
            onClick: () => {
              window.open(`/profile/${notification.data.followerUsername}`, '_blank');
            },
          },
        });
        break;
      case 'message':
        toast.info(`New message from ${notification.data.senderName}`, {
          description: notification.data.message?.substring(0, 100) + '...',
          duration: 5000,
        });
        break;
      default:
        toast.info('New notification', {
          description: notification.data.message,
          duration: 3000,
        });
    }
  }, []);

  // Connect to SSE
  const connectSSE = useCallback(() => {
    if (!session?.user?.email || eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      const eventSource = new EventSource('/api/notifications/sse');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Notification SSE connected');
        setIsConnected(true);
        
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: NotificationEvent = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              console.log('Notification stream connected:', data.message);
              break;
            case 'newNotification':
              if (data.notification) {
                handleNewNotification(data.notification);
              }
              break;
            case 'ping':
              // Keep connection alive
              break;
            case 'error':
              console.error('Notification stream error:', data.message);
              break;
            default:
              console.log('Unknown notification event:', data);
          }
        } catch (error) {
          console.error('Error parsing notification event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Notification SSE error:', error);
        setIsConnected(false);
        eventSource.close();
        
        // Attempt to reconnect after 5 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect to notification stream...');
            connectSSE();
          }, 5000);
        }
      };

    } catch (error) {
      console.error('Failed to connect to notification SSE:', error);
    }
  }, [session?.user?.email, handleNewNotification]);

  // Disconnect from SSE
  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Initialize connection
  useEffect(() => {
    if (session?.user?.email) {
      fetchNotifications();
      connectSSE();
    }

    return () => {
      disconnectSSE();
    };
  }, [session?.user?.email, fetchNotifications, connectSSE, disconnectSSE]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSSE();
    };
  }, [disconnectSSE]);

  return {
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
    setUnreadCount: (count: number) => setUnreadCount(count),
    addNotification: handleNewNotification,
  };
}
