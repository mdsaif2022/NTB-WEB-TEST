import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { notificationService } from '@/lib/firebaseServices';
import { useFirebaseAuth } from './FirebaseAuthContext';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

interface FirebaseNotificationContextType {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<Notification | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const FirebaseNotificationContext = createContext<FirebaseNotificationContextType | undefined>(undefined);

export const FirebaseNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useFirebaseAuth();

  // Load notifications for current user
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const userNotifications = await notificationService.getUserNotifications(currentUser.uid);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [currentUser]);

  // Listen to notifications changes for current user
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = notificationService.onUserNotificationsChange(
      currentUser.uid,
      (userNotifications) => {
        setNotifications(userNotifications);
      }
    );

    return unsubscribe;
  }, [currentUser]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const addedNotification = await notificationService.addNotification(notificationData);
      if (addedNotification) {
        // Firebase listener will update the state automatically
        console.log('Notification added successfully');
        return addedNotification;
      }
      return null;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        // Firebase listener will update the state automatically
        console.log('Notification marked as read');
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.id)));
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const success = await notificationService.deleteNotification(id);
      if (success) {
        // Firebase listener will update the state automatically
        console.log('Notification deleted successfully');
      } else {
        console.error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(notifications.map(n => notificationService.deleteNotification(n.id)));
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: FirebaseNotificationContextType = {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };

  return (
    <FirebaseNotificationContext.Provider value={value}>
      {children}
    </FirebaseNotificationContext.Provider>
  );
};

export const useFirebaseNotifications = () => {
  const context = useContext(FirebaseNotificationContext);
  if (context === undefined) {
    throw new Error('useFirebaseNotifications must be used within a FirebaseNotificationProvider');
  }
  return context;
};
