import type { Brand } from 'src/types/brand';

import { useState, useEffect } from 'react';

import {
  Box,
  Alert,
  Dialog,
  Button,
  Snackbar,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface BrandFormModalProps {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
  onSave: (data: Partial<Brand>) => Promise<void>;
}

interface BrandFormData {
  name: string;
  description: string;
  warranty_info: string;
  warranty_duration_months: number | null;
}

export default function BrandFormModal({
  open,
  brand,
  onClose,
  onSave,
}: BrandFormModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    warranty_info: '',
    warranty_duration_months: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (brand) {
      console.log('📝 Cargando marca para edición:', brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        warranty_info: brand.warranty_info || '',
        warranty_duration_months: brand.warranty_duration_months ?? null,
      });
    } else {
      console.log('➕ Preparando formulario para nueva marca');
      setFormData({
        name: '',
        description: '',
        warranty_info: '',
        warranty_duration_months: null,
      });
    }
    setError(null);
  }, [brand, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'warranty_duration_months' 
        ? (value === '' ? null : parseInt(value, 10))
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const durationMonths = formData.warranty_duration_months 
        ? parseInt(String(formData.warranty_duration_months), 10) 
        : null;

      const dataToSend: Partial<Brand> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        warranty_info: formData.warranty_info.trim() || undefined,
        warranty_duration_months: durationMonths,
      };

      console.log('📦 Datos de marca a enviar:', dataToSend);
      await onSave(dataToSend);
      
      setSuccessMessage(brand ? 'Marca actualizada exitosamente' : 'Marca creada exitosamente');
      console.log('✅ Marca guardada exitosamente');
      
      // Esperar un momento para mostrar el mensaje antes de cerrar
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('❌ Error al guardar marca:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(err.response?.data?.detail || 'Error al guardar la marca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {brand ? 'Editar Marca' : 'Nueva Marca'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              name="name"
              label="Nombre"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />

            <TextField
              name="description"
              label="Descripción"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              name="warranty_info"
              label="Información de Garantía"
              value={formData.warranty_info}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Ej: 12 meses de garantía contra defectos de fabricación"
            />

            <TextField
              name="warranty_duration_months"
              label="Duración Garantía (meses)"
              type="number"
              value={formData.warranty_duration_months ?? ''}
              onChange={handleChange}
              fullWidth
              helperText="Ej: 12 para 1 año, 24 para 2 años"
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Dialog>
  );
}
