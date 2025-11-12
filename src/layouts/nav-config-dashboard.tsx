import Box from '@mui/material/Box';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name: any, color: string = '#667eea') => (
  <Box
    sx={{
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 1,
      bgcolor: `${color}15`,
      color,
    }}
  >
    <Iconify icon={name as any} width={20} />
  </Box>
);

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[]; // Roles permitidos para ver este item
};

export const navData: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('solar:chart-bold', '#667eea'),
  },
  {
    title: 'Usuarios',
    path: '/user',
    icon: icon('solar:users-group-rounded-bold', '#764ba2'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Productos',
    path: '/products',
    icon: icon('solar:bag-4-bold', '#f093fb'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Mis Pedidos',
    path: '/my-orders',
    icon: icon('solar:clipboard-list-bold', '#4facfe'),
  },
  {
    title: 'Ofertas',
    path: '/offers',
    icon: icon('solar:gift-bold', '#f093fb'),
  },
  {
    title: 'Gestión Productos',
    path: '/admin/products',
    icon: icon('solar:settings-bold', '#43e97b'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Gestión Ofertas',
    path: '/admin/offers',
    icon: icon('solar:tag-horizontal-bold', '#ff6b6b'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Dashboard de Ventas',
    path: '/sales-dashboard',
    icon: icon('solar:chart-2-bold', '#fa709a'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Reportes Dinámicos',
    path: '/admin/reports',
    icon: icon('solar:document-text-bold', '#fee140'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Machine Learning',
    path: '/ml-dashboard',
    icon: icon('solar:cpu-bolt-bold', '#a8edea'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
];
