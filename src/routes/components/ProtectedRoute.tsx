import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Usuario autenticado, renderizar el contenido
  return <>{children}</>;
}
