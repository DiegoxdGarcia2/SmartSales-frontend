import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
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
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Si el usuario no es ADMINISTRADOR, redirigir al dashboard
  if (user.role_name !== 'ADMINISTRADOR') {
    return <Navigate to="/dashboard" replace />;
  }

  // Usuario autenticado y con rol de administrador, renderizar el contenido
  return <>{children}</>;
}
