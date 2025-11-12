import type { Offer } from 'src/types/offer';

import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import offerService from 'src/services/offerService';

import { OFFER_TYPE_ICONS, OFFER_BADGE_COLORS } from 'src/types/offer';

import { Iconify } from '../iconify';
import { OfferBadge } from '../offer-badge/offer-badge';
import { OfferCountdown } from '../offer-countdown/offer-countdown';

// ========================================
// OFFER CARD COMPONENT
// ========================================

interface OfferCardProps {
  offer: Offer;
  onClaim?: (offer: Offer) => void;
  showMLBadge?: boolean;
}

export function OfferCard({ offer, onClaim, showMLBadge = false }: OfferCardProps) {
  const navigate = useNavigate();

  const isExpiring = offerService.isOfferExpiringSoon(offer);
  const isValid = offerService.isOfferValid(offer);
  const hasMLRecommendation = offer.ml_confidence_score && offer.ml_confidence_score > 0.8;

  const handleViewDetails = () => {
    navigate(`/offers/${offer.id}`);
  };

  const handleClaimOffer = () => {
    if (onClaim) {
      onClaim(offer);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {/* Badge de recomendación ML */}
      {showMLBadge && hasMLRecommendation && (
        <Chip
          icon={<Iconify icon={'solar:stars-bold' as any} width={16} />}
          label="Recomendado para ti"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: OFFER_BADGE_COLORS.ml_recommended,
            color: 'white',
            fontWeight: 600,
            zIndex: 1,
          }}
        />
      )}

      {/* Badge de oferta destacada */}
      {offer.is_featured && (
        <Chip
          icon={<Iconify icon={'solar:crown-bold' as any} width={16} />}
          label="Destacada"
          size="small"
          color="warning"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontWeight: 600,
            zIndex: 1,
          }}
        />
      )}

      {/* Imagen de la oferta */}
      <Box
        sx={{
          position: 'relative',
          pt: '56.25%', // 16:9 aspect ratio
          bgcolor: 'grey.200',
          backgroundImage: offer.image_url
            ? `url(${offer.image_url})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Badge de descuento */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
          }}
        >
          <OfferBadge offer={offer} size="large" variant="full" />
        </Box>

        {/* Countdown si está por expirar */}
        {isExpiring && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
            }}
          >
            <OfferCountdown offer={offer} compact />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          {/* Categoría */}
          {offer.category && (
            <Chip
              label={offer.category.name}
              size="small"
              variant="outlined"
              sx={{ width: 'fit-content' }}
            />
          )}

          {/* Título */}
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {offer.title}
          </Typography>

          {/* Descripción */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {offer.description}
          </Typography>

          {/* Información adicional */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {/* Compra mínima */}
            {offer.min_purchase_amount > 0 && (
              <Chip
                icon={<Iconify icon={'solar:dollar-bold' as any} width={14} />}
                label={`Mín. $${offer.min_purchase_amount}`}
                size="small"
                variant="outlined"
              />
            )}

            {/* Usos limitados */}
            {offer.max_uses && (
              <Chip
                icon={<Iconify icon={'solar:users-group-rounded-bold' as any} width={14} />}
                label={`${offer.current_usage_count}/${offer.max_uses} usados`}
                size="small"
                variant="outlined"
                color={offer.current_usage_count >= offer.max_uses * 0.8 ? 'warning' : 'default'}
              />
            )}

            {/* Tipo de oferta */}
            <Chip
              icon={<Iconify icon={OFFER_TYPE_ICONS[offer.offer_type] as any} width={14} />}
              label={offer.offer_type.replace('_', ' ')}
              size="small"
              variant="outlined"
            />
          </Stack>

          {/* Estado */}
          {!isValid && (
            <Chip
              label="No disponible"
              size="small"
              color="error"
              sx={{ width: 'fit-content', fontWeight: 600 }}
            />
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} width="100%">
          <Button
            variant="outlined"
            size="small"
            onClick={handleViewDetails}
            sx={{ flex: 1 }}
            startIcon={<Iconify icon={'solar:eye-bold' as any} />}
          >
            Ver detalle
          </Button>
          {isValid && onClaim && (
            <Button
              variant="contained"
              size="small"
              onClick={handleClaimOffer}
              sx={{ flex: 1 }}
              startIcon={<Iconify icon={'solar:gift-bold' as any} />}
            >
              Reclamar
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
