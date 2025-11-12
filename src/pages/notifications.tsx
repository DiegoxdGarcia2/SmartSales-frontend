import { useEffect } from 'react';

import { CONFIG } from 'src/config-global';

import { NotificationsView } from 'src/sections/notifications/view/notifications-view';

// ========================================
// NOTIFICATIONS PAGE
// ========================================

export default function NotificationsPage() {
  useEffect(() => {
    document.title = `Notificaciones - ${CONFIG.appName}`;
  }, []);

  return <NotificationsView />;
}
