import type { Offer } from 'src/types/offer';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import offerService from 'src/services/offerService';

import { OFFER_BADGE_COLORS } from 'src/types/offer';

import { Iconify } from '../iconify';

// ========================================
// OFFER BADGE COMPONENT
// ========================================

interface OfferBadgeProps {
  offer: Offer;
  size?: 'small' | 'medium' | 'large';
  variant?: 'compact' | 'full';
}

export function OfferBadge({ offer, size = 'medium', variant = 'compact' }: OfferBadgeProps) {
  const discountText = offerService.formatDiscount(offer);
  const isExpiring = offerService.isOfferExpiringSoon(offer);
  const hoursRemaining = offerService.getHoursRemaining(offer);

  const badgeColor = isExpiring ? OFFER_BADGE_COLORS.expiring : OFFER_BADGE_COLORS.active;

  if (variant === 'compact') {
    return (
      <Chip
        label={discountText}
        size={size === 'small' ? 'small' : 'medium'}
        sx={{
          bgcolor: badgeColor,
          color: 'white',
          fontWeight: 700,
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          '& .MuiChip-label': {
            px: size === 'small' ? 1 : 1.5,
          },
        }}
      />
    );
  }

  // Variant = 'full'
  return (
    <Box
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: badgeColor,
        color: 'white',
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        minWidth: 80,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {discountText}
      </Typography>
      {isExpiring && hoursRemaining > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Iconify icon={'solar:clock-circle-bold' as any} width={12} />
          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
            {hoursRemaining}h restantes
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ========================================
// SIMPLE DISCOUNT BADGE (para usar en cualquier lugar)
// ========================================

interface SimpleDiscountBadgeProps {
  discountPercentage: number;
  isExpiring?: boolean;
}

export function SimpleDiscountBadge({ discountPercentage, isExpiring }: SimpleDiscountBadgeProps) {
  return (
    <Chip
      label={`${discountPercentage}% OFF`}
      size="small"
      sx={{
        bgcolor: isExpiring ? OFFER_BADGE_COLORS.expiring : OFFER_BADGE_COLORS.active,
        color: 'white',
        fontWeight: 700,
        fontSize: '0.75rem',
      }}
    />
  );
}
