import api from '../utils/api';

import type {
  FCMToken,
  UnreadCount,
  Notification,
  PaginatedNotifications,
  NotificationPreferences,
} from '../types/notification';

// ========================================
// MOCK DATA (TEMPORAL - hasta que el backend esté listo)
// ========================================
const MOCK_ENABLED = false; // ✅ Backend está listo - usando API real

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: '¡Pedido Confirmado!',
    message: 'Tu pedido #1234 ha sido confirmado y está siendo preparado.',
    notification_type: 'order_created',
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    data: { order_id: 1234 },
    action_url: '/orders/1234',
  },
  {
    id: 2,
    title: '🎁 Nueva Oferta Disponible',
    message: '50% de descuento en productos seleccionados. ¡No te lo pierdas!',
    notification_type: 'new_offer',
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    data: { offer_id: 5 },
    action_url: '/offers/5',
  },
  {
    id: 3,
    title: 'Pedido en Camino',
    message: 'Tu pedido #1230 ha sido enviado y llegará en 2-3 días.',
    notification_type: 'order_shipped',
    is_read: true,
    read_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    data: { order_id: 1230 },
    action_url: '/orders/1230',
  },
];

const mockPreferences: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  order_updates: true,
  promotions: true,
  product_recommendations: false,
  price_alerts: true,
};

// ========================================
// NOTIFICATION SERVICE
// ========================================

class NotificationService {
  // ==================== TOKENS FCM ====================

  /**
   * Registrar token FCM en el backend
   */
  async registerFCMToken(tokenData: FCMToken): Promise<void> {
    await api.post('/notifications/fcm-tokens/', tokenData);
  }

  /**
   * Eliminar token FCM
   */
  async deleteFCMToken(tokenId: number): Promise<void> {
    await api.delete(`/notifications/fcm-tokens/${tokenId}/`);
  }

  // ==================== NOTIFICACIONES ====================

  /**
   * Obtener notificaciones del usuario (paginado)
   */
  async getNotifications(page = 1, pageSize = 20): Promise<PaginatedNotifications> {
    if (MOCK_ENABLED) {
      return {
        count: mockNotifications.length,
        next: null,
        previous: null,
        results: mockNotifications,
      };
    }
    const response = await api.get('/notifications/notifications/', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * Obtener detalle de una notificación
   */
  async getNotification(id: number): Promise<Notification> {
    const response = await api.get(`/notifications/notifications/${id}/`);
    return response.data;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(id: number): Promise<Notification> {
    if (MOCK_ENABLED) {
      const notification = mockNotifications.find((n) => n.id === id);
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        return notification;
      }
      throw new Error('Notificación no encontrada');
    }
    const response = await api.patch(`/notifications/notifications/${id}/`, {
      is_read: true,
    });
    return response.data;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<void> {
    if (MOCK_ENABLED) {
      mockNotifications.forEach((n) => {
        n.is_read = true;
        n.read_at = new Date().toISOString();
      });
      return;
    }
    await api.post('/notifications/notifications/mark-all-read/');
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    if (MOCK_ENABLED) {
      return mockNotifications.filter((n) => !n.is_read).length;
    }
    try {
      const response = await api.get<UnreadCount>('/notifications/notifications/unread_count/');
      return response.data.unread_count;
    } catch (error: any) {
      // Si es 401, el usuario no está autenticado - no es un error
      if (error?.response?.status === 401) {
        return 0;
      }
      // Otros errores sí se logean
      console.warn('Error al obtener unread_count:', error?.message);
      return 0;
    }
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/notifications/${id}/`);
  }

  // ==================== PREFERENCIAS ====================

  /**
   * Obtener preferencias de notificaciones del usuario
   */
  async getPreferences(): Promise<NotificationPreferences> {
    if (MOCK_ENABLED) {
      return mockPreferences;
    }
    const response = await api.get('/notifications/preferences/');
    return response.data;
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    if (MOCK_ENABLED) {
      Object.assign(mockPreferences, preferences);
      return mockPreferences;
    }
    const response = await api.put('/notifications/preferences/', preferences);
    return response.data;
  }
}

export default new NotificationService();
