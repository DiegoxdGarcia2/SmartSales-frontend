import type { Review } from 'src/types/review';
import type { Product } from 'src/types/product';

import { useParams } from 'react-router';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import api from 'src/utils/api';

import { useCart } from 'src/contexts/CartContext';

import { Iconify } from 'src/components/iconify';

import { ProductReviews } from '../product-reviews';

// ----------------------------------------------------------------------

export function ProductDetailView() {
  const { productId } = useParams<{ productId: string }>();
  const { addToCart, loading: cartLoading } = useCart();

  // DEBUG: Verificar que el parámetro de la URL se está capturando
  console.log('🔍 ProductDetailView - productId capturado de la URL:', productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;

      try {
        console.log('Obteniendo producto:', productId);
        const response = await api.get<Product>(`/products/${productId}/`);
        console.log('Producto obtenido:', response.data);
        setProduct(response.data);

        // Cargar reseñas del producto
        console.log('Obteniendo reseñas del producto:', productId);
        const reviewsResponse = await api.get<Review[]>(`/reviews/?product_id=${productId}`);
        console.log('Reseñas obtenidas:', reviewsResponse.data);
        setReviews(reviewsResponse.data);
      } catch (err: any) {
        console.error('Error al obtener producto:', err);
        const errorMsg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Error al cargar el producto';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, quantity);
      setSnackbarMessage(`${quantity} producto(s) agregado(s) al carrito`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error al agregar al carrito:', err);
      // El CartContext ya procesa el mensaje de error específico
      const errorMsg =
        err.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al agregar al carrito';
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Permitir campo vacío mientras el usuario escribe
    if (value === '') {
      setQuantity(1);
      return;
    }

    const numValue = parseInt(value, 10);
    
    // Validar que sea un número válido
    if (Number.isNaN(numValue)) {
      return;
    }

    // Validar límites
    if (numValue < 1) {
      setSnackbarMessage('La cantidad mínima es 1');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setQuantity(1);
      return;
    }

    if (product && numValue > product.stock) {
      setSnackbarMessage(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setQuantity(product.stock);
      return;
    }

    setQuantity(numValue);
  };

  const handleIncrement = () => {
    if (!product) return;
    
    if (quantity >= product.stock) {
      setSnackbarMessage(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    } else {
      setSnackbarMessage('La cantidad mínima es 1');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="warning">Producto no encontrado</Alert>
      </Container>
    );
  }

  const brandObj = typeof product.brand === 'object' ? product.brand : null;

  // Calcular rating promedio
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Construir URL completa de Cloudinary
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  let imageUrl = '/assets/images/product/product-placeholder.svg';
  
  if (product.image) {
    imageUrl = `https://res.cloudinary.com/${cloudName}/${product.image}`;
    console.log('🖼️ URL de imagen construida:', imageUrl);
  } else if (product.image_url) {
    imageUrl = product.image_url;
  }

  return (
    <Container sx={{ py: 5 }}>
      <Grid container spacing={3}>
        {/* Columna de Imagen */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              width: '100%',
              paddingTop: '100%',
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'grey.200',
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={product.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        </Grid>

        {/* Columna de Detalles */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={3}>
            <Typography variant="h4">{product.name}</Typography>

            {/* Rating promedio */}
            {reviews.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={averageRating} readOnly precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                </Typography>
              </Box>
            )}

            <Typography variant="h5" sx={{ color: 'primary.main' }}>
              {product.price} Bs.
            </Typography>

            <Chip
              label={product.stock > 0 ? `${product.stock} disponibles` : 'Sin Stock'}
              color={product.stock > 0 ? 'success' : 'error'}
              sx={{ width: 'fit-content' }}
            />

            {product.description && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Descripción:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {product.description}
                </Typography>
              </Box>
            )}

            {brandObj && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Marca: <Typography component="span" variant="body1">{brandObj.name}</Typography>
                </Typography>
                {brandObj.warranty_info && (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Garantía: {brandObj.warranty_info}
                  </Typography>
                )}
              </Box>
            )}

            {/* Controles para Carrito */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Cantidad:
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Control de Cantidad con botones +/- */}
                <Stack direction="row" spacing={0} alignItems="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    sx={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: '8px 0 0 8px',
                      borderRight: 'none',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    −
                  </Button>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={product.stock <= 0}
                    inputProps={{
                      min: 1,
                      max: product.stock,
                      style: { textAlign: 'center' },
                    }}
                    sx={{
                      width: 80,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderLeft: 'none',
                          borderRight: 'none',
                        },
                      },
                      '& input': {
                        padding: '8px 4px',
                        fontSize: '1rem',
                        fontWeight: 600,
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    sx={{
                      minWidth: 36,
                      height: 36,
                      borderRadius: '0 8px 8px 0',
                      borderLeft: 'none',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    +
                  </Button>
                </Stack>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock <= 0}
                  startIcon={<Iconify icon="solar:cart-3-bold" />}
                  sx={{ flexGrow: 1 }}
                >
                  Agregar al Carrito
                </Button>
              </Stack>
              
              {product.stock > 0 && product.stock <= 5 && (
                <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block' }}>
                  ⚠️ Solo quedan {product.stock} unidades disponibles
                </Typography>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* Sección de Reseñas */}
      <Divider sx={{ my: 5 }} />
      
      <ProductReviews reviews={reviews} />

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
    </Container>
  );
}
