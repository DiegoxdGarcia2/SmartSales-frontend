import type { Offer } from 'src/types/offer';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useCart } from 'src/contexts/CartContext';
import offerService from 'src/services/offerService';

import { Iconify } from 'src/components/iconify';
import { OfferBadge } from 'src/components/offer-badge/offer-badge';
import { OfferCountdown } from 'src/components/offer-countdown/offer-countdown';

import { OFFER_TYPE_LABELS, OFFER_STATUS_LABELS, OFFER_STATUS_COLORS } from 'src/types/offer';

// ========================================
// OFFER DETAIL VIEW
// ========================================

export function OfferDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');
  const { addToCart } = useCart();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const loadOffer = async () => {
      if (!id) return;

      try {
        setLoading(true);
        console.log('🔄 Cargando detalle de oferta:', id);
        const data = await offerService.getOffer(Number(id));
        console.log('✅ Oferta cargada:', data);
        setOffer(data);

        // Track view
        await offerService.trackView(Number(id));
      } catch (err: any) {
        console.error('❌ Error al cargar oferta:', err);
        setError(err.response?.data?.detail || 'Oferta no encontrada');
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [id]);

  const handleClaimOffer = async () => {
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }

    if (!offer) return;

    try {
      setClaiming(true);
      console.log('🔄 Reclamando oferta:', offer.id, offer.name);
      console.log('📦 Productos en la oferta:', offer.offer_products);

      // Extraer productos de la oferta
      const offerProducts = offer.offer_products || [];

      if (offerProducts.length === 0) {
        setError('Esta oferta no tiene productos asociados');
        console.error('❌ Oferta sin productos');
        return;
      }

      // Agregar cada producto al carrito con cantidad 1
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const op of offerProducts) {
        try {
          // Obtener ID del producto (maneja productos expandidos)
          const productId = typeof op.product === 'object' ? op.product.id : op.product;
          const productName =
            typeof op.product === 'object' ? op.product.name : op.product_name || `Producto #${productId}`;

          console.log(`➕ Agregando al carrito: ${productName} (ID: ${productId})`);

          // Agregar al carrito con descuento de la oferta
          await addToCart(productId, 1, offer.discount_percentage);
          successCount++;
          console.log(`✅ Producto agregado con ${offer.discount_percentage}% descuento: ${productName}`);
        } catch (productErr: any) {
          failCount++;
          const productName =
            typeof op.product === 'object' ? op.product.name : op.product_name || `Producto #${op.product}`;
          const errorMsg = productErr.message || 'Error desconocido';
          errors.push(`${productName}: ${errorMsg}`);
          console.error(`❌ Error al agregar ${productName}:`, errorMsg);
        }
      }

      // Registrar click en la oferta
      await offerService.trackClick(offer.id);

      // Mostrar resultado
      if (successCount === offerProducts.length) {
        // Todos los productos agregados exitosamente
        setClaimSuccess(
          `¡Productos agregados con ${offer.discount_percentage}% de descuento! ${successCount} ${successCount === 1 ? 'producto agregado' : 'productos agregados'} al carrito.`
        );

        // No redirigir, dejar que el usuario revise el carrito cuando quiera
      } else if (successCount > 0) {
        // Algunos productos agregados, otros fallaron
        setClaimSuccess(
          `Productos agregados parcialmente con descuento: ${successCount} productos en el carrito, ${failCount} fallaron.`
        );

        if (errors.length > 0) {
          setError(`Errores: ${errors.join(', ')}`);
        }
      } else {
        // Ningún producto pudo ser agregado
        setError(`No se pudo agregar ningún producto al carrito. ${errors.join(', ')}`);
      }
    } catch (err: any) {
      console.error('❌ Error al reclamar oferta:', err);

      // Extraer mensaje de error más específico
      let errorMessage = 'Error al reclamar oferta';

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = data[firstKey][0];
          } else if (firstKey) {
            errorMessage = data[firstKey];
          }
        }
      }

      setError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const handleBack = () => {
    navigate('/offers');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  if (error || !offer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Iconify icon={'solar:box-bold' as any} width={64} sx={{ color: 'error.main', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2 }}>
            {error || 'Oferta no encontrada'}
          </Typography>
          <Button variant="contained" onClick={handleBack} startIcon={<Iconify icon={'solar:arrow-left-bold' as any} />}>
            Volver a ofertas
          </Button>
        </Box>
      </Container>
    );
  }

  const isExpiring = offerService.isOfferExpiringSoon(offer);
  const isValid = offerService.isOfferValid(offer);

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Back Button */}
        <Button
          variant="text"
          startIcon={<Iconify icon={'solar:arrow-left-bold' as any} />}
          onClick={handleBack}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a ofertas
        </Button>

        {/* Success Alert */}
        {claimSuccess && (
          <Alert severity="success" onClose={() => setClaimSuccess(null)}>
            {claimSuccess}
          </Alert>
        )}

        {/* Error Alert */}
        {error && !claimSuccess && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Offer Info */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              {/* Hero Section */}
              <Box
                sx={{
                  position: 'relative',
                  pt: '40%',
                  bgcolor: 'grey.200',
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Badge de descuento */}
                <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
                  <OfferBadge offer={offer} size="large" variant="full" />
                </Box>

                {/* Badge destacada */}
                {offer.priority >= 5 && (
                  <Chip
                    icon={<Iconify icon={'solar:crown-bold' as any} width={20} />}
                    label="Oferta Destacada"
                    color="warning"
                    sx={{
                      position: 'absolute',
                      top: 24,
                      right: 24,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      height: 32,
                    }}
                  />
                )}

                {/* Countdown si está por expirar */}
                {isExpiring && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 24,
                      right: 24,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <OfferCountdown offer={offer} />
                  </Box>
                )}
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Title & Status */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {offer.name}
                    </Typography>
                    <Chip
                      label={OFFER_STATUS_LABELS[offer.status]}
                      color={OFFER_STATUS_COLORS[offer.status]}
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  <Divider />

                  {/* Description */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      📝 Descripción
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {offer.description}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Offer Details */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      📋 Detalles de la oferta
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Tipo de oferta
                          </Typography>
                          <Chip
                            label={OFFER_TYPE_LABELS[offer.offer_type]}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Descuento
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                            {offer.discount_percentage}% OFF
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha de inicio
                          </Typography>
                          <Typography variant="body2">
                            {new Date(offer.start_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha de finalización
                          </Typography>
                          <Typography variant="body2">
                            {new Date(offer.end_date).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Stack>
                      </Grid>
                      {offer.min_purchase_amount > 0 && (
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Compra mínima
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ${offer.min_purchase_amount}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                      {offer.max_uses && (
                        <Grid size={{ xs: 6 }}>
                          <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Usos disponibles
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {offer.max_uses - offer.conversions_count} de {offer.max_uses}
                            </Typography>
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Products */}
                  {offer.offer_products && offer.offer_products.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        🛍️ Productos incluidos ({offer.offer_products.length})
                      </Typography>
                      <Stack spacing={1}>
                        {offer.offer_products.map((op) => {
                          // El backend puede devolver el product expandido o solo el ID
                          const productData = typeof op.product === 'object' ? op.product : null;
                          const productId = typeof op.product === 'object' ? op.product.id : op.product;
                          const productName = productData?.name || op.product_name || `Producto #${productId}`;
                          const productPrice = productData?.price;

                          return (
                            <Card key={op.id} variant="outlined" sx={{ p: 2 }}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 1,
                                    bgcolor: 'primary.lighter',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Iconify icon={'solar:box-bold' as any} width={24} sx={{ color: 'primary.main' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {productName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {productId}
                                    {productPrice && ` • Precio: $${productPrice}`}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`-${offer.discount_percentage}%`}
                                  color="success"
                                  size="small"
                                  sx={{ fontWeight: 600 }}
                                />
                              </Stack>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Action Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Discount Highlight */}
                  <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                    <Typography variant="h2" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      {offer.discount_percentage}%
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      DE DESCUENTO
                    </Typography>
                  </Box>

                  {/* Stats */}
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={'solar:eye-bold' as any} width={20} sx={{ color: 'info.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {offer.views_count} vistas
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={'solar:cursor-bold' as any} width={20} sx={{ color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {offer.clicks_count} clics
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={'solar:check-circle-bold' as any} width={20} sx={{ color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {offer.conversions_count} conversiones
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* Action Button */}
                  {!isValid ? (
                    <Alert severity="error">Oferta no disponible</Alert>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleClaimOffer}
                      disabled={claiming}
                      startIcon={
                        claiming ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Iconify icon={'solar:cart-plus-bold' as any} />
                        )
                      }
                      sx={{ py: 1.5 }}
                    >
                      {claiming ? 'Agregando productos...' : 'Agregar al carrito'}
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>Inicia sesión</strong> para reclamar esta oferta
                      </Typography>
                    </Alert>
                  )}

                  {/* Share */}
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<Iconify icon={'solar:share-bold' as any} />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setClaimSuccess('¡Enlace copiado al portapapeles!');
                      setTimeout(() => setClaimSuccess(null), 3000);
                    }}
                  >
                    Compartir oferta
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
