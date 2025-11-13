import { CONFIG } from 'src/config-global';

import { AdminDashboard } from 'src/sections/dashboard/admin-dashboard';
import { ClientDashboard } from 'src/sections/dashboard/client-dashboard';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

export default function Page() {
  const { hasRole, user, isAuthenticated } = useAuth();

  // Función auxiliar para verificar si es admin
  const isAdminUser = () => {
    if (!user?.role_name) return false;
    const role = user.role_name.toLowerCase();
    return role.includes('admin') || role.includes('administrador') || hasRole('admin') || hasRole('administrator');
  };

  // Check for dashboard type override in URL params (for development/testing)
  const urlParams = new URLSearchParams(window.location.search);
  const forceDashboard = urlParams.get('dashboard'); // 'admin' or 'client'

  // Debug logs
  console.log('Dashboard Debug:', {
    isAuthenticated: isAuthenticated(),
    user,
    userRole: user?.role_name,
    hasAdminRole: hasRole('admin'),
    hasAdministratorRole: hasRole('administrator'),
    hasAdministradorRole: hasRole('Administrador'),
    hasAdminCapitalRole: hasRole('Admin'),
    isAdminUser: isAdminUser(),
    forceDashboard
  });

  // Force dashboard type for development/testing
  if (forceDashboard === 'admin') {
    console.log('FORCED: Showing Admin Dashboard');
    return (
      <>
        <title>{`Admin Dashboard - ${CONFIG.appName}`}</title>
        <meta name="description" content="Panel de administración con métricas y gestión del negocio" />
        <meta name="keywords" content="admin,dashboard,analytics,management,reports" />

        <AdminDashboard />
      </>
    );
  }

  if (forceDashboard === 'client') {
    console.log('FORCED: Showing Client Dashboard');
    return (
      <>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
        <meta name="description" content="Tu panel personal con pedidos, ofertas y recomendaciones" />
        <meta name="keywords" content="dashboard,pedidos,ofertas,recomendaciones" />

        <ClientDashboard />
      </>
    );
  }

  // Si no está autenticado, mostrar dashboard de cliente por defecto para desarrollo
  if (!isAuthenticated()) {
    console.log('User not authenticated, showing Client Dashboard for development');
    return (
      <>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
        <meta name="description" content="Tu panel personal con pedidos, ofertas y recomendaciones" />
        <meta name="keywords" content="dashboard,pedidos,ofertas,recomendaciones" />

        <ClientDashboard />
      </>
    );
  }

  // Redirigir según el rol del usuario
  if (isAdminUser()) {
    console.log('Showing Admin Dashboard');
    return (
      <>
        <title>{`Admin Dashboard - ${CONFIG.appName}`}</title>
        <meta name="description" content="Panel de administración con métricas y gestión del negocio" />
        <meta name="keywords" content="admin,dashboard,analytics,management,reports" />

        <AdminDashboard />
      </>
    );
  }

  // Dashboard por defecto para clientes/usuarios
  console.log('Showing Client Dashboard');
  return (
    <>
      <title>{`Dashboard - ${CONFIG.appName}`}</title>
      <meta name="description" content="Tu panel personal con pedidos, ofertas y recomendaciones" />
      <meta name="keywords" content="dashboard,pedidos,ofertas,recomendaciones" />

      <ClientDashboard />
    </>
  );
}
