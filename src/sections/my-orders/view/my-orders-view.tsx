import type { Order } from 'src/types/order';

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { format, isAfter, addMonths } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';
import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { ReviewFormModal } from 'src/sections/reviews/review-form-modal';

// ----------------------------------------------------------------------

export function MyOrdersView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    productId: number;
    productName: string;
  }>({
    open: false,
    productId: 0,
    productName: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📦 Cargando pedidos desde /orders/');
        const response = await api.get<Order[]>('/orders/');
        console.log('✅ Pedidos cargados:', response.data);
        
        // DEBUG: Inspeccionar estructura de las órdenes
        if (response.data.length > 0) {
          console.log('🔍 Estructura de la primera orden:', response.data[0]);
          console.log('🔍 Status:', response.data[0].status);
          console.log('🔍 Payment Status:', response.data[0].payment_status);
          console.log('🔍 Todos los campos:', Object.keys(response.data[0]));
          
          // DEBUG: Verificar estructura de garantía
          if (response.data[0].items && response.data[0].items.length > 0) {
            const firstItem = response.data[0].items[0];
            console.log('🔍 Primer item del pedido:', firstItem);
            console.log('🔍 Producto completo:', firstItem.product);
            console.log('🔍 Tipo de brand:', typeof firstItem.product?.brand);
            console.log('🔍 Brand completo:', JSON.stringify(firstItem.product?.brand, null, 2));
          }
        }
        
        setOrders(response.data);
      } catch (err: any) {
        console.error('❌ Error al cargar pedidos:', err);
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Error al cargar los pedidos. Por favor, intenta nuevamente.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getPaymentStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'paid':
      case 'pagado':
        return 'success';
      case 'pending':
      case 'pendiente':
        return 'warning';
      case 'failed':
      case 'fallido':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' => {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completado':
        return 'success';
      case 'processing':
      case 'procesando':
        return 'info';
      case 'pending':
      case 'pendiente':
        return 'warning';
      case 'cancelled':
      case 'cancelado':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleOpenReviewModal = (productId: number, productName: string) => {
    setReviewModal({
      open: true,
      productId,
      productName,
    });
  };

  const handleCloseReviewModal = () => {
    setReviewModal({
      open: false,
      productId: 0,
      productName: '',
    });
  };

  const handleReviewSubmitted = () => {
    // Aquí podrías refrescar los pedidos o mostrar un mensaje de éxito
    console.log('✅ Reseña enviada exitosamente');
  };

  const canLeaveReview = (orderStatus: string, paymentStatus: string): boolean => {
    // DEBUG: Ver qué valores estamos recibiendo
    console.log('🔍 canLeaveReview - orderStatus:', orderStatus, 'paymentStatus:', paymentStatus);
    
    // Solo permitir reseñas en órdenes pagadas
    // El backend envía el estado en 'orderStatus' con valor 'PAGADO' (mayúsculas)
    const paidStatuses = ['PAGADO', 'paid', 'pagado', 'Pagado'];
    const result = paidStatuses.includes(orderStatus || '');
    
    console.log('🔍 canLeaveReview - resultado:', result);
    return result;
  };

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
        <Typography variant="h4" flexGrow={1}>
          Mis Pedidos
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && orders.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No tienes pedidos aún.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Cuando realices una compra, tus pedidos aparecerán aquí.
          </Typography>
        </Card>
      )}

      {!loading && !error && orders.length > 0 && (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID Pedido</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Estado Pago</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <>
                    <TableRow 
                      key={order.id} 
                      hover
                      onClick={() => navigate(`/order/${order.id}`)}
                      sx={{ cursor: 'pointer', '& > *': { borderBottom: 'unset' } }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedOrder(expandedOrder === order.id ? null : order.id);
                          }}
                        >
                          <Iconify
                            icon={
                              expandedOrder === order.id
                                ? 'solar:eye-closed-bold'
                                : 'solar:eye-bold'
                            }
                          />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">#{order.id}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{fDate(order.created_at)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.items?.length || 0} producto(s)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">{order.total_price} Bs.</Typography>
                      </TableCell>
                      <TableCell>
                        <Label color={getOrderStatusColor(order.status)}>
                          {order.status || 'N/A'}
                        </Label>
                      </TableCell>
                      <TableCell>
                        <Label color={getPaymentStatusColor(order.payment_status)}>
                          {order.payment_status || 'N/A'}
                        </Label>
                      </TableCell>
                    </TableRow>

                    {/* Fila expandible con items del pedido */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={expandedOrder === order.id} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              Productos del Pedido #{order.id}
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Producto</TableCell>
                                  <TableCell align="right">Cantidad</TableCell>
                                  <TableCell align="right">Precio</TableCell>
                                  <TableCell align="right">Subtotal</TableCell>
                                  <TableCell align="center">Garantía</TableCell>
                                  <TableCell align="center">Acción</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.items?.map((item) => {
                                  const isDisabled = !canLeaveReview(order.status, order.payment_status);
                                  console.log(`🔍 Botón para item ${item.id} - disabled: ${isDisabled}`);
                                  
                                  // Lógica de cálculo de garantía
                                  let warrantyStatus = 'N/A';
                                  let warrantyColor: 'success' | 'error' | 'default' = 'default';
                                  
                                  // Type guard: Verificar que brand sea un objeto y no un número
                                  const brand = typeof item.product?.brand === 'object' ? item.product.brand : null;
                                  const duration = brand?.warranty_duration_months;
                                  
                                  // DEBUG: Verificar datos de garantía
                                  console.log('🔍 Duración obtenida:', duration);
                                  console.log('🔍 Fecha de compra (string):', order.created_at);
                                  console.log('🔍 Brand:', brand);
                                  
                                  if (duration && duration > 0) {
                                    const purchaseDate = new Date(order.created_at);
                                    const expiryDate = addMonths(purchaseDate, duration);
                                    const isExpired = isAfter(new Date(), expiryDate);
                                    
                                    if (isExpired) {
                                      warrantyStatus = `Expirada (${format(expiryDate, 'dd/MM/yyyy')})`;
                                      warrantyColor = 'error';
                                    } else {
                                      warrantyStatus = `Activa hasta ${format(expiryDate, 'dd/MM/yyyy')}`;
                                      warrantyColor = 'success';
                                    }
                                  } else if (brand?.warranty_info) {
                                    warrantyStatus = brand.warranty_info;
                                  }
                                  
                                  // DEBUG: Verificar resultado final
                                  console.log('🔍 Warranty Status final:', warrantyStatus);
                                  console.log('🔍 Warranty Color final:', warrantyColor);
                                  
                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        {item.product?.name || item.product_name || 'Producto no disponible'}
                                      </TableCell>
                                      <TableCell align="right">{item.quantity}</TableCell>
                                      <TableCell align="right">{item.price} Bs.</TableCell>
                                      <TableCell align="right">
                                        {(parseFloat(item.price) * item.quantity).toFixed(2)} Bs.
                                      </TableCell>
                                      <TableCell align="center">
                                        <Label color={warrantyColor} variant="soft">
                                          {warrantyStatus}
                                        </Label>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          disabled={isDisabled}
                                          onClick={() =>
                                            handleOpenReviewModal(
                                              typeof item.product === 'number' ? item.product : item.product.id,
                                              item.product_name || `Producto ${typeof item.product === 'number' ? item.product : item.product.id}`
                                            )
                                          }
                                          startIcon={<Iconify icon="solar:share-bold" />}
                                        >
                                          Dejar Reseña
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal para dejar reseña */}
      <ReviewFormModal
        open={reviewModal.open}
        onClose={handleCloseReviewModal}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
        onReviewSubmit={handleReviewSubmitted}
      />
    </DashboardContent>
  );
}
