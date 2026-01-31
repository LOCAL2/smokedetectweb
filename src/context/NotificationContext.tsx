import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface NotificationItem {
  id: string;
  type: 'danger' | 'warning' | 'info';
  sensorId: string;
  sensorName: string;
  location: string;
  value: number;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearOld: (days: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = 'notification-history';
const MAX_NOTIFICATIONS = 100;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToStorage = (items: NotificationItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
    } catch {
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
    }
  };

  const addNotification = useCallback(
    (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: NotificationItem = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearOld = useCallback((days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    setNotifications((prev) => {
      const updated = prev.filter((n) => new Date(n.timestamp) > cutoff);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearOld,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
