import type { AdminStats, TopProduct, RecentActivity } from 'src/services/adminDashboard';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { adminDashboardService } from 'src/services/adminDashboard';

// ----------------------------------------------------------------------

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData, productsData] = await Promise.all([
          adminDashboardService.getAdminStats(),
          adminDashboardService.getRecentActivity(10),
          adminDashboardService.getTopProducts(10),
        ]);

        setStats(statsData);
        setRecentActivity(activityData);
        setTopProducts(productsData);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
        // Los servicios ya incluyen datos mock en caso de error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat('es-ES').format(num);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'mdi:package-variant-closed';
      case 'user':
        return 'mdi:account-plus';
      case 'product':
        return 'mdi:package-variant';
      case 'system':
        return 'mdi:cog';
      default:
        return 'mdi:information';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'success.main';
      case 'user':
        return 'info.main';
      case 'product':
        return 'warning.main';
      case 'system':
        return 'grey.500';
      default:
        return 'grey.500';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  if (loading || !stats) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        ¡Bienvenido a SmartSales! 👑
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bienvenido al centro de control. Aquí puedes gestionar tu negocio, ver métricas y tomar decisiones.
      </Typography>

      {/* Estadísticas Principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Icon icon="mdi:currency-eur" width={24} height={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(stats.total_sales)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ventas Totales
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icon icon="mdi:trending-up" width={16} height={16} color="green" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +{stats.monthly_growth}% este mes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Icon icon="mdi:shopping-outline" width={24} height={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {formatNumber(stats.total_orders)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pedidos
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${stats.pending_orders} pendientes`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <Icon icon="mdi:account-group" width={24} height={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {formatNumber(stats.total_users)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Usuarios
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {formatNumber(stats.active_users_today)} activos hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Icon icon="mdi:package-variant" width={24} height={24} />
                </Avatar>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {formatNumber(stats.total_products)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Productos
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${stats.low_stock_products} con stock bajo`}
                size="small"
                color="error"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Actividad Reciente */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon icon="mdi:clock-outline" width={24} height={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Actividad Reciente
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.map((activity) => (
                  <Box
                    key={activity.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: getActivityColor(activity.type), mr: 2 }}>
                      <Icon icon={getActivityIcon(activity.type)} width={20} height={20} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.message}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user || 'Sistema'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                      {activity.amount && (
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          {formatCurrency(activity.amount)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Productos Más Vendidos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon icon="mdi:trophy-outline" width={24} height={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Productos Más Vendidos
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {topProducts.map((product, index) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'grey.100', mr: 2, fontSize: '0.875rem' }}>
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.sales_count} ventas • {formatCurrency(product.revenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Icon
                          icon={product.growth_percentage >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'}
                          width={16}
                          height={16}
                          color={product.growth_percentage >= 0 ? 'green' : 'red'}
                        />
                        <Typography
                          variant="body2"
                          color={product.growth_percentage >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {product.growth_percentage >= 0 ? '+' : ''}{product.growth_percentage}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/sales-dashboard')}
                sx={{ ml: 'auto' }}
              >
                Ver reportes completos
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Acciones Rápidas
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Icon icon="mdi:account-group" />}
                    onClick={() => navigate('/user')}
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Gestionar Usuarios
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ver y editar usuarios
                    </Typography>
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Icon icon="mdi:package-variant" />}
                    onClick={() => navigate('/admin/products')}
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Gestionar Productos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Agregar y editar productos
                    </Typography>
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Icon icon="mdi:chart-line" />}
                    onClick={() => navigate('/admin/reports')}
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Ver Reportes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Analytics y estadísticas
                    </Typography>
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Icon icon="mdi:cog" />}
                    onClick={() => navigate('/settings/notifications')}
                    sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Configuración
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ajustes del sistema
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}