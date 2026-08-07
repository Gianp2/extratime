// Service Worker para notificaciones push y recordatorios de ExtraTime
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Al hacer clic en la notificación, enfocar la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Manejo de eventos Push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ExtraTime ⏱️ Recordatorio de Horas Extras';
  const options = {
    body: data.body || '¡No olvides registrar tus horas extras de hoy!',
    icon: 'https://img.icons8.com/isometric/512/clock.png',
    badge: 'https://img.icons8.com/isometric/512/clock.png',
    vibrate: [200, 100, 200],
    tag: 'extratime-daily-reminder',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
