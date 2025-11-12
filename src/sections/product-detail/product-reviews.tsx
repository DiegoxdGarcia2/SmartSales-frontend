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
                    
                    {/* Chip de Sentimiento con IA */}
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
                          label={`${review.sentiment} ${review.sentiment_confidence ? `(${(review.sentiment_confidence * 100).toFixed(0)}%)` : ''}`}
                          size="small"
                          color={sentimentColor}
                          variant="outlined"
                        />
                      );
                    })()}

                    {/* Badge de AI */}
                    {review.sentiment_summary && (
                      <Chip
                        icon={<Iconify icon={"solar:user-speak-rounded-bold" as any} width={14} />}
                        label="Gemini IA"
                        size="small"
                        sx={{ bgcolor: 'info.lighter', color: 'info.dark', fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                  
                  <Typography variant="caption" color="text.disabled">
                    {fDate(review.created_at)}
                  </Typography>
                </Box>

                {/* Rating */}
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1.5 }} />

                {/* Resumen de IA */}
                {review.sentiment_summary && (
                  <Box
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                      <Iconify icon={"solar:cpu-bolt-bold" as any} width={16} color="primary.main" />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                        Análisis IA:
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'primary.darker', fontStyle: 'italic' }}>
                      {review.sentiment_summary}
                    </Typography>
                  </Box>
                )}

                {/* Comentario original */}
                {review.comment && (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                    {review.comment}
                  </Typography>
                )}

                {/* Aspectos evaluados (Calidad, Valor, Entrega) */}
                {(review.aspect_quality || review.aspect_value || review.aspect_delivery) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Aspectos Evaluados:
                    </Typography>
                    <Stack direction="row" spacing={3} flexWrap="wrap">
                      {review.aspect_quality && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">
                            Calidad
                          </Typography>
                          <Rating value={review.aspect_quality} readOnly size="small" />
                        </Box>
                      )}
                      {review.aspect_value && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">
                            Precio/Valor
                          </Typography>
                          <Rating value={review.aspect_value} readOnly size="small" />
                        </Box>
                      )}
                      {review.aspect_delivery && (
                        <Box>
                          <Typography variant="caption" color="text.disabled" display="block">
                            Entrega
                          </Typography>
                          <Rating value={review.aspect_delivery} readOnly size="small" />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Keywords */}
                {review.keywords && review.keywords.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                      Palabras clave:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {review.keywords.map((keyword, idx) => (
                        <Chip
                          key={idx}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', bgcolor: 'grey.100' }}
                        />
                      ))}
                    </Stack>
                  </Box>
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
