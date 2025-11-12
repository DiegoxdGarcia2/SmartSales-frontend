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

import offerService from 'src/services/offerService';

import { Iconify } from 'src/components/iconify';
import { OfferCard } from 'src/components/offer-card/offer-card';

// ========================================
// OFFERS PAGE
// ========================================

export function OffersView() {
  const navigate = useNavigate();

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
      const [allResponse, featured, cats] = await Promise.all([
        offerService.getOffers({ pageSize: 100, ordering: '-created_at' }),
        offerService.getFeaturedOffers(),
        offerService.getCategories(),
      ]);

      setAllOffers(allResponse.results);
      setFeaturedOffers(featured);
      setCategories(cats);

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
      navigate('/login');
      return;
    }

    try {
      await offerService.claimOffer(offer.id);
      setClaimSuccess(`¡Oferta "${offer.title}" reclamada exitosamente!`);

      setTimeout(() => {
        setClaimSuccess(null);
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al reclamar oferta');
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

    // Filtrar por categoría
    if (selectedCategory && offers) {
      offers = offers.filter((offer) => offer.category?.slug === selectedCategory);
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
                label="Para ti (ML)"
                value="personalized"
                icon={<Iconify icon={'solar:stars-bold' as any} width={20} />}
                iconPosition="start"
              />
            )}
          </Tabs>
        </Card>

        {/* Filtros por categoría */}
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
              color={selectedCategory === cat.slug ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat.slug)}
              variant="outlined"
            />
          ))}
        </Stack>

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
