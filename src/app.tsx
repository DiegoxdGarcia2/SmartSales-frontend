import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { ThemeProvider } from 'src/theme/theme-provider';
import pushNotificationService from 'src/services/pushNotificationService';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();
  usePushNotifications();

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function usePushNotifications() {
  useEffect(() => {
    // Inicializar notificaciones push si el usuario está autenticado
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return undefined;
    }

    // Esperar 2 segundos para que la app termine de cargar
    const timer = setTimeout(() => {
      pushNotificationService.initialize().catch((error) => {
        console.error('Error inicializando push notifications:', error);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
