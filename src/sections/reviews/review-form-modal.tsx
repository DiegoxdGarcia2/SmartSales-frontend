import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import api from 'src/utils/api';

// ----------------------------------------------------------------------

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
  onReviewSubmit: () => void;
}

export function ReviewFormModal({
  open,
  onClose,
  productId,
  productName,
  onReviewSubmit,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // Validar rating
    if (!rating || rating <= 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📝 Enviando reseña:', { product: productId, rating, comment });

      await api.post('/products/reviews/', {
        product: productId,
        rating,
        comment: comment.trim() || null,
      });

      console.log('✅ Reseña enviada exitosamente');

      // Resetear formulario
      setRating(0);
      setComment('');

      // Notificar éxito
      onReviewSubmit();
      onClose();
    } catch (err: any) {
      console.error('❌ Error al enviar reseña:', err);

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al enviar la reseña';

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dejar una reseña para {productName}</DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Calificación *
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
              setError(null);
            }}
            size="large"
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia con este producto..."
            sx={{ mt: 3 }}
          />

          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Reseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
