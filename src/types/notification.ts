// ========================================
// TIPOS DE NOTIFICACIONES
// ========================================

export type NotificationType =
  | 'order_created'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'new_offer'
  | 'offer_expiring'
  | 'price_drop'
  | 'back_in_stock'
  | 'review_request'
  | 'account_update';

export type DeviceType = 'web' | 'android' | 'ios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  data: Record<string, any> | null;
  action_url: string | null;
}

export interface NotificationPreferences {
  id?: number;
  email_enabled: boolean;
  push_enabled: boolean;
  order_updates: boolean;
  promotions: boolean;
  product_recommendations: boolean;
  price_alerts: boolean;
}

export interface FCMToken {
  token: string;
  device_type: DeviceType;
  device_name?: string;
}

export interface UnreadCount {
  unread_count: number;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

// Mapa de íconos para cada tipo de notificación
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  order_created: 'solar:cart-check-bold',
  order_shipped: 'solar:box-bold',
  order_delivered: 'solar:home-smile-bold',
  order_cancelled: 'solar:close-circle-bold',
  payment_received: 'solar:card-bold',
  payment_failed: 'solar:danger-circle-bold',
  new_offer: 'solar:gift-bold',
  offer_expiring: 'solar:clock-circle-bold',
  price_drop: 'solar:tag-price-bold',
  back_in_stock: 'solar:box-minimalistic-bold',
  review_request: 'solar:star-bold',
  account_update: 'solar:user-bold',
};

// Colores para cada tipo de notificación
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  order_created: 'success',
  order_shipped: 'info',
  order_delivered: 'success',
  order_cancelled: 'error',
  payment_received: 'success',
  payment_failed: 'error',
  new_offer: 'warning',
  offer_expiring: 'warning',
  price_drop: 'success',
  back_in_stock: 'info',
  review_request: 'primary',
  account_update: 'default',
};
