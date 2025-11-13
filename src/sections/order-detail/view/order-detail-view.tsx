import type { Order } from 'src/types/order';

import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router';

import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Table,
  Button,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardHeader,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import api from 'src/utils/api';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function OrderDetailView() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError('ID de pedido no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Obteniendo detalles del pedido:', orderId);
        
        const response = await api.get<Order>(`/orders/${orderId}/`);
        console.log('✅ Detalles del pedido obtenidos:', response.data);
        console.log('📦 Items del pedido:', JSON.stringify(response.data.items, null, 2));
        setOrder(response.data);
      } catch (err: any) {
        console.error('❌ Error al obtener detalles del pedido:', err);
        setError(err.response?.data?.detail || 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleViewReceipt = async () => {
    if (!orderId) return;
    
    setLoadingReceipt(true);
    try {
      console.log(`🖨️ Solicitando comprobante HTML desde: /receipt/${orderId}/`);
      const response = await api.get(`/receipt/${orderId}/`, {
        responseType: 'text', // Pedir la respuesta como texto plano (HTML)
      });

      const htmlContent = response.data;

      // Abrir una nueva pestaña
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        // Escribir el HTML en la nueva pestaña
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        console.log('✅ Comprobante abierto en nueva pestaña');
      } else {
        console.error('❌ No se pudo abrir una nueva pestaña. Verifica bloqueadores de pop-ups.');
        alert('No se pudo abrir el comprobante. Por favor, verifica que no haya bloqueadores de pop-ups.');
      }
    } catch (err: any) {
      console.error('❌ Error al obtener el comprobante:', err.response?.data || err.message);
      alert('Error al cargar el comprobante. Por favor, intenta nuevamente.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!orderId) return;
    
    setLoadingReceipt(true);
    try {
      console.log(`📄 Descargando comprobante PDF desde: /receipt/${orderId}/pdf/`);
      const response = await api.get(`/receipt/${orderId}/pdf/`, {
        responseType: 'blob', // ¡IMPORTANTE! Para recibir archivos binarios
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_pedido_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Comprobante PDF descargado exitosamente');
      alert('✅ Comprobante descargado exitosamente');
    } catch (err: any) {
      console.error('❌ Error al descargar PDF:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || 'Error al descargar el comprobante PDF';
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoadingReceipt(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pagado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderStatusColor = (status: string) => {
    if (status?.includes('PAGADO')) return 'success';
    if (status?.includes('PENDIENTE')) return 'warning';
    if (status?.includes('CANCELADO')) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 3 }}>
          <Button
            component={RouterLink}
            to="/my-orders"
            variant="outlined"
            sx={{ mb: 3 }}
          >
            ← Volver a Mis Pedidos
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Box sx={{ mt: 3 }}>
          <Button
            component={RouterLink}
            to="/my-orders"
            variant="outlined"
            sx={{ mb: 3 }}
          >
            ← Volver a Mis Pedidos
          </Button>
          <Alert severity="warning">No se encontró el pedido</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 3 }}>
        <Button
          component={RouterLink}
          to="/my-orders"
          variant="outlined"
          sx={{ mb: 3 }}
        >
          ← Volver a Mis Pedidos
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4">
            Detalle del Pedido #{orderId}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleViewReceipt}
              disabled={loadingReceipt}
            >
              {loadingReceipt ? 'Cargando...' : '🖨️ Ver Comprobante'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadPDF}
              disabled={loadingReceipt}
            >
              {loadingReceipt ? 'Descargando...' : '📄 Descargar PDF'}
            </Button>
          </Box>
        </Box>

        {/* Información General del Pedido */}
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Información del Pedido" />
          <CardContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Fecha de Compra
                </Typography>
                <Typography variant="body1">{fDate(order.created_at)}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estado del Pedido
                </Typography>
                <Chip
                  label={order.status}
                  color={getOrderStatusColor(order.status)}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estado de Pago
                </Typography>
                <Chip
                  label={order.payment_status || 'N/A'}
                  color={getPaymentStatusColor(order.payment_status || '')}
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h5" color="primary">
                  {order.total_price} Bs.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Productos Comprados */}
        <Card>
          <CardHeader title="Productos" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => {
                    // Verificar si hay descuento aplicado
                    const hasDiscount = item.discount_percentage && Number(item.discount_percentage) > 0;
                    
                    return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product?.id ? (
                          <Button
                            component={RouterLink}
                            to={`/product/${item.product.id}`}
                            variant="text"
                            sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                          >
                            {item.product?.name || item.product_name || 'N/A'}
                          </Button>
                        ) : (
                          <Typography variant="body2">
                            {item.product?.name || item.product_name || 'N/A'}
                          </Typography>
                        )}
                        
                        {/* Mostrar descuento si aplica */}
                        {hasDiscount && (
                          <Box sx={{ 
                            bgcolor: 'success.lighter', 
                            p: 1, 
                            borderRadius: 1, 
                            border: '2px solid',
                            borderColor: 'success.main',
                            mt: 1
                          }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Box
                                sx={{
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                🏷️ -{item.discount_percentage}% OFF
                              </Box>
                            </Stack>
                            
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Antes:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ 
                                  textDecoration: 'line-through', 
                                  color: 'text.disabled',
                                  fontWeight: 600
                                }}
                              >
                                {item.base_price} Bs.
                              </Typography>
                            </Stack>
                            
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Ahora:
                              </Typography>
                              <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
                                {item.item_price} Bs.
                              </Typography>
                            </Stack>
                            
                            <Box sx={{ 
                              bgcolor: 'success.main', 
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.5,
                              display: 'inline-block'
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                💰 Ahorras: {item.discount_amount} Bs.
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {hasDiscount ? (
                          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                            {item.item_price} Bs.
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            {item.price} Bs.
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">
                          {(item.quantity * parseFloat(hasDiscount ? item.item_price || item.price : item.price)).toFixed(2)} Bs.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="h6">Total:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        {order.total_price} Bs.
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
