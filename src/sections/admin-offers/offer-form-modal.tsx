import type { Offer, OfferType } from 'src/types/offer';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Switch, FormControlLabel } from '@mui/material';

// ========================================
// OFFER FORM MODAL
// ========================================

interface OfferFormModalProps {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
  onSave: (offerData: Partial<Offer>) => Promise<void>;
}

const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: 'percentage', label: '📊 Porcentaje' },
  { value: 'fixed_amount', label: '� Monto Fijo' },
  { value: 'buy_x_get_y', label: '🎁 Compra X Lleva Y' },
  { value: 'free_shipping', label: '🚚 Envío Gratis' },
];

export function OfferFormModal({ open, offer, onClose, onSave }: OfferFormModalProps) {
  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    description: '',
    offer_type: 'percentage',
    discount_value: 0,
    start_date: '',
    end_date: '',
    is_active: false,
    is_featured: false,
    max_uses: null,
    max_uses_per_user: 1,
    min_purchase_amount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title,
        description: offer.description,
        offer_type: offer.offer_type,
        discount_value: offer.discount_value,
        start_date: offer.start_date.split('T')[0],
        end_date: offer.end_date.split('T')[0],
        is_active: offer.is_active,
        is_featured: offer.is_featured,
        max_uses: offer.max_uses,
        max_uses_per_user: offer.max_uses_per_user,
        min_purchase_amount: offer.min_purchase_amount,
      });
    } else {
      // Valores por defecto para nueva oferta
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      setFormData({
        title: '',
        description: '',
        offer_type: 'percentage',
        discount_value: 20,
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
        is_active: false,
        is_featured: false,
        max_uses: null,
        max_uses_per_user: 1,
        min_purchase_amount: 0,
      });
    }
  }, [offer]);

  const handleChange = (field: keyof Offer, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convertir fechas a formato ISO completo
      const dataToSend = {
        ...formData,
        start_date: `${formData.start_date}T00:00:00Z`,
        end_date: `${formData.end_date}T23:59:59Z`,
      };

      await onSave(dataToSend);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al guardar oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{offer ? '✏️ Editar Oferta' : '➕ Nueva Oferta'}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Título */}
          <TextField
            label="Título de la Oferta"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
            required
            placeholder="Ej: Black Friday 2025"
          />

          {/* Descripción */}
          <TextField
            label="Descripción"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe los detalles de la oferta..."
          />

          {/* Tipo de Oferta */}
          <FormControl fullWidth>
            <InputLabel>Tipo de Oferta</InputLabel>
            <Select
              value={formData.offer_type}
              label="Tipo de Oferta"
              onChange={(e) => handleChange('offer_type', e.target.value as OfferType)}
            >
              {OFFER_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Valor de Descuento */}
          <TextField
            label={
              formData.offer_type === 'percentage'
                ? 'Porcentaje de Descuento'
                : 'Monto de Descuento'
            }
            type="number"
            value={formData.discount_value}
            onChange={(e) => handleChange('discount_value', parseFloat(e.target.value))}
            fullWidth
            required
            inputProps={{
              min: 0,
              max: formData.offer_type === 'percentage' ? 100 : undefined,
              step: formData.offer_type === 'percentage' ? 5 : 10,
            }}
            helperText={
              formData.offer_type === 'percentage'
                ? '0-100%'
                : 'Monto en dólares'
            }
          />

          {/* Switches */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active || false}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
              }
              label="✅ Oferta Activa"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_featured || false}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                />
              }
              label="⭐ Destacada"
            />
          </Box>

          {/* Fechas */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Fecha de Inicio"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Fecha de Fin"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Límites */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <TextField
              label="Usos Máximos"
              type="number"
              value={formData.max_uses ?? ''}
              onChange={(e) =>
                handleChange('max_uses', e.target.value === '' ? null : parseInt(e.target.value, 10))
              }
              fullWidth
              inputProps={{ min: 0 }}
              helperText="Vacío = ilimitado"
              placeholder="Ilimitado"
            />

            <TextField
              label="Usos por Usuario"
              type="number"
              value={formData.max_uses_per_user}
              onChange={(e) => handleChange('max_uses_per_user', parseInt(e.target.value, 10))}
              fullWidth
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Compra Mínima ($)"
              type="number"
              value={formData.min_purchase_amount}
              onChange={(e) => handleChange('min_purchase_amount', parseFloat(e.target.value))}
              fullWidth
              inputProps={{ min: 0, step: 10 }}
            />
          </Box>

          {/* Error */}
          {error && (
            <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1, color: 'error.main' }}>
              {error}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : offer ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
