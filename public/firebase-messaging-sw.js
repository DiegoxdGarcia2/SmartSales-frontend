// ========================================
// FIREBASE MESSAGING SERVICE WORKER
// ========================================
// Este archivo maneja las notificaciones push cuando la app está en background

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Inicializar Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyD_your_firebase_api_key",
  authDomain: "smartsales-backend-21.firebaseapp.com",
  projectId: "smartsales-backend-21",
  storageBucket: "smartsales-backend-21.appspot.com",
  messagingSenderId: "891739940726",
  appId: "1:891739940726:web:your_app_id"
});

const messaging = firebase.messaging();

// Manejar mensajes recibidos en background
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Mensaje recibido en background:', payload);

  const notificationTitle = payload.notification?.title || 'SmartSales';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.notification_id || 'default',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event.notification);

  event.notification.close();

  if (event.action === 'view') {
    // Abrir la app y navegar a la página relevante
    const urlToOpen = new URL('/', self.location.origin).href;

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Si ya hay una ventana abierta, enfocarla
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
