import { useState, useEffect, useCallback } from 'react';

import notificationService from '../services/notificationService';
import {
  getFCMToken,
  onMessageListener,
  requestNotificationPermission,
} from '../config/firebaseConfig';

import type { Notification } from '../types/notification';

// ========================================
// HOOK: useNotifications
// ========================================

interface UseNotificationsReturn {
  // Estado
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  permission: NotificationPermission;

  // Acciones
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  requestPermission: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // ==================== SOLICITAR PERMISOS ====================

  const requestPermission = useCallback(async () => {
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Obtener token FCM
        const token = await getFCMToken();

        if (token) {
          // Registrar token en backend
          await notificationService.registerFCMToken({
            token,
            device_type: 'web',
            device_name: navigator.userAgent.substring(0, 100),
          });

          console.log('✅ Token FCM registrado en backend');
        }
      }
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
    }
  }, []);

  // ==================== OBTENER CONTADOR ====================

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      // Solo logear errores que no sean de autenticación
      if (error?.response?.status !== 401) {
        console.error('Error al obtener contador de no leídas:', error);
      }
      setUnreadCount(0);
    }
  }, []);

  // ==================== OBTENER NOTIFICACIONES ====================

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(1, 5);
      setNotifications(response.results);
    } catch (error: any) {
      // Solo logear errores que no sean de autenticación
      if (error?.response?.status !== 401) {
        console.error('Error al obtener notificaciones:', error);
      }
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== MARCAR COMO LEÍDA ====================

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );

      // Decrementar contador
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  }, []);

  // ==================== MARCAR TODAS COMO LEÍDAS ====================

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Actualizar estado local
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, []);

  // ==================== ESCUCHAR MENSAJES EN FOREGROUND ====================

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log('📩 Nueva notificación:', payload);

      // Mostrar notificación del navegador
      if (payload.notification) {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo.png',
          badge: '/badge.png',
        });
      }

      // Actualizar contador y lista
      fetchUnreadCount();
      fetchNotifications();
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchUnreadCount, fetchNotifications]);

  // ==================== CARGAR DATOS INICIALES ====================

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUnreadCount();
      fetchNotifications();

      // Polling cada 30 segundos para actualizar contador
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [fetchUnreadCount, fetchNotifications]);

  return {
    unreadCount,
    notifications,
    loading,
    permission,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
};
