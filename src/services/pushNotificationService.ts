// ========================================
// PUSH NOTIFICATION SERVICE
// ========================================

import { getToken, onMessage } from 'firebase/messaging';

import api from 'src/utils/api';

import { messaging, VAPID_KEY } from 'src/config/firebaseConfig';

class PushNotificationService {
  private isInitialized = false;
  private currentToken: string | null = null;

  /**
   * Inicializa el servicio de notificaciones push
   * 1. Solicita permisos al usuario
   * 2. Obtiene token FCM de Firebase
   * 3. Registra el token en el backend
   * 4. Configura listener para mensajes en foreground
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('📱 Push notifications ya inicializadas');
      return true;
    }

    try {
      console.log('🚀 Inicializando push notifications...');

      // 1. Verificar si el navegador soporta notificaciones
      if (!('Notification' in window)) {
        console.error('❌ Este navegador no soporta notificaciones');
        return false;
      }

      // 2. Verificar si Firebase Messaging está disponible
      if (!messaging) {
        console.error('❌ Firebase Messaging no está inicializado');
        return false;
      }

      // 3. Verificar si ya tenemos permiso
      let permission = Notification.permission;

      if (permission === 'default') {
        // Solicitar permiso al usuario
        console.log('📱 Solicitando permiso para notificaciones...');
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.warn('⚠️ Permiso de notificaciones denegado');
        return false;
      }

      console.log('✅ Permiso de notificaciones concedido');

      // 4. Obtener token FCM
      console.log('🔑 Obteniendo token FCM...');
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (!token) {
        console.error('❌ No se pudo obtener el token FCM');
        return false;
      }

      this.currentToken = token;
      console.log('✅ Token FCM obtenido:', token.substring(0, 30) + '...');

      // 5. Registrar token en el backend
      await this.registerTokenInBackend(token);

      // 6. Configurar listener para mensajes en foreground
      this.setupForegroundListener();

      this.isInitialized = true;
      console.log('✅ Push notifications inicializadas exitosamente');
      return true;
    } catch (error: any) {
      console.warn('⚠️ Push notifications no disponibles:', error.message);
      // No es crítico, la app puede funcionar sin push notifications
      return false;
    }
  }

  /**
   * Registra el token FCM en el backend
   */
  private async registerTokenInBackend(token: string): Promise<void> {
    try {
      console.log('📤 Registrando token en backend...');

      const deviceName = this.getDeviceName();
      const deviceType = 'WEB';

      await api.post('/notifications/fcm-tokens/', {
        token,
        device_type: deviceType,
        device_name: deviceName,
      });

      console.log('✅ Token registrado en backend');
    } catch (error: any) {
      // Si el token ya existe (409), no es un error crítico
      if (error?.response?.status === 409) {
        console.log('ℹ️ Token ya registrado en backend');
        return;
      }

      console.error('❌ Error registrando token en backend:', error);
      throw error;
    }
  }

  /**
   * Configura el listener para mensajes recibidos cuando la app está abierta (foreground)
   */
  private setupForegroundListener(): void {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('📩 Mensaje recibido en foreground:', payload);

      // Mostrar notificación nativa del navegador
      if (payload.notification) {
        const title = payload.notification.title || 'SmartSales';
        const options = {
          body: payload.notification.body || '',
          icon: payload.notification.icon || '/logo.png',
          badge: '/badge-icon.png',
          tag: payload.data?.notification_id || 'smartsales-notification',
          data: payload.data,
          requireInteraction: false,
        };

        // Crear notificación nativa
        if (Notification.permission === 'granted') {
          const notification = new Notification(title, options);

          // Manejar click en la notificación
          notification.onclick = (event) => {
            event.preventDefault();
            const actionUrl = payload.data?.action_url || '/notifications';
            window.open(actionUrl, '_blank');
            notification.close();
          };
        }
      }
    });

    console.log('✅ Listener de mensajes foreground configurado');
  }

  /**
   * Obtiene el nombre del dispositivo/navegador
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome Desktop';
    }
    if (userAgent.includes('Firefox')) {
      return 'Firefox Desktop';
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari Desktop';
    }
    if (userAgent.includes('Edg')) {
      return 'Edge Desktop';
    }
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera Desktop';
    }

    return 'Navegador Web';
  }

  /**
   * Desinscribe las notificaciones push
   * Elimina el token del backend
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.currentToken) {
        console.warn('⚠️ No hay token para desinscribir');
        return false;
      }

      console.log('📤 Eliminando token del backend...');

      await api.delete(`/notifications/fcm-tokens/${this.currentToken}/`);

      this.currentToken = null;
      this.isInitialized = false;

      console.log('✅ Token eliminado del backend');
      return true;
    } catch (error: any) {
      console.error('❌ Error al desinscribir:', error);
      return false;
    }
  }

  /**
   * Obtiene el token FCM actual
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Verifica si las notificaciones están inicializadas
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Exportar instancia singleton
export default new PushNotificationService();
