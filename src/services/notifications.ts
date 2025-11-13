import api from '../utils/api';
import { getToken, messaging, onMessage, VAPID_KEY } from './firebase';

class NotificationService {
  token: string | null = null;
  isSupported: boolean;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Solicitar permiso para notificaciones
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return true;
      } else {
        console.log('Notification permission denied.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Obtener token de FCM
  async getFCMToken() {
    try {
      if (!this.isSupported) {
        throw new Error('Push messaging is not supported');
      }

      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        console.log('Registration token available');
        this.token = currentToken;
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
      return null;
    }
  }

  // Registrar token en el backend
  async registerToken(userId: string): Promise<boolean> {
    try {
      const token = await this.getFCMToken();
      if (!token) return false;

      const response = await api.post('/notifications/register-token/', {
        token,
        platform: 'web',
        user_id: userId
      });

      console.log('Token registered successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Error registering token:', error);
      return false;
    }
  }

  // Escuchar notificaciones en primer plano
  listenForMessages() {
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);

      // Mostrar notificación nativa del navegador
      if (Notification.permission === 'granted' && payload.notification) {
        const notification = new Notification(payload.notification.title || 'Notificación', {
          body: payload.notification.body || '',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: payload.data,
          requireInteraction: true
        });

        notification.onclick = () => {
          // Manejar click en notificación
          window.focus();
          notification.close();
        };
      }

      // Emitir evento para que otros componentes reaccionen
      window.dispatchEvent(new CustomEvent('notification-received', {
        detail: payload
      }));
    });
  }

  // Obtener notificaciones del usuario
  async getNotifications(page: number = 1, limit: number = 20) {
    try {
      const response = await api.get(`/notifications/notifications/?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string) {
    try {
      const response = await api.patch(`/notifications/notifications/${notificationId}/`, {
        is_read: true
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string) {
    try {
      const response = await api.delete(`/notifications/notifications/${notificationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Obtener preferencias de notificación
  async getPreferences() {
    try {
      const response = await api.get('/notifications/preferences/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  // Actualizar preferencias de notificación
  async updatePreferences(preferences: any) {
    try {
      const response = await api.patch('/notifications/preferences/', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Suscribirse a notificaciones de producto específico
  async subscribeToProduct(productId: string) {
    try {
      const response = await api.post('/notifications/subscribe/', {
        content_type: 'product',
        object_id: productId,
        notification_type: 'stock_availability'
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to product:', error);
      throw error;
    }
  }

  // Cancelar suscripción a notificaciones de producto
  async unsubscribeFromProduct(productId: string) {
    try {
      const response = await api.post('/notifications/unsubscribe/', {
        content_type: 'product',
        object_id: productId,
        notification_type: 'stock_availability'
      });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from product:', error);
      throw error;
    }
  }

  // Inicializar el servicio completo
  async initialize(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }

    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered successfully');

      // Solicitar permisos
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) return false;

      // Registrar token
      const tokenRegistered = await this.registerToken(userId);
      if (!tokenRegistered) return false;

      // Escuchar mensajes
      this.listenForMessages();

      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }
}

export default new NotificationService();