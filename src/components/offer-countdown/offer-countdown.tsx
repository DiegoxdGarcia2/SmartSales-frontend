import type { Offer } from 'src/types/offer';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import offerService from 'src/services/offerService';

import { Iconify } from '../iconify';

// ========================================
// OFFER COUNTDOWN COMPONENT
// ========================================

interface OfferCountdownProps {
  offer: Offer;
  compact?: boolean;
}

export function OfferCountdown({ offer, compact = false }: OfferCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endDate = new Date(offer.end_date);
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Expirada');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [offer.end_date]);

  const hoursRemaining = offerService.getHoursRemaining(offer);
  const isExpiring = hoursRemaining < 24;

  const color = isExpired ? 'error.main' : isExpiring ? 'warning.main' : 'text.secondary';

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Iconify icon={'solar:clock-circle-bold' as any} width={16} sx={{ color }} />
        <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
          {timeRemaining}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: isExpired ? 'error.lighter' : isExpiring ? 'warning.lighter' : 'grey.100',
        borderRadius: 1,
        px: 2,
        py: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Iconify icon={'solar:clock-circle-bold' as any} width={18} sx={{ color }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {isExpired ? 'Oferta expirada' : 'Termina en'}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ color, fontWeight: 700, lineHeight: 1 }}>
        {timeRemaining}
      </Typography>
    </Box>
  );
}
