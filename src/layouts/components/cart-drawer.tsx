import type { CartItem } from 'src/types/cart';

import { useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

import { useCart } from 'src/contexts/CartContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, loading, updateCartItem, removeFromCart, clearCartLocally } = useCart();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error al eliminar item:', error);
    }
  };

  const handleCheckout = async () => {
    // Verifica si hay items en el carrito
    if (!cart || !cart.items || cart.items.length === 0) {
      console.error('Carrito vacío.');
      showSnackbar('El carrito está vacío', 'error');
      return;
    }

    console.log('1. Iniciando checkout...');
    console.log('📦 Estado del carrito:', { 
      items: cart?.items?.length || 0, 
      total: cart?.total_price,
      cartItemsDetalle: cart?.items 
    });
    setCheckoutLoading(true);

    try {
      // Verificar carrito en el backend antes de crear orden
      console.log('2a. Verificando carrito en el backend...');
      const cartCheck = await api.get('/cart/');
      console.log('📦 Carrito en backend:', cartCheck.data);
      
      // Paso 1: Crear la orden en el backend
      console.log('2. Llamando a create_order_from_cart...');
      const orderResponse = await api.post('/orders/create_order_from_cart/', {});
      const order = orderResponse.data;
      console.log('3. Orden creada con ID:', order.id);
      console.log('📦 Detalles de la orden creada:', JSON.stringify(order, null, 2));

      // Paso 2: Crear la sesión de checkout de Stripe en el backend
      console.log('4. Llamando a create-checkout-session...');
      console.log('📦 Request data:', { order_id: order.id });
      const sessionResponse = await api.post('/stripe/create-checkout-session/', {
        order_id: order.id
      });
      console.log('📦 Session response:', sessionResponse.data);
      console.log('📦 Session response completo:', JSON.stringify(sessionResponse.data, null, 2));
      const { url } = sessionResponse.data;
      console.log('5. URL de Stripe recibida:', url);

      // Verifica si la URL existe antes de redirigir
      if (!url) {
        throw new Error('No se recibió la URL de checkout de Stripe.');
      }

      // Paso 3: Redirigir al usuario al checkout de Stripe
      console.log('6. Redirigiendo a la URL de Stripe...');
      window.location.href = url; // Redirección directa del navegador

      // Limpia el carrito localmente DESPUÉS de iniciar la redirección
      clearCartLocally();

    } catch (error: any) {
      console.error('❌ Error durante el proceso de checkout:', error);
      console.error('📦 Error response:', error.response);
      console.error('📦 Error data:', error.response?.data);
      console.error('📦 Error status:', error.response?.status);
      console.error('📦 Error data (stringified):', JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error ||
                          error.response?.data?.message ||
                          'Error al procesar el pago. Por favor, intenta nuevamente.';
      
      console.error('📝 Error message a mostrar:', errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setCheckoutLoading(false);
      onClose(); // Cierra el drawer en cualquier caso
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2, pb: 1 }}
        >
          <Typography variant="h6">Carrito de Compras</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : !cart || cart.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Iconify icon="solar:cart-3-bold" width={64} sx={{ mb: 2, opacity: 0.3 }} />
              <Typography variant="body1" color="text.secondary">
                Tu carrito está vacío
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Agrega productos para comenzar
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {cart.items.map((item: CartItem) => {
                // Construir URL completa de Cloudinary
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                let imageUrl = '/assets/images/product/product-placeholder.svg';
                
                if (item.product.image) {
                  imageUrl = `https://res.cloudinary.com/${cloudName}/${item.product.image}`;
                } else if (item.product.image_url) {
                  imageUrl = item.product.image_url;
                }
                
                return (
                <ListItem
                  key={item.id}
                  sx={{
                    py: 2,
                    px: 0,
                    alignItems: 'flex-start',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={imageUrl}
                      variant="rounded"
                      sx={{ width: 64, height: 64, mr: 2 }}
                    />
                  </ListItemAvatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <ListItemText
                      primary={item.product.name}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        sx: { mb: 0.5 },
                      }}
                    />

                    {/* Mostrar precio con descuento si aplica */}
                    {Number(item.discount_percentage) > 0 ? (
                      <Box sx={{ 
                        bgcolor: 'success.lighter', 
                        p: 1.5, 
                        borderRadius: 1, 
                        border: '2px solid',
                        borderColor: 'success.main',
                        mt: 0.5
                      }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          <Box
                            sx={{
                              bgcolor: 'error.main',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.8rem',
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
                    ) : (
                      <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600, mt: 0.5 }}>
                        {item.product.price} Bs.
                      </Typography>
                    )}

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      {/* Control de cantidad */}
                      <IconButton
                        size="small"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Iconify icon="mingcute:close-line" width={20} />
                      </IconButton>

                      <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Iconify icon="mingcute:add-line" width={20} />
                      </IconButton>

                      <Box sx={{ flexGrow: 1 }} />

                      {/* Botón eliminar */}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                      </IconButton>
                    </Stack>

                    {/* Subtotal del item (usa precio con descuento si aplica) */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Subtotal: {(Number(item.item_price) * item.quantity).toFixed(2)} Bs.
                    </Typography>
                  </Box>
                </ListItem>
              );
              })}
            </List>
          )}
        </Box>

        {/* Footer - Solo mostrar si hay items */}
        {cart && cart.items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {/* Mostrar ahorros totales si hay descuentos */}
                {cart.items.some((item: CartItem) => item.discount_percentage > 0) && (
                  <Box sx={{ 
                    bgcolor: 'success.lighter', 
                    p: 1.5, 
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'success.main'
                  }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="success.dark" sx={{ fontWeight: 600 }}>
                        🎉 Total Ahorrado:
                      </Typography>
                      <Typography variant="h6" color="success.dark" sx={{ fontWeight: 700 }}>
                        {cart.items
                          .reduce((sum: number, item: CartItem) => 
                            sum + (Number(item.discount_amount) || 0) * item.quantity, 0
                          )
                          .toFixed(2)} Bs.
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Total */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">Total a Pagar:</Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                    {cart.total_price || '0.00'} Bs.
                  </Typography>
                </Stack>

                {/* Botón Checkout */}
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  startIcon={
                    checkoutLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Iconify icon="solar:cart-3-bold" />
                    )
                  }
                >
                  {checkoutLoading ? 'Procesando...' : 'Proceder al Pago'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={onClose}
                >
                  Seguir Comprando
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Box>
      
      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Drawer>
  );
}
