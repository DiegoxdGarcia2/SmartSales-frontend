import type { Offer, OfferCategory, PersonalizedOffer } from 'src/types/offer';

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useCart } from 'src/contexts/CartContext';
import offerService from 'src/services/offerService';

import { Iconify } from 'src/components/iconify';
import { OfferCard } from 'src/components/offer-card/offer-card';

// ========================================
// OFFERS PAGE
// ========================================

export function OffersView() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'personalized'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [personalizedOffers, setPersonalizedOffers] = useState<PersonalizedOffer[]>([]);
  const [categories, setCategories] = useState<OfferCategory[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const isAuthenticated = !!localStorage.getItem('access_token');

  // ==================== CARGAR DATOS ====================

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Cargando ofertas públicas...');
      
      const [allResponse, featured] = await Promise.all([
        offerService.getOffers({ pageSize: 100, ordering: '-created_at' }),
        offerService.getFeaturedOffers(),
      ]);

      console.log('📦 All offers response:', allResponse);
      console.log('📦 Featured offers:', featured);

      // El backend puede devolver array directo o objeto paginado
      const offersArray = Array.isArray(allResponse) ? allResponse : allResponse.results || [];
      
      console.log('✅ Ofertas públicas cargadas:', offersArray.length);
      console.log('✅ Ofertas destacadas:', featured?.length || 0);
      
      // Extraer categorías únicas de offer_products
      const categoriesMap = new Map<number, OfferCategory>();
      offersArray.forEach(offer => {
        offer.offer_products?.forEach((op: any) => {
          if (typeof op.product === 'object' && op.product.category) {
            const cat = op.product.category;
            // Si category es un objeto (expandido), usar directamente
            if (typeof cat === 'object' && 'id' in cat && 'name' in cat) {
              if (!categoriesMap.has(cat.id)) {
                categoriesMap.set(cat.id, cat);
              }
            }
          }
        });
      });
      const extractedCategories = Array.from(categoriesMap.values());
      
      console.log('✅ Categorías extraídas:', extractedCategories.length);
      
      setAllOffers(offersArray);
      setFeaturedOffers(featured || []);
      setCategories(extractedCategories);

      // Cargar ofertas personalizadas si está autenticado
      if (isAuthenticated) {
        try {
          const personalized = await offerService.getPersonalizedOffers();
          setPersonalizedOffers(personalized);
        } catch (err: any) {
          // Si es 401, el token expiró - silenciar error
          if (err?.response?.status !== 401 && err?.response?.status !== 500) {
            console.error('Error al cargar ofertas personalizadas:', err);
          }
        }
      }
    } catch (err: any) {
      console.error('Error al cargar ofertas:', err);
      setError(err.message || 'Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // ==================== RECLAMAR OFERTA ====================

  const handleClaimOffer = async (offer: Offer) => {
    if (!isAuthenticated) {
      console.log('❌ Usuario no autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }

    try {
      console.log('🔄 Reclamando oferta desde lista:', offer.id, offer.name);

      // Extraer productos de la oferta
      const offerProducts = offer.offer_products || [];

      if (offerProducts.length === 0) {
        setError('Esta oferta no tiene productos asociados');
        console.error('❌ Oferta sin productos');
        return;
      }

      // Agregar cada producto al carrito
      let successCount = 0;
      let failCount = 0;

      for (const op of offerProducts) {
        try {
          const productId = typeof op.product === 'object' ? op.product.id : op.product;
          const productName =
            typeof op.product === 'object' ? op.product.name : op.product_name || `Producto #${productId}`;

          console.log(`➕ Agregando: ${productName}`);
          await addToCart(productId, 1, offer.discount_percentage);
          successCount++;
        } catch (productErr: any) {
          failCount++;
          console.error(`❌ Error al agregar producto:`, productErr.message);
        }
      }

      // Registrar click
      await offerService.trackClick(offer.id);

      // Mostrar resultado
      if (successCount === offerProducts.length) {
        setClaimSuccess(
          `¡Productos agregados con ${offer.discount_percentage}% de descuento! ${successCount} ${successCount === 1 ? 'producto agregado' : 'productos agregados'} al carrito.`
        );
      } else if (successCount > 0) {
        setClaimSuccess(`Productos agregados parcialmente: ${successCount} en el carrito con descuento, ${failCount} fallaron.`);
      } else {
        setError('No se pudo agregar ningún producto al carrito.');
      }

      setTimeout(() => {
        setClaimSuccess(null);
        setError(null);
      }, 6000);
    } catch (err: any) {
      console.error('❌ Error al reclamar oferta:', err);

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
    }
  };

  // ==================== FILTRAR OFERTAS ====================

  const getFilteredOffers = (): Offer[] | PersonalizedOffer[] => {
    let offers: Offer[] | PersonalizedOffer[] = [];

    if (activeTab === 'all') {
      offers = allOffers || [];
    } else if (activeTab === 'featured') {
      offers = featuredOffers || [];
    } else if (activeTab === 'personalized') {
      offers = personalizedOffers || [];
    }

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategory && offers.length > 0) {
      offers = offers.filter(offer =>
        offer.offer_products?.some((op: any) => {
          if (typeof op.product === 'object' && op.product.category) {
            const cat = op.product.category;
            // Si category es un objeto (expandido), comparar el nombre
            if (typeof cat === 'object' && 'name' in cat) {
              return cat.name === selectedCategory;
            }
          }
          return false;
        })
      );
    }

    return offers || [];
  };

  const filteredOffers = getFilteredOffers() || [];

  // ==================== RENDER ====================

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Box>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
            🎁 Ofertas Especiales
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Descubre las mejores ofertas y descuentos exclusivos
          </Typography>
        </Box>

        {/* Success Alert */}
        {claimSuccess && (
          <Alert severity="success" onClose={() => setClaimSuccess(null)}>
            {claimSuccess}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Todas las ofertas"
              value="all"
              icon={<Iconify icon={'solar:gift-bold' as any} width={20} />}
              iconPosition="start"
            />
            <Tab
              label="Destacadas"
              value="featured"
              icon={<Iconify icon={'solar:star-bold' as any} width={20} />}
              iconPosition="start"
            />
            {isAuthenticated && (
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Para ti</span>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                      }}
                    >
                      ML
                    </Box>
                  </Box>
                }
                value="personalized"
                icon={<Iconify icon={'solar:stars-bold' as any} width={20} />}
                iconPosition="start"
              />
            )}
          </Tabs>
        </Card>

        {/* Filtros por categoría */}
        {categories.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Todas"
              color={selectedCategory === null ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(null)}
              sx={{ fontWeight: 600 }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                color={selectedCategory === cat.name ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(cat.name)}
                variant="outlined"
              />
            ))}
          </Stack>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        )}

        {/* Ofertas */}
        {!loading && filteredOffers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconify icon={'solar:gift-bold' as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {activeTab === 'personalized' && !isAuthenticated
                ? 'Inicia sesión para ver ofertas personalizadas'
                : 'No hay ofertas disponibles'}
            </Typography>
            {activeTab === 'personalized' && !isAuthenticated && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/login')}
                startIcon={<Iconify icon={'solar:login-bold' as any} />}
              >
                Iniciar sesión
              </Button>
            )}
          </Box>
        )}

        {!loading && filteredOffers.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onClaim={handleClaimOffer}
                showMLBadge={activeTab === 'personalized'}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Container>
  );
}
