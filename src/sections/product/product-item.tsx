import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { useCart } from 'src/contexts/CartContext';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ColorPreview } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  stock: number;
  coverUrl: string;
  colors: string[];
  priceSale: number | null;
};

export function ProductItem({ product }: { product: ProductItemProps }) {
  const { addToCart, loading: cartLoading } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // DEBUG: Verificar que el product.id esté disponible
  console.log('🔍 ProductItem - ID del producto:', product.id, 'Tipo:', typeof product.id);
  
  // DEBUG: Verificar la URL generada
  const productUrl = `/product/${product.id}`;
  console.log('🔍 ProductItem - URL generada:', productUrl);

  const handleAddToCart = async () => {
    if (!product?.id) return;
    
    try {
      await addToCart(Number(product.id), 1);
      setSnackbarMessage('Producto agregado al carrito');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error al agregar al carrito:', error);
      // El CartContext ya procesa el mensaje de error específico
      const errorMsg = error.message || 
                      error.response?.data?.error ||
                      error.response?.data?.detail || 
                      error.response?.data?.message ||
                      'Error al agregar al carrito';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const renderStockLabel = (
    <Label
      variant="filled"
      color={product.stock > 0 ? 'success' : 'error'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.stock > 0 ? 'En Stock' : 'Sin Stock'}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product.name}
      src={product.coverUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.priceSale && fCurrency(product.priceSale)}
      </Typography>
      &nbsp;
      {fCurrency(product.price)}
    </Typography>
  );

  return (
    <Card>
      <RouterLink
        to={productUrl}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Box sx={{ pt: '100%', position: 'relative' }}>
          {renderStockLabel}
          {renderImg}
        </Box>
      </RouterLink>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link
          component={RouterLink}
          to={productUrl}
          color="inherit"
          underline="hover"
          variant="subtitle2"
          noWrap
        >
          {product.name}
        </Link>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ColorPreview colors={product.colors} />
          {renderPrice}
        </Box>

        <Tooltip 
          title={product.stock <= 0 ? 'Producto sin stock' : 'Agregar al Carrito'} 
          arrow
        >
          <span>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock <= 0}
              startIcon={<Iconify icon="solar:cart-3-bold" />}
            >
              {product.stock <= 0 ? 'Sin Stock' : cartLoading ? 'Agregando...' : 'Agregar al Carrito'}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: snackbarSeverity === 'success' ? 'success.main' : 'error.main',
          },
        }}
      />
    </Card>
  );
}
