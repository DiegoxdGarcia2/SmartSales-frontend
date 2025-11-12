// ========================================
// FIREBASE MESSAGING SERVICE WORKER
// ========================================
// Este archivo maneja las notificaciones push cuando la app está en background

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Inicializar Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDhU6mgIq83K2wpKt5kFcMpg7vnmKkegts",
  authDomain: "smartsales-notifications.firebaseapp.com",
  projectId: "smartsales-notifications",
  storageBucket: "smartsales-notifications.firebasestorage.app",
  messagingSenderId: "831944193823",
  appId: "1:831944193823:web:f389e61bbc052d7e6aa22a"
});

const messaging = firebase.messaging();

// Manejar mensajes recibidos en background
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Mensaje recibido en background:', payload);
  
  const notificationTitle = payload.notification?.title || 'SmartSales';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: payload.data?.notification_id || 'default',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event.notification);
  
  event.notification.close();
  
  // Obtener la URL de acción si existe
  const actionUrl = event.notification.data?.action_url || '/';
  
  // Abrir la app en la URL correspondiente
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla y navegar
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              url: actionUrl,
            });
            return;
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});
