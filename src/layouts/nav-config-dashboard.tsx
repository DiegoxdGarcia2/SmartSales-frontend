import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

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
    icon: icon('ic-analytics'),
  },
  {
    title: 'Usuarios',
    path: '/user',
    icon: icon('ic-user'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Productos',
    path: '/products',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Mis Pedidos',
    path: '/my-orders',
    icon: icon('ic-blog'), // Usar un ícono apropiado si tienes uno para pedidos
  },
  {
    title: 'Gestión Productos',
    path: '/admin/products',
    icon: icon('ic-cart'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Dashboard de Ventas',
    path: '/sales-dashboard',
    icon: icon('ic-analytics'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Reportes Dinámicos',
    path: '/admin/reports',
    icon: icon('ic-analytics'),
    roles: ['ADMINISTRADOR'], // Solo administradores
  },
  {
    title: 'Blog',
    path: '/blog',
    icon: icon('ic-blog'),
  },
];
