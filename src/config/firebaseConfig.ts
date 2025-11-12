// ========================================
// FIREBASE CONFIGURATION
// ========================================

import { initializeApp } from 'firebase/app';
import { getToken, onMessage, getMessaging, type Messaging } from 'firebase/messaging';

// Credenciales de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDhU6mgIq83K2wpKt5kFcMpg7vnmKkegts",
  authDomain: "smartsales-notifications.firebaseapp.com",
  projectId: "smartsales-notifications",
  storageBucket: "smartsales-notifications.firebasestorage.app",
  messagingSenderId: "831944193823",
  appId: "1:831944193823:web:f389e61bbc052d7e6aa22a"
};

// VAPID Key de Firebase Cloud Messaging
export const VAPID_KEY = "BAy2aACkD_nBjgeWUFvPXxjwBBhVPEXhUVZD7Ldsu9IwlY7sSvgVJ5DPLop82OTWAoG0Qb4Wyr6aaJ8kJiAlEJw";

// Inicializar Firebase
let app: any;
let messaging: Messaging | null = null;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log('✅ Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
}

export { messaging };

// ========================================
// FUNCIONES DE UTILIDAD
// ========================================

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  try {
    const permission = await Notification.requestPermission();
    console.log('📱 Permiso de notificaciones:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Error al solicitar permisos:', error);
    return 'denied';
  }
}

export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.error('❌ Firebase Messaging no está inicializado');
    return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('🔑 Token FCM obtenido:', token?.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ Error al obtener token FCM:', error);
    return null;
  }
}

export function onMessageListener(callback: (payload: any) => void) {
  if (!messaging) {
    console.error('❌ Firebase Messaging no está inicializado');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('📩 Mensaje recibido en foreground:', payload);
    callback(payload);
  });
}
