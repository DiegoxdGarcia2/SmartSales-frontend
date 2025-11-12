import { useEffect } from 'react';

import { CONFIG } from 'src/config-global';

import { NotificationSettingsView } from 'src/sections/notification-settings/view/notification-settings-view';

// ========================================
// NOTIFICATION SETTINGS PAGE
// ========================================

export default function NotificationSettingsPage() {
  useEffect(() => {
    document.title = `Configuración de Notificaciones - ${CONFIG.appName}`;
  }, []);

  return <NotificationSettingsView />;
}
