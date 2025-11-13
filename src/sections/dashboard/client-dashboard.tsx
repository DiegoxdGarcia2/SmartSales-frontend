import type { ClientOrder, ClientOffer, ClientRecommendation } from 'src/services/clientDashboard';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { clientDashboardService } from 'src/services/clientDashboard';

import { useAuth } from 'src/auth/AuthContext';

// ----------------------------------------------------------------------

export function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<ClientOrder[]>([]);
  const [offers, setOffers] = useState<ClientOffer[]>([]);
  const [recommendations, setRecommendations] = useState<ClientRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersData, offersData, recommendationsData] = await Promise.all([
          clientDashboardService.getRecentOrders(5),
          clientDashboardService.getAvailableOffers(),
          clientDashboardService.getRecommendations(6),
        ]);

        setRecentOrders(ordersData);
        setOffers(offersData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Los servicios ya incluyen datos mock en caso de error
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
      case 'completado':
        return 'success';
      case 'en proceso':
      case 'procesando':
        return 'info';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1h';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
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
        ¡Bienvenido a SmartSales! 👋
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bienvenido a tu panel personal. Aquí puedes ver tus pedidos, ofertas disponibles y recomendaciones.
      </Typography>

      <Grid container spacing={3}>
        {/* Pedidos Recientes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon icon="mdi:package-variant" width={24} height={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Mis Pedidos Recientes
                </Typography>
              </Box>

              <List>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <Box key={order.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Icon icon="mdi:package" width={20} height={20} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="subtitle2">
                                {order.order_number}
                              </Typography>
                              <Chip
                                label={order.status}
                                size="small"
                                color={getStatusColor(order.status)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {order.items_count} productos • {formatDate(order.created_at)}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(order.total)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentOrders.length - 1 && <Divider />}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Icon icon="mdi:package-variant-closed" width={48} height={48} color="grey.400" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No tienes pedidos recientes
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/my-orders')}
                sx={{ ml: 'auto' }}
              >
                Ver todos los pedidos
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Ofertas Disponibles */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon icon="mdi:tag-outline" width={24} height={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Ofertas Especiales
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {offers.length > 0 ? (
                  offers.map((offer) => (
                    <Box
                      key={offer.id}
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate('/offers')}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {offer.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {offer.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`${offer.discount_percentage}%`}
                          color="error"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Hasta {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Icon icon="mdi:tag-outline" width={48} height={48} color="grey.400" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No hay ofertas disponibles en este momento
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/offers')}
                sx={{ ml: 'auto' }}
              >
                Ver todas las ofertas
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recomendaciones */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Icon icon="mdi:star-outline" width={24} height={24} />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Recomendado para ti
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {recommendations.length > 0 ? (
                  recommendations.map((product) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3 },
                        }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <Box
                          sx={{
                            height: 140,
                            bgcolor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon icon="mdi:image" width={48} height={48} color="grey.400" />
                        </Box>
                        <CardContent sx={{ pb: 1 }}>
                          <Typography variant="subtitle2" noWrap>
                            {product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="h6" color="primary">
                              {formatCurrency(product.price)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Icon icon="mdi:star" width={16} height={16} color="#ffb400" />
                              <Typography variant="body2" sx={{ ml: 0.5 }}>
                                {product.rating}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Icon icon="mdi:star-outline" width={48} height={48} color="grey.400" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        No hay recomendaciones disponibles en este momento
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => navigate('/products')}
                sx={{ ml: 'auto' }}
              >
                Ver más productos
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}