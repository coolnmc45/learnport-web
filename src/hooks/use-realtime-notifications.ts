import { useEffect, useRef, useState } from 'react';
import { getApiBaseUrl, trpc } from '@/lib/trpc';

export type LiveNotification = {
  id?: number;
  userId: number;
  type: 'submission' | 'feedback' | 'session' | 'marking' | 'iqa' | 'system';
  title: string;
  message?: string | null;
  relatedId?: number | null;
  createdAt?: string | null;
};

export type RealtimeStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

function websocketUrl() {
  const api = getApiBaseUrl();
  const protocol = api.startsWith('https://') ? 'wss://' : 'ws://';
  return `${protocol}${api.replace(/^https?:\/\//, '')}/ws`;
}

export function useRealtimeNotifications(userId?: number) {
  const [status, setStatus] = useState<RealtimeStatus>('offline');
  const [lastNotification, setLastNotification] = useState<LiveNotification | null>(null);
  const reconnectDelay = useRef(1000);
  const unreadQuery = trpc.notifications.getUnread.useQuery({ userId: userId ?? 0 }, { enabled: Boolean(userId), refetchOnWindowFocus: true });
  const refetchUnread = unreadQuery.refetch;
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({ onSuccess: () => refetchUnread() });
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({ onSuccess: () => refetchUnread() });

  useEffect(() => {
    if (!userId || typeof window === 'undefined' || typeof WebSocket === 'undefined') {
      setStatus('offline');
      return;
    }
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      setStatus(reconnectDelay.current === 1000 ? 'connecting' : 'reconnecting');
      socket = new WebSocket(websocketUrl());
      socket.onopen = () => { reconnectDelay.current = 1000; setStatus('live'); };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as { type?: string; notification?: LiveNotification };
          if (message.type === 'notification:new' && message.notification?.userId === userId) {
            setLastNotification(message.notification);
            void refetchUnread();
          }
        } catch {
          // Ignore malformed messages; the next heartbeat or reconnect restores the stream.
        }
      };
      socket.onerror = () => { socket?.close(); };
      socket.onclose = () => {
        if (stopped) return;
        setStatus('reconnecting');
        reconnectTimer = window.setTimeout(connect, reconnectDelay.current);
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30_000);
      };
    };

    connect();
    return () => { stopped = true; if (reconnectTimer) window.clearTimeout(reconnectTimer); socket?.close(); };
  }, [refetchUnread, userId]);

  const notifications = unreadQuery.data ?? [];
  return {
    notifications,
    unreadCount: notifications.length,
    lastNotification,
    status,
    isLoading: unreadQuery.isLoading,
    error: unreadQuery.error,
    markAsRead: (notificationId: number) => markAsReadMutation.mutate({ notificationId }),
    markAllAsRead: () => userId && markAllAsReadMutation.mutate({ userId }),
    isMarkingRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    refetch: unreadQuery.refetch,
  };
}
