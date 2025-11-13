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

import { OFFER_TYPE_ICONS } from 'src/types/offer';

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
      onClick={handleViewDetails}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {/* Badge de oferta destacada */}
      {offer.priority >= 5 && (
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
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

          {/* Nombre */}
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {offer.name}
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

          {/* Productos incluidos */}
          {offer.offer_products && offer.offer_products.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Productos ({offer.offer_products.length}):
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {offer.offer_products.slice(0, 3).map((op) => {
                  // El backend puede devolver el product expandido o solo el ID
                  const productData = typeof op.product === 'object' ? op.product : null;
                  const productId = typeof op.product === 'object' ? op.product.id : op.product;
                  const productName = productData?.name || op.product_name || `Producto #${productId}`;

                  return (
                    <Chip
                      key={op.id}
                      label={productName}
                      size="small"
                      variant="filled"
                      sx={{ 
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  );
                })}
                {offer.offer_products.length > 3 && (
                  <Chip
                    label={`+${offer.offer_products.length - 3} más`}
                    size="small"
                    variant="filled"
                    sx={{ 
                      bgcolor: 'grey.300',
                      color: 'text.secondary',
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

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
                label={`${offer.conversions_count}/${offer.max_uses} usados`}
                size="small"
                variant="outlined"
                color={offer.conversions_count >= offer.max_uses * 0.8 ? 'warning' : 'default'}
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
            onClick={(e) => {
              e.stopPropagation(); // Prevenir doble navegación
              handleViewDetails();
            }}
            sx={{ flex: 1 }}
            startIcon={<Iconify icon={'solar:eye-bold' as any} />}
          >
            Ver detalle
          </Button>
          {isValid && onClaim && (
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // Prevenir navegación al agregar
                handleClaimOffer();
              }}
              sx={{ flex: 1 }}
              startIcon={<Iconify icon={'solar:cart-plus-bold' as any} />}
            >
              Agregar
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
