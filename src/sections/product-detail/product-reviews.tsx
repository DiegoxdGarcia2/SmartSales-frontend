import type { Review } from 'src/types/review';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ProductReviewsProps {
  reviews: Review[];
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Este producto aún no tiene reseñas.
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Sé el primero en dejar una reseña después de tu compra.
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Reseñas de Clientes ({reviews.length})
      </Typography>

      {reviews.map((review, index) => (
        <Box key={review.id}>
          <Card sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {/* Avatar con inicial del usuario */}
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48,
                }}
              >
                {review.user.charAt(0).toUpperCase()}
              </Avatar>

              {/* Contenido de la reseña */}
              <Box sx={{ flexGrow: 1 }}>
                {/* Usuario, Sentimiento y fecha */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2">{review.user}</Typography>
                    
                    {/* Chip de Sentimiento */}
                    {review.sentiment && (() => {
                      let sentimentColor: 'success' | 'warning' | 'error' | 'default' = 'default';
                      let sentimentIcon: 'solar:check-circle-bold' | 'solar:chat-round-dots-bold' | 'solar:trash-bin-trash-bold' = 'solar:chat-round-dots-bold';

                      if (review.sentiment === 'POSITIVO') {
                        sentimentColor = 'success';
                        sentimentIcon = 'solar:check-circle-bold';
                      } else if (review.sentiment === 'NEGATIVO') {
                        sentimentColor = 'error';
                        sentimentIcon = 'solar:trash-bin-trash-bold';
                      } else if (review.sentiment === 'NEUTRO') {
                        sentimentColor = 'warning';
                        sentimentIcon = 'solar:chat-round-dots-bold';
                      }

                      return (
                        <Chip
                          icon={<Iconify icon={sentimentIcon} width={16} />}
                          label={review.sentiment}
                          size="small"
                          color={sentimentColor}
                          variant="outlined"
                        />
                      );
                    })()}
                  </Stack>
                  
                  <Typography variant="caption" color="text.disabled">
                    {fDate(review.created_at)}
                  </Typography>
                </Box>

                {/* Rating */}
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1.5 }} />

                {/* Comentario */}
                {review.comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {review.comment}
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>

          {index < reviews.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}
