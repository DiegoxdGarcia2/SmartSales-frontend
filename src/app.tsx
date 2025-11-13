import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { useNotifications } from 'src/hooks/useNotifications';

import { ThemeProvider } from 'src/theme/theme-provider';

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
  const { initialize } = useNotifications();

  useEffect(() => {
    // Inicializar notificaciones push si el usuario está autenticado
    const token = localStorage.getItem('access_token');

    if (!token) {
      return undefined;
    }

    // Esperar 2 segundos para que la app termine de cargar
    const timer = setTimeout(async () => {
      try {
        // Obtener user ID del localStorage o contexto de auth
        const userData = localStorage.getItem('user');
        const userId = userData ? JSON.parse(userData).id?.toString() : undefined;

        if (userId) {
          await initialize(userId);
          console.log('✅ Servicio de notificaciones inicializado');
        }
      } catch (error) {
        console.error('Error inicializando notificaciones:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [initialize]);

  return null;
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
