import { useState, useEffect, useCallback } from 'react';

import notificationService from '../services/notifications';

import type { Notification, NotificationPreferences } from '../types/notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Cargar notificaciones
  const loadNotifications = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(page, limit);
      setNotifications(data.results || data);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId.toString());
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId.toString());
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Recalcular unread count
      const updatedUnread = notifications.filter(n => n.id !== notificationId && !n.is_read).length;
      setUnreadCount(updatedUnread);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Alias para compatibilidad con código existente
  const fetchNotifications = loadNotifications;

  // Cargar preferencias
  const loadPreferences = useCallback(async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, []);

  // Actualizar preferencias
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const data = await notificationService.updatePreferences(newPreferences);
      setPreferences(data);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }, []);

  // Solicitar permisos de notificación
  const requestPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        setPermission('denied');
        return false;
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setPermission('denied');
      return false;
    }
  }, []);

  // Suscribirse a producto
  const subscribeToProduct = useCallback(async (productId: string) => {
    try {
      await notificationService.subscribeToProduct(productId);
    } catch (error) {
      console.error('Error subscribing to product:', error);
    }
  }, []);

  // Cancelar suscripción a producto
  const unsubscribeFromProduct = useCallback(async (productId: string) => {
    try {
      await notificationService.unsubscribeFromProduct(productId);
    } catch (error) {
      console.error('Error unsubscribing from product:', error);
    }
  }, []);

  // Inicializar servicio
  const initialize = useCallback(async (userId: string) => {
    if (isInitialized) return;

    try {
      const success = await notificationService.initialize(userId);
      if (success) {
        setIsInitialized(true);
        await loadNotifications();
        await loadPreferences();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [isInitialized, loadNotifications, loadPreferences]);

  // Escuchar nuevas notificaciones
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      const payload = event.detail;
      const newNotification: Notification = {
        id: Date.now(), // Temporal, el backend debería proporcionar ID
        title: payload.notification?.title || 'Nueva notificación',
        message: payload.notification?.body || '',
        notification_type: payload.data?.type || 'account_update',
        is_read: false,
        created_at: new Date().toISOString(),
        read_at: null,
        data: payload.data,
        action_url: payload.data?.action_url || null,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('notification-received', handleNewNotification as EventListener);

    return () => {
      window.removeEventListener('notification-received', handleNewNotification as EventListener);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    isInitialized,
    permission,
    loadNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadPreferences,
    updatePreferences,
    subscribeToProduct,
    unsubscribeFromProduct,
    requestPermission,
    initialize
  };
};
